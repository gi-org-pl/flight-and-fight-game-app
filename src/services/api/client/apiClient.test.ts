import { describe, expect, it } from "vitest";
import { apiClient, createApiClient } from "@/services/api/client/apiClient";

describe("createApiClient", () => {
  describe("when no baseURL is provided", () => {
    it("falls back to the local development server", () => {
      const client = createApiClient();

      expect(client.defaults.baseURL).toBe("http://localhost");
    });
  });

  describe("when a baseURL is provided", () => {
    it("uses the given baseURL", () => {
      const client = createApiClient("https://api.example.com");

      expect(client.defaults.baseURL).toBe("https://api.example.com");
    });
  });

  describe("when created", () => {
    it("registers a request and a response interceptor", () => {
      const client = createApiClient();

      expect(client.interceptors.request).toHaveProperty("handlers");
      expect(client.interceptors.response).toHaveProperty("handlers");
    });

    it("sets a JSON content type", () => {
      const client = createApiClient();

      expect(client.defaults.headers["Content-Type"]).toBe("application/json");
    });

    it("passes successful responses through untouched", () => {
      const client = createApiClient();
      const { fulfilled } = (
        client.interceptors.response as unknown as {
          handlers: { fulfilled: (value: unknown) => unknown }[];
        }
      ).handlers[0];
      const response = { data: { ok: true } };

      expect(fulfilled(response)).toBe(response);
    });
  });
});

describe("apiClient", () => {
  describe("the shared instance", () => {
    it("is preconfigured with a baseURL", () => {
      expect(apiClient.defaults.baseURL).toBeTruthy();
    });
  });
});
