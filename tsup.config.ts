import { defineConfig } from 'tsup';
import { readdir } from 'fs/promises';
import { join } from 'path';

async function getEntries() {
  const pluginsDir = join(__dirname, 'src', 'plugins');
  const extensionsDir = join(__dirname, 'src', 'extensions');
  const entries: Record<string, string> = {};

  entries['index'] = 'src/index.ts';
  entries['sync'] = 'src/sync.ts';

  const pluginDirs = await readdir(pluginsDir, { withFileTypes: true });
  for (const dir of pluginDirs) {
    if (dir.isDirectory()) {
      entries[`plugins/${dir.name}/index`] = `src/plugins/${dir.name}/index.ts`;
    }
  }

  entries['plugins/index'] = 'src/plugins/index.ts';
  entries['plugins/loader'] = 'src/plugins/loader.ts';
  entries['plugins/types'] = 'src/plugins/types.ts';

  const esVersions = ['es2015', 'es2016', 'es2017', 'es2018', 'es2019', 'es2020', 'es2021', 'es2022', 'es2023', 'es2024', 'es2025'];
  for (const version of esVersions) {
    entries[`plugins/${version}/index`] = 'src/plugins/esversion/index.ts';
  }
  entries['plugins/all/index'] = 'src/plugins/esversion/index.ts';

  const extensionDirs = await readdir(extensionsDir, { withFileTypes: true });
  for (const dir of extensionDirs) {
    if (dir.isDirectory()) {
      entries[`extensions/${dir.name}`] = `src/extensions/${dir.name}/index.ts`;
    }
  }

  return entries;
}

export default defineConfig(async () => {
  const entries = await getEntries();
  
  return {
    entry: entries,
    format: ['esm', 'cjs'],
    dts: true,
    splitting: true,
    clean: true,
    minify: true,
    treeshake: true,
    external: [],
    esbuildOptions(options) {
      options.conditions = ['import', 'module', 'browser', 'default'];
      options.mainFields = ['module', 'main'];
    },
  };
});