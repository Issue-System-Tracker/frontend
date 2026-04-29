import { beforeEach, describe, expect, it } from "vitest";
import {
  clearUserFromStorage,
  createUserFromToken,
  getUserDisplayName,
  getUserEmail,
  getUserRole,
  hasUserRole,
  isUserAdmin,
  isUserAuthenticated,
  loadUserFromStorage,
  parseEmailFromToken,
  parseNameFromToken,
  saveUserToStorage,
  validateRegisterForm,
} from "./userUtils";
import { UserRole, type User } from "../model/types";

const createToken = (payload: Record<string, unknown>) =>
  `aaa.${btoa(JSON.stringify(payload))}.bbb`;

describe("userUtils", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("validates registration form", () => {
    expect(
      validateRegisterForm({
        email: "bad",
        password: "123456",
        passwordConfirm: "123456",
        fullName: "Иван Иванов",
      })
    ).toBe("Введите корректный email");

    expect(
      validateRegisterForm({
        email: "user@mail.com",
        password: "123456",
        passwordConfirm: "654321",
        fullName: "Иван Иванов",
      })
    ).toBe("Пароли не совпадают");
  });

  it("parses email and name from token", () => {
    const token = createToken({ sub: "user@mail.com", fullName: "Ivan Petrov" });
    expect(parseEmailFromToken(token)).toBe("user@mail.com");
    expect(parseNameFromToken(token, "user@mail.com")).toBe("Ivan Petrov");
  });

  it("creates user from token and reads roles from storage", () => {
    localStorage.setItem("roles", JSON.stringify([UserRole.DEVELOPER]));
    const token = createToken({ sub: "dev@mail.com", name: "Dev User" });

    const user = createUserFromToken(token, "refresh");
    expect(user).not.toBeNull();
    expect(user?.email).toBe("dev@mail.com");
    expect(user?.roles).toEqual([UserRole.DEVELOPER]);
    expect(isUserAdmin(user ?? null)).toBe(true);
  });

  it("saves and loads user from storage", () => {
    const user: User = {
      id: "1",
      email: "qa@mail.com",
      name: "QA User",
      roles: [UserRole.QA],
      accessToken: createToken({ sub: "qa@mail.com", name: "QA User" }),
      refreshToken: "refresh",
    };
    saveUserToStorage(user);

    const loaded = loadUserFromStorage();
    expect(loaded?.email).toBe("qa@mail.com");
    expect(loaded?.roles).toEqual([UserRole.QA]);

    clearUserFromStorage();
    expect(loadUserFromStorage()).toBeNull();
  });

  it("checks user derived helpers", () => {
    const user: User = {
      id: "2",
      email: "user@mail.com",
      name: "",
      roles: [UserRole.USER],
      accessToken: "token",
    };

    expect(isUserAuthenticated(user)).toBe(true);
    expect(getUserRole(user)).toBe(UserRole.USER);
    expect(hasUserRole(user, UserRole.QA)).toBe(false);
    expect(getUserDisplayName(user)).toBe("user@mail.com");
    expect(getUserEmail(user)).toBe("user@mail.com");
  });
});
