#!/usr/bin/env bun
import https from 'https';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ES_VERSIONS, MDN_URLS, FEATURE_PATTERNS } from 'fast-brake';
import type { BrowserVersions, Feature, SchemaJson } from 'fast-brake';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Main generator function
async function generateSchema(): Promise<void> {
  console.log('Fetching MDN Browser Compat Data...');
  
  const allFeatures: Feature[] = [];
  
  for (const url of MDN_URLS) {
    console.log(`Fetching ${url.split('/').pop()}...`);
    try {
      const data = await fetchData(url);
      const category = url.split('/').pop()?.replace('.json', '') || '';
      const features = extractFeatures(data, category);
      allFeatures.push(...features);
    } catch (error) {
      console.error(`Error fetching ${url}:`, (error as Error).message);
    }
  }
  
  console.log(`Extracted ${allFeatures.length} features`);
  
  // Group features by ES version
  const featuresByVersion: Record<string, Feature[]> = {};
  for (const feature of allFeatures) {
    if (!featuresByVersion[feature.esVersion]) {
      featuresByVersion[feature.esVersion] = [];
    }
    featuresByVersion[feature.esVersion].push(feature);
  }
  
  // Create pattern groups for each ES version
  const patternsByVersion: Record<string, string> = {};
  for (const [version, features] of Object.entries(featuresByVersion)) {
    const patterns = features
      .filter(f => f.pattern)
      .map(f => f.pattern);
    
    if (patterns.length > 0) {
      // Combine patterns with alternation
      patternsByVersion[version] = new RegExp(patterns.join('|'), 'g').source;
    }
  }
  
  // Generate schema.json
  const schemaJson: SchemaJson = {
    features: allFeatures,
    featuresByVersion,
    patternsByVersion,
    esVersions: Object.keys(ES_VERSIONS)
  };
  
  writeFileSync(
    join(__dirname, '../src/schema.json'),
    JSON.stringify(schemaJson, null, 2)
  );
  
  // Generate schema.js
  const schemaJs = generateSchemaJS(featuresByVersion, patternsByVersion);
  
  writeFileSync(
    join(__dirname, '../src/schema.js'),
    schemaJs
  );
  
  console.log('Schema generation complete!');
  console.log(`- Generated src/schema.json (${allFeatures.length} features)`);
  console.log(`- Generated src/schema.js`);
}

// Fetch data from URL
function fetchData(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Parse version string to number
function parseVersion(version?: string): number {
  if (!version || version === 'preview') return Infinity;
  const match = version.match(/^(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : Infinity;
}

// Determine ES version from browser support
function getESVersion(support: any): string {
  if (!support) return 'esnext';
  
  const chromeVersion = parseVersion(support.chrome?.version_added);
  const firefoxVersion = parseVersion(support.firefox?.version_added);
  const safariVersion = parseVersion(support.safari?.version_added);
  
  // Check each ES version from newest to oldest
  const entries = Object.entries(ES_VERSIONS) as [string, BrowserVersions][];
  for (const [esVersion, requirements] of entries.reverse()) {
    if (chromeVersion >= requirements.chrome &&
        firefoxVersion >= requirements.firefox &&
        safariVersion >= requirements.safari) {
      return esVersion;
    }
  }
  
  return 'es5';
}

// Extract features from MDN data
function extractFeatures(data: any, category: string): Feature[] {
  const features: Feature[] = [];
  
  function traverse(obj: any, path: string[] = []): void {
    for (const [key, value] of Object.entries(obj)) {
      if (key === '__compat' && (value as any).support) {
        const featureName = path.join('.');
        const esVersion = getESVersion((value as any).support);
        
        // Try to find a matching pattern
        let pattern: string | null = null;
        const simpleName = featureName.toLowerCase().replace(/[._]/g, '_');
        if (FEATURE_PATTERNS[simpleName]) {
          pattern = FEATURE_PATTERNS[simpleName].source;
        }
        
        features.push({
          name: featureName,
          category,
          esVersion,
          pattern,
          mdn_url: (value as any).mdn_url,
          description: (value as any).description
        });
      } else if (typeof value === 'object' && value !== null && key !== '__compat') {
        traverse(value, [...path, key]);
      }
    }
  }
  
  traverse(data);
  return features;
}

// Generate schema.js content
function generateSchemaJS(featuresByVersion: Record<string, Feature[]>, patternsByVersion: Record<string, string>): string {
  return `// Auto-generated from MDN Browser Compat Data
// Do not edit manually

export const ES_VERSIONS = ${JSON.stringify(Object.keys(ES_VERSIONS), null, 2)};

export const FEATURE_PATTERNS = ${JSON.stringify(patternsByVersion, null, 2)};

export const FEATURES_BY_VERSION = ${JSON.stringify(
  Object.fromEntries(
    Object.entries(featuresByVersion).map(([version, features]) => [
      version,
      features.map(f => ({ name: f.name, pattern: f.pattern }))
    ])
  ),
  null,
  2
)};

// Compile patterns at module load time
export const COMPILED_PATTERNS = {};
for (const [version, pattern] of Object.entries(FEATURE_PATTERNS)) {
  if (pattern) {
    COMPILED_PATTERNS[version] = new RegExp(pattern, 'g');
  }
}

// Quick detection patterns
export const QUICK_PATTERNS = {
  es2015: /(?:=>|\`|\\bclass\\s|\\bconst\\s|\\blet\\s|\\.\\.\\.)/,
  es2016: /\\*\\*/,
  es2017: /(?:\\basync\\s|\\bawait\\s)/,
  es2018: /(?:\\.\\.\\..*\\}|\\bfor\\s+await)/,
  es2019: /(?:\\.flat\\s*\\(|\\.flatMap\\s*\\()/,
  es2020: /(?:\\?\\.|\\?\\?|\\bBigInt\\b|Promise\\.allSettled)/,
  es2021: /(?:\\|\\|=|&&=|\\?\\?=|\\.replaceAll\\s*\\()/,
  es2022: /(?:\\.at\\s*\\(|#[a-zA-Z_$]|\\bstatic\\s*\\{|Object\\.hasOwn)/
};

// Get minimum required ES version for detected features
export function getMinimumESVersion(detectedVersions) {
  const versionOrder = ES_VERSIONS;
  let minVersion = 'es5';
  
  for (const version of detectedVersions) {
    const versionIndex = versionOrder.indexOf(version);
    const minIndex = versionOrder.indexOf(minVersion);
    if (versionIndex > minIndex) {
      minVersion = version;
    }
  }
  
  return minVersion;
}

// Check if a version is supported by target
export function isVersionSupported(version, target) {
  const versionOrder = ES_VERSIONS;
  const versionIndex = versionOrder.indexOf(version);
  const targetIndex = versionOrder.indexOf(target);
  return versionIndex <= targetIndex;
}
`;
}

// Run generator
generateSchema().catch(console.error);
