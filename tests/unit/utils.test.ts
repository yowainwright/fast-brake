import { test, expect, describe } from "bun:test";
import { getCachedRegex, fastIndexOf, findAllIndices } from "../../src/utils";

describe("getCachedRegex", () => {
  test("should return same regex instance for same pattern", () => {
    const regex1 = getCachedRegex("test.*pattern");
    const regex2 = getCachedRegex("test.*pattern");
    expect(regex1).toBe(regex2);
  });

  test("should return different instances for different patterns", () => {
    const regex1 = getCachedRegex("pattern1");
    const regex2 = getCachedRegex("pattern2");
    expect(regex1).not.toBe(regex2);
  });

  test("should handle flags correctly", () => {
    const regex1 = getCachedRegex("test", "i");
    const regex2 = getCachedRegex("test", "g");
    expect(regex1).not.toBe(regex2);
  });

  test("should reset lastIndex on retrieval", () => {
    const regex = getCachedRegex("test", "g");
    regex.exec("test test test");
    const regex2 = getCachedRegex("test", "g");
    expect(regex2.lastIndex).toBe(0);
  });
});

describe("fastIndexOf", () => {
  test("should find pattern at beginning", () => {
    const result = fastIndexOf("hello world", "hello");
    expect(result).toBe(0);
  });

  test("should find pattern in middle", () => {
    const result = fastIndexOf("hello world", "world");
    expect(result).toBe(6);
  });

  test("should return -1 when pattern not found", () => {
    const result = fastIndexOf("hello world", "foo");
    expect(result).toBe(-1);
  });

  test("should handle empty pattern", () => {
    const result = fastIndexOf("hello", "");
    expect(result).toBe(0);
  });

  test("should handle pattern longer than text", () => {
    const result = fastIndexOf("hi", "hello");
    expect(result).toBe(-1);
  });

  test("should use Boyer-Moore for long patterns", () => {
    const longPattern = "this is a very long pattern to search for";
    const text = "some text before " + longPattern + " and after";
    const result = fastIndexOf(text, longPattern);
    expect(result).toBe(17);
  });

  test("should respect startIndex parameter", () => {
    const text = "hello hello hello";
    const result = fastIndexOf(text, "hello", 6);
    expect(result).toBe(6);
  });

  test("should handle special characters in pattern", () => {
    const text = "const regex = /test.*pattern/";
    const result = fastIndexOf(text, ".*");
    expect(result).toBe(19);
  });
});

describe("findAllIndices", () => {
  test("should find all occurrences", () => {
    const result = findAllIndices("hello hello hello", "hello");
    expect(result).toEqual([0, 6, 12]);
  });

  test("should return empty array when no matches", () => {
    const result = findAllIndices("hello world", "foo");
    expect(result).toEqual([]);
  });

  test("should handle single occurrence", () => {
    const result = findAllIndices("hello world", "world");
    expect(result).toEqual([6]);
  });

  test("should handle overlapping patterns", () => {
    const result = findAllIndices("aaaa", "aa");
    expect(result).toEqual([0, 2]);
  });

  test("should handle empty pattern", () => {
    const result = findAllIndices("hello", "");
    expect(result).toEqual([]);
  });

  test("should work with long patterns", () => {
    const longPattern = "this is a long pattern";
    const text =
      longPattern + " some text " + longPattern + " more " + longPattern;
    const result = findAllIndices(text, longPattern);
    expect(result).toEqual([0, 33, 61]);
  });
});
