import { describe, test, expect, beforeEach } from "bun:test";
import {
  registerPlugin,
  loadPlugin,
  clearPluginCache,
} from "../../../src/plugins/loader";
import { Plugin } from "../../../src/plugins/types";

describe("Plugin Loader", () => {
  beforeEach(() => {
    clearPluginCache();
  });

  test("should register and load a plugin", async () => {
    const testPlugin: Plugin = {
      name: "test-plugin",
      description: "Test plugin",
      spec: {
        orderedRules: ["es2015"],
        matches: {},
      },
    };

    registerPlugin("test", testPlugin);
    const loaded = await loadPlugin("test");

    expect(loaded).toBe(testPlugin);
    expect(loaded?.name).toBe("test-plugin");
  });

  test("should return null for unregistered plugin", async () => {
    const loaded = await loadPlugin("non-existent");
    expect(loaded).toBeNull();
  });

  test("should cache loaded plugins", async () => {
    const testPlugin: Plugin = {
      name: "cached-plugin",
      description: "Cached plugin",
      spec: {
        orderedRules: [],
        matches: {},
      },
    };

    registerPlugin("cached", testPlugin);

    const loaded1 = await loadPlugin("cached");
    const loaded2 = await loadPlugin("cached");

    expect(loaded1).toBe(loaded2);
    expect(loaded1).toBe(testPlugin);
  });

  test("should clear cache correctly", async () => {
    const testPlugin: Plugin = {
      name: "clear-test",
      description: "Clear test plugin",
      spec: {
        orderedRules: [],
        matches: {},
      },
    };

    registerPlugin("clear", testPlugin);
    const loaded = await loadPlugin("clear");
    expect(loaded).toBe(testPlugin);

    clearPluginCache();
    const afterClear = await loadPlugin("clear");
    expect(afterClear).toBeNull();
  });

  test("should handle multiple plugins", async () => {
    const plugin1: Plugin = {
      name: "plugin-1",
      description: "Plugin 1",
      spec: { orderedRules: [], matches: {} },
    };
    const plugin2: Plugin = {
      name: "plugin-2",
      description: "Plugin 2",
      spec: { orderedRules: [], matches: {} },
    };
    const plugin3: Plugin = {
      name: "plugin-3",
      description: "Plugin 3",
      spec: { orderedRules: [], matches: {} },
    };

    registerPlugin("p1", plugin1);
    registerPlugin("p2", plugin2);
    registerPlugin("p3", plugin3);

    expect(await loadPlugin("p1")).toBe(plugin1);
    expect(await loadPlugin("p2")).toBe(plugin2);
    expect(await loadPlugin("p3")).toBe(plugin3);
  });

  test("should load built-in plugins", async () => {
    const detect = await loadPlugin("detect");
    expect(detect).toBeDefined();
    expect(detect?.name).toBe("detect");

    const telemetry = await loadPlugin("telemetry");
    expect(telemetry).toBeDefined();
    expect(telemetry?.name).toBe("telemetry");
  });
});
