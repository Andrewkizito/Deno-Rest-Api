import {
  brightGreen,
  brightRed,
  cyan,
  yellow,
} from "https://deno.land/std@0.203.0/fmt/colors.ts";

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

export enum LogLevels {
  WARN = "WARN",
  INFO = "INFO",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export const logger = (message: string, severity: LogLevels = LogLevels.INFO) => {
  const now = new Date().toISOString();

  const levelColor =
    severity === LogLevels.INFO
      ? brightGreen
      : severity === LogLevels.WARN
      ? yellow
      : severity === LogLevels.SUCCESS
      ? brightGreen
      : brightRed;

  console.log(`[${cyan(now)}] ${levelColor(severity)}: ${message}`);
};
