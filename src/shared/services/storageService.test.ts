import { beforeEach, describe, expect, it } from "vitest";
import { StorageService } from "./storageService";

describe("StorageService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores and reads tokens with roles", () => {
    StorageService.setTokens("access", "refresh", ["ADMIN", "USER"]);

    expect(StorageService.getAccessToken()).toBe("access");
    expect(StorageService.getRefreshToken()).toBe("refresh");
    expect(StorageService.getRoles()).toEqual(["ADMIN", "USER"]);
  });

  it("returns empty roles when stored payload is invalid", () => {
    localStorage.setItem("roles", "{not-valid-json");
    expect(StorageService.getRoles()).toEqual([]);
  });

  it("supports selected project lifecycle", () => {
    const project = { id: 12, name: "Alpha" };

    StorageService.setSelectedProject(project);
    expect(StorageService.getSelectedProject()).toEqual(project);

    StorageService.clearSelectedProject();
    expect(StorageService.getSelectedProject()).toBeNull();
  });

  it("clearAll removes token and project keys", () => {
    StorageService.setTokens("access", "refresh", ["ADMIN"]);
    StorageService.setSelectedProject({ id: 1 });

    StorageService.clearAll();

    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
    expect(localStorage.getItem("roles")).toBeNull();
    expect(localStorage.getItem("selectedProject")).toBeNull();
  });
});
