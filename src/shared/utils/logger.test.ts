import { afterEach, describe, expect, it, vi } from "vitest";
import { logger } from "./logger";

describe("logger", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    vi.restoreAllMocks();
  });

  it("logs info/warn/debug/success only in development", () => {
    process.env.NODE_ENV = "development";
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    logger.info("info");
    logger.warn("warn");
    logger.debug("debug");
    logger.success("success");

    expect(logSpy).toHaveBeenCalledTimes(3);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it("does not log info/warn/debug/success outside development", () => {
    process.env.NODE_ENV = "production";
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    logger.info("info");
    logger.warn("warn");
    logger.debug("debug");
    logger.success("success");

    expect(logSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("always logs error", () => {
    process.env.NODE_ENV = "production";
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    logger.error("boom");
    expect(errSpy).toHaveBeenCalledTimes(1);
  });
});
