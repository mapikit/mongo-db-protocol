import { Logger } from "../src/main-class.js";

const baseFunc = (...elements : unknown[]) : void => {
  console.log(...elements);
};

export const loggerMock : Logger = {
  info: baseFunc,
  debug: baseFunc,
  warn: baseFunc,
  success: baseFunc,
  operation: baseFunc,
  fatal: baseFunc,
  error: baseFunc,
};
