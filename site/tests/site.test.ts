import { test, expect, describe } from 'bun:test';
import { existsSync } from 'fs';
import { join } from 'path';

describe('Fast Brake Documentation Site', () => {
  describe('Project Structure', () => {
    test('package.json exists and is valid', () => {
      const pkg = require('../package.json');
      expect(pkg.name).toBe('fast-brake-docs');
      expect(pkg.type).toBe('module');
      expect(pkg.version).toBeDefined();
    });

    test('has required Astro configuration', () => {
      const configPath = join(__dirname, '../astro.config.mjs');
      expect(existsSync(configPath)).toBe(true);
    });

    test('has TypeScript configuration', () => {
      const tsconfigPath = join(__dirname, '../tsconfig.json');
      expect(existsSync(tsconfigPath)).toBe(true);
    });

    test('has required source directories', () => {
      const srcPath = join(__dirname, '../src');
      const componentsPath = join(__dirname, '../src/components');
      const pagesPath = join(__dirname, '../src/pages');
      const contentPath = join(__dirname, '../src/content');
      
      expect(existsSync(srcPath)).toBe(true);
      expect(existsSync(componentsPath)).toBe(true);
      expect(existsSync(pagesPath)).toBe(true);
      expect(existsSync(contentPath)).toBe(true);
    });

    test('has public assets directory', () => {
      const publicPath = join(__dirname, '../public');
      expect(existsSync(publicPath)).toBe(true);
    });
  });

  describe('Build Scripts', () => {
    test('has all required scripts', () => {
      const pkg = require('../package.json');
      const requiredScripts = ['dev', 'build', 'preview', 'typecheck', 'lint'];
      
      for (const script of requiredScripts) {
        expect(pkg.scripts[script]).toBeDefined();
      }
    });

    test('has correct Astro commands', () => {
      const pkg = require('../package.json');
      expect(pkg.scripts.dev).toContain('astro dev');
      expect(pkg.scripts.build).toContain('astro build');
      expect(pkg.scripts.preview).toContain('astro preview');
    });
  });

  describe('Dependencies', () => {
    test('has required Astro dependencies', () => {
      const pkg = require('../package.json');
      expect(pkg.dependencies['astro']).toBeDefined();
      expect(pkg.dependencies['@astrojs/check']).toBeDefined();
      expect(pkg.dependencies['@astrojs/mdx']).toBeDefined();
      expect(pkg.dependencies['@astrojs/react']).toBeDefined();
    });

    test('has Tailwind CSS dependencies', () => {
      const pkg = require('../package.json');
      expect(pkg.dependencies['@tailwindcss/vite']).toBeDefined();
      expect(pkg.devDependencies['@tailwindcss/typography']).toBeDefined();
      expect(pkg.devDependencies['daisyui']).toBeDefined();
    });

    test('has React dependencies for interactive components', () => {
      const pkg = require('../package.json');
      expect(pkg.dependencies['react']).toBeDefined();
      expect(pkg.dependencies['react-dom']).toBeDefined();
      expect(pkg.dependencies['@types/react']).toBeDefined();
      expect(pkg.dependencies['@types/react-dom']).toBeDefined();
    });

    test('has search dependencies', () => {
      const pkg = require('../package.json');
      expect(pkg.dependencies['@docsearch/css']).toBeDefined();
      expect(pkg.dependencies['@docsearch/js']).toBeDefined();
      expect(pkg.dependencies['fuse.js']).toBeDefined();
    });
  });

  describe('Content Files', () => {
    test('has documentation content files', () => {
      const docsPath = join(__dirname, '../src/content/docs');
      expect(existsSync(docsPath)).toBe(true);
      
      const expectedDocs = [
        'introduction.mdx',
        'setup.mdx',
        'api-reference.mdx',
        'architecture.mdx',
        'advanced-features.mdx',
        'troubleshooting.mdx'
      ];
      
      for (const doc of expectedDocs) {
        const docPath = join(docsPath, doc);
        expect(existsSync(docPath)).toBe(true);
      }
    });

    test('has content configuration', () => {
      const configPath = join(__dirname, '../src/content/config.ts');
      expect(existsSync(configPath)).toBe(true);
    });
  });

  describe('Components', () => {
    test('has home page components', () => {
      const homeComponentsPath = join(__dirname, '../src/components/home');
      expect(existsSync(homeComponentsPath)).toBe(true);
      
      const expectedComponents = ['Header.astro', 'Hero.astro', 'Install.astro'];
      for (const component of expectedComponents) {
        const componentPath = join(homeComponentsPath, component);
        expect(existsSync(componentPath)).toBe(true);
      }
    });

    test('has documentation components', () => {
      const docsComponentsPath = join(__dirname, '../src/components/docs');
      expect(existsSync(docsComponentsPath)).toBe(true);
      
      const expectedComponents = ['DocsHeader.astro', 'SideBar.astro', 'Search.tsx'];
      for (const component of expectedComponents) {
        const componentPath = join(docsComponentsPath, component);
        expect(existsSync(componentPath)).toBe(true);
      }
    });

    test('has common components', () => {
      const commonComponentsPath = join(__dirname, '../src/components/common');
      expect(existsSync(commonComponentsPath)).toBe(true);
      
      const expectedComponents = ['Footer.astro', 'ThemeToggle.astro'];
      for (const component of expectedComponents) {
        const componentPath = join(commonComponentsPath, component);
        expect(existsSync(componentPath)).toBe(true);
      }
    });
  });

  describe('Pages', () => {
    test('has index page', () => {
      const indexPath = join(__dirname, '../src/pages/index.astro');
      expect(existsSync(indexPath)).toBe(true);
    });

    test('has docs pages structure', () => {
      const docsPath = join(__dirname, '../src/pages/docs');
      expect(existsSync(docsPath)).toBe(true);
      
      const slugPath = join(docsPath, '[slug].astro');
      expect(existsSync(slugPath)).toBe(true);
    });
  });

  describe('Layouts', () => {
    test('has required layout files', () => {
      const layoutsPath = join(__dirname, '../src/layouts');
      expect(existsSync(layoutsPath)).toBe(true);
      
      const expectedLayouts = ['Layout.astro', 'HomeLayout.astro'];
      for (const layout of expectedLayouts) {
        const layoutPath = join(layoutsPath, layout);
        expect(existsSync(layoutPath)).toBe(true);
      }
    });
  });

  describe('Assets', () => {
    test('has logo files', () => {
      const publicPath = join(__dirname, '../public');
      const logoFiles = [
        'fast-brake-logo.svg',
        'fast-brake-logo-new.svg',
        'fast-brake-logo-checkered.svg',
        'favicon.svg'
      ];
      
      for (const logo of logoFiles) {
        const logoPath = join(publicPath, logo);
        expect(existsSync(logoPath)).toBe(true);
      }
    });
  });

  describe('Styles', () => {
    test('has global CSS file', () => {
      const stylesPath = join(__dirname, '../src/styles/global.css');
      expect(existsSync(stylesPath)).toBe(true);
    });
  });

  describe('Development Tools', () => {
    test('has linting configuration', () => {
      const pkg = require('../package.json');
      expect(pkg.devDependencies['oxlint']).toBeDefined();
      expect(pkg.scripts.lint).toContain('oxlint');
    });

    test('has formatting configuration', () => {
      const pkg = require('../package.json');
      expect(pkg.devDependencies['prettier']).toBeDefined();
      expect(pkg.scripts.format).toBeDefined();
    });

    test('has TypeScript support', () => {
      const pkg = require('../package.json');
      expect(pkg.dependencies['typescript']).toBeDefined();
      expect(pkg.scripts.typecheck).toBeDefined();
    });
  });
});