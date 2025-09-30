import { defineConfig } from 'tsup';
import { readdir } from 'fs/promises';
import { join } from 'path';

// Get all plugin directories
async function getPluginEntries() {
  const pluginsDir = join(__dirname, 'src', 'plugins');
  const entries: Record<string, string> = {};
  
  // Add main entry
  entries['index'] = 'src/index.ts';
  entries['sync'] = 'src/sync.ts';

  // Add plugin entries
  const pluginDirs = await readdir(pluginsDir, { withFileTypes: true });
  for (const dir of pluginDirs) {
    if (dir.isDirectory()) {
      entries[`plugins/${dir.name}/index`] = `src/plugins/${dir.name}/index.ts`;
    }
  }
  
  // Add utility exports
  entries['plugins/index'] = 'src/plugins/index.ts';
  entries['plugins/loader'] = 'src/plugins/loader.ts';
  entries['plugins/types'] = 'src/plugins/types.ts';
  
  return entries;
}

export default defineConfig(async () => {
  const entries = await getPluginEntries();
  
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