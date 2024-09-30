export function createStringHashMap(input: string): Record<string, number[]> {
  const indexMap: Record<string, number[]> = {};

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (!indexMap[char]) {
      indexMap[char] = [];
    }

    indexMap[char].push(i);
  }

  return indexMap;
}

export const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "*",
};
