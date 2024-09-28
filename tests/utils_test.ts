import { assertEquals } from "@std/assert";
import { createStringHashMap } from "../utils/common.ts";

Deno.test(function testHashMap() {
  assertEquals(createStringHashMap("hello"), {
    e: [1],
    h: [0],
    l: [2, 3],
    o: [4],
  });
  assertEquals(createStringHashMap("he"), {
    h: [0],
    e: [1],
  });
});
