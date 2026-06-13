import {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios";
import { afterEach, describe, expect, it } from "vitest";
import { ApiError } from "@/services/api/utils/apiError";
import { clearAuthToken, setAuthToken } from "@/services/api/utils/authToken";
import {
  attachAuthToken,
  normalizeApiError,
} from "@/services/api/utils/interceptors";

const buildConfig = (): InternalAxiosRequestConfig =>
  ({ headers: new AxiosHeaders() }) as InternalAxiosRequestConfig;

const buildResponse = (data: unknown, status: number) => ({
  data,
  status,
  statusText: "",
  headers: {},
  config: { headers: new AxiosHeaders() } as InternalAxiosRequestConfig,
});

describe("attachAuthToken", () => {
  afterEach(() => {
    clearAuthToken();
  });

  describe("when a token is set", () => {
    it("adds the Authorization header", () => {
      setAuthToken("jwt-123");

      const config = attachAuthToken(buildConfig());

      expect(config.headers.get("Authorization")).toBe("Bearer jwt-123");
    });
  });

  describe("when no token is set", () => {
    it("leaves the headers untouched", () => {
      const config = attachAuthToken(buildConfig());

      expect(config.headers.get("Authorization")).toBeUndefined();
    });
  });
});

describe("normalizeApiError", () => {
  describe("when the error carries a structured API body", () => {
    it("throws an ApiError built from that body", () => {
      const axiosError = new AxiosError("Request failed");
      axiosError.response = buildResponse(
        { message: "Missing", error: "Not Found", statusCode: 404 },
        404,
      );

      expect(() => normalizeApiError(axiosError)).toThrow(ApiError);

      try {
        normalizeApiError(axiosError);
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.statusCode).toBe(404);
        expect(apiError.message).toBe("Missing");
        expect(apiError.error).toBe("Not Found");
      }
    });
  });

  describe("when the axios error has no structured body", () => {
    it("falls back to the axios status and code", () => {
      const axiosError = new AxiosError("Boom", "ERR_BAD_REQUEST");
      axiosError.response = buildResponse(undefined, 409);

      try {
        normalizeApiError(axiosError);
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.statusCode).toBe(409);
        expect(apiError.message).toBe("Boom");
        expect(apiError.error).toBe("ERR_BAD_REQUEST");
      }
    });
  });

  describe("when the axios error has no response at all", () => {
    it("defaults the status code to zero", () => {
      const axiosError = new AxiosError("Network down");

      try {
        normalizeApiError(axiosError);
      } catch (error) {
        expect((error as ApiError).statusCode).toBe(0);
      }
    });
  });

  describe("when given a plain Error", () => {
    it("wraps it in an ApiError with status zero", () => {
      try {
        normalizeApiError(new Error("local failure"));
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.statusCode).toBe(0);
        expect(apiError.message).toBe("local failure");
      }
    });
  });

  describe("when given a non-error value", () => {
    it("throws a generic ApiError", () => {
      try {
        normalizeApiError("weird");
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.statusCode).toBe(0);
        expect(apiError.message).toBe("Unknown API error");
      }
    });
  });
});
