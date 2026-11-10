import { describe, expect, it } from "vitest";
import { validateCharacter, validateRoster } from "../src/validation";

describe("validateCharacter", () => {
  it("accepts a valid character and trims the name", () => {
    expect(validateCharacter({ name: " Iochi ", class: "Bard", ilvl: 1620.83 }).value).toEqual({
      name: "Iochi",
      class: "Bard",
      ilvl: 1620.83,
    });
  });

  it("rejects a class outside the fixed list", () => {
    expect(validateCharacter({ name: "A", class: "Pirate", ilvl: 1700 }).errors?.class).toBeDefined();
  });

  it("rejects empty name and class", () => {
    const { errors } = validateCharacter({ name: "  ", class: "", ilvl: 1600 });
    expect(errors).toMatchObject({ name: expect.any(String), class: expect.any(String) });
  });

  it.each([0, -5, 3001, NaN, "1600"])("rejects ilvl %s", (ilvl) => {
    expect(validateCharacter({ name: "A", class: "Bard", ilvl }).errors?.ilvl).toBeDefined();
  });
});

describe("validateRoster", () => {
  it("requires at least one character", () => {
    expect(validateRoster([]).errors?.characters).toBeDefined();
  });

  it("rejects duplicate names case-insensitively", () => {
    const { errors } = validateRoster([
      { name: "Iochi", class: "Bard", ilvl: 1600 },
      { name: "iochi", class: "Paladin", ilvl: 1500 },
    ]);
    expect(errors?.["characters.1.name"]).toBe("Duplicate character name");
  });

  it("reports field errors with the character index", () => {
    const { errors } = validateRoster([{ name: "A", class: "Bard", ilvl: 0 }]);
    expect(errors?.["characters.0.ilvl"]).toBeDefined();
  });
});
