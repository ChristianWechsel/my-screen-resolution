import type { Logger } from "@christian-wechsel/logger";
import type { NextFunction, Request, Response } from "express";
import { createRequestLogger } from "./request-logger.js";

function mockLogger(): jest.Mocked<Logger> {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };
}

function mockRequest(
  overrides: Partial<Record<string, unknown>> = {},
): Request {
  return {
    method: "GET",
    url: "/test",
    ip: "127.0.0.1",
    headers: {},
    query: {},
    ...overrides,
  } as unknown as Request;
}

const mockNext = (): NextFunction => jest.fn() as NextFunction;

describe("createRequestLogger", () => {
  it("calls next()", () => {
    const next = mockNext();
    createRequestLogger(mockLogger())(mockRequest(), {} as Response, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("logs method, url, and ip", () => {
    const logger = mockLogger();
    createRequestLogger(logger)(
      mockRequest({ method: "POST", url: "/games", ip: "192.168.1.1" }),
      {} as Response,
      mockNext(),
    );
    expect(logger.info).toHaveBeenCalledWith(
      "Incoming Request: POST /games from 192.168.1.1",
    );
  });

  it("always logs a header debug line", () => {
    const logger = mockLogger();
    createRequestLogger(logger)(
      mockRequest({ headers: {} }),
      {} as Response,
      mockNext(),
    );
    expect(logger.debug).toHaveBeenCalledWith(
      expect.stringContaining("Request Headers:"),
    );
  });

  it("logs selected headers when present", () => {
    const logger = mockLogger();
    createRequestLogger(logger)(
      mockRequest({
        headers: {
          "user-agent": "Mozilla/5.0",
          host: "exit-games.example.com",
          "x-forwarded-for": "203.0.113.5",
        },
      }),
      {} as Response,
      mockNext(),
    );
    const headerLog = logger.debug.mock.calls.find((c) =>
      (c[0] as string).includes("Request Headers"),
    )?.[0] as string;
    expect(headerLog).toContain('"user-agent":"Mozilla/5.0"');
    expect(headerLog).toContain('"host":"exit-games.example.com"');
    expect(headerLog).toContain('"x-forwarded-for":"203.0.113.5"');
  });

  it("does not log unlisted headers", () => {
    const logger = mockLogger();
    createRequestLogger(logger)(
      mockRequest({
        headers: { "accept-encoding": "gzip", "x-custom-header": "value" },
      }),
      {} as Response,
      mockNext(),
    );
    const headerLog = logger.debug.mock.calls.find((c) =>
      (c[0] as string).includes("Request Headers"),
    )?.[0] as string;
    expect(headerLog).not.toContain("accept-encoding");
    expect(headerLog).not.toContain("x-custom-header");
  });

  it("logs cookie as Active when cookie header is present", () => {
    const logger = mockLogger();
    createRequestLogger(logger)(
      mockRequest({ headers: { cookie: "session=abc123" } }),
      {} as Response,
      mockNext(),
    );
    const headerLog = logger.debug.mock.calls.find((c) =>
      (c[0] as string).includes("Request Headers"),
    )?.[0] as string;
    expect(headerLog).toContain('"cookie":"Active"');
    expect(headerLog).not.toContain("abc123");
  });

  it("logs cookie as None when cookie header is absent", () => {
    const logger = mockLogger();
    createRequestLogger(logger)(
      mockRequest({ headers: {} }),
      {} as Response,
      mockNext(),
    );
    const headerLog = logger.debug.mock.calls.find((c) =>
      (c[0] as string).includes("Request Headers"),
    )?.[0] as string;
    expect(headerLog).toContain('"cookie":"None"');
  });

  it("matches headers case-insensitively", () => {
    const logger = mockLogger();
    createRequestLogger(logger)(
      mockRequest({
        headers: { "x-forwarded-host": "exit-games.example.com" },
      }),
      {} as Response,
      mockNext(),
    );
    const headerLog = logger.debug.mock.calls.find((c) =>
      (c[0] as string).includes("Request Headers"),
    )?.[0] as string;
    expect(headerLog).toContain('"x-forwarded-host":"exit-games.example.com"');
  });

  it("handles null headers without throwing", () => {
    const logger = mockLogger();
    expect(() => {
      createRequestLogger(logger)(
        mockRequest({ headers: null }),
        {} as Response,
        mockNext(),
      );
    }).not.toThrow();
  });
});
