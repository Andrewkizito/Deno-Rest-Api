import { assertEquals } from "@std/assert";
import { createStringHashMap } from "../utils/common.ts";
import { getPathSegments } from "../router/utils.ts";

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

Deno.test(function testPathSegments() {
  assertEquals(getPathSegments("/tasks"), []);
  assertEquals(getPathSegments("/tasks/:id"), [":id"]);
});
