import { describe, it, expect, beforeEach } from "bun:test";
import { FastBrakeCache } from "../../src/cache";

describe("FastBrakeCache", () => {
  let cache: FastBrakeCache<string>;

  beforeEach(() => {
    cache = new FastBrakeCache<string>(100);
  });

  describe("set and get", () => {
    it("should store and retrieve values", () => {
      cache.set("key1", "value1");
      expect(cache.get("key1")).toBe("value1");
    });

    it("should return undefined for non-existent keys", () => {
      expect(cache.get("nonexistent")).toBeUndefined();
    });

    it("should overwrite existing values", () => {
      cache.set("key1", "value1");
      cache.set("key1", "value2");
      expect(cache.get("key1")).toBe("value2");
    });
  });

  describe("has", () => {
    it("should return true for existing keys", () => {
      cache.set("key1", "value1");
      expect(cache.has("key1")).toBe(true);
    });

    it("should return false for non-existent keys", () => {
      expect(cache.has("nonexistent")).toBe(false);
    });
  });

  describe("invalidate", () => {
    it("should remove specific entries", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.invalidate("key1");

      expect(cache.has("key1")).toBe(false);
      expect(cache.has("key2")).toBe(true);
    });
  });

  describe("clear", () => {
    it("should remove all entries", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.clear();

      expect(cache.has("key1")).toBe(false);
      expect(cache.has("key2")).toBe(false);
    });
  });

  describe("TTL expiration", () => {
    it("should expire entries after TTL", async () => {
      const shortCache = new FastBrakeCache<string>(50);
      shortCache.set("key1", "value1");

      expect(shortCache.get("key1")).toBe("value1");

      await new Promise((resolve) => setTimeout(resolve, 60));

      expect(shortCache.get("key1")).toBeUndefined();
    });

    it("should not expire entries before TTL", async () => {
      const shortCache = new FastBrakeCache<string>(100);
      shortCache.set("key1", "value1");

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(shortCache.get("key1")).toBe("value1");
    });
  });

  describe("isStale", () => {
    it("should return false for fresh entries", () => {
      cache.set("key1", "value1");
      expect(cache.isStale("key1")).toBe(false);
    });

    it("should return true for expired entries", async () => {
      const shortCache = new FastBrakeCache<string>(50);
      shortCache.set("key1", "value1");

      await new Promise((resolve) => setTimeout(resolve, 60));

      expect(shortCache.isStale("key1")).toBe(true);
    });

    it("should return true for non-existent keys", () => {
      expect(cache.isStale("nonexistent")).toBe(true);
    });
  });

  describe("type safety", () => {
    it("should work with different types", () => {
      const numberCache = new FastBrakeCache<number>();
      numberCache.set("count", 42);
      expect(numberCache.get("count")).toBe(42);

      const objectCache = new FastBrakeCache<{ name: string }>();
      const obj = { name: "test" };
      objectCache.set("obj", obj);
      expect(objectCache.get("obj")).toEqual(obj);
    });
  });
});
