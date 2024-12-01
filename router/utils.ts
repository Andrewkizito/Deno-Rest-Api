import { createStringHashMap } from "../utils/common.ts";

export const getPathSegments = (path: string) => {
  const result: Array<string> = [];

  while (path.includes(":")) {
    const charsMap = createStringHashMap(path);
    const startIndex = charsMap[":"][0];
    const endIndex = charsMap["/"]?.find((num) => num > startIndex);

    if (!endIndex) {
      result.push(path.substring(startIndex));
    } else {
      result.push(path.substring(startIndex, endIndex));
    }

    // Delete
    path = path.replace(":", "");
  }

  return result;
};
