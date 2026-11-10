import { describe, expect, it } from "vitest";
import { weekStartIso } from "../src/week";

// 2026-11-11 is a Wednesday
describe("weekStartIso", () => {
  it("is the same week just before the Wednesday reset", () => {
    expect(weekStartIso(new Date("2026-11-11T09:59:59Z"))).toBe("2026-11-04T10:00:00.000Z");
  });

  it("starts a new week exactly at the reset", () => {
    expect(weekStartIso(new Date("2026-11-11T10:00:00Z"))).toBe("2026-11-11T10:00:00.000Z");
  });

  it("covers the rest of the week up to the next reset", () => {
    expect(weekStartIso(new Date("2026-11-17T23:00:00Z"))).toBe("2026-11-11T10:00:00.000Z");
    expect(weekStartIso(new Date("2026-11-18T10:00:00Z"))).toBe("2026-11-18T10:00:00.000Z");
  });

  it("respects a configured reset hour", () => {
    expect(weekStartIso(new Date("2026-11-11T08:30:00Z"), 7)).toBe("2026-11-11T07:00:00.000Z");
  });

  it("crosses month boundaries", () => {
    expect(weekStartIso(new Date("2026-12-01T12:00:00Z"))).toBe("2026-11-25T10:00:00.000Z");
  });
});
