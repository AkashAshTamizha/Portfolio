import { describe, it, expect } from "vitest";
import { formatMonthYear, formatPeriod, formatDate } from "./date";

describe("formatMonthYear", () => {
  it("formats a valid date as 'Mon YYYY'", () => {
    expect(formatMonthYear("2024-03-15")).toBe("Mar 2024");
  });

  it("returns an empty string for a falsy value", () => {
    expect(formatMonthYear(null)).toBe("");
    expect(formatMonthYear(undefined)).toBe("");
    expect(formatMonthYear("")).toBe("");
  });

  it("returns an empty string for an invalid date", () => {
    expect(formatMonthYear("not-a-date")).toBe("");
  });
});

describe("formatPeriod", () => {
  it("shows 'Present' when the role is current", () => {
    expect(formatPeriod("2023-01-01", null, true)).toBe("Jan 2023 — Present");
  });

  it("shows the end date when the role has ended", () => {
    expect(formatPeriod("2022-06-01", "2023-01-01", false)).toBe(
      "Jun 2022 — Jan 2023"
    );
  });

  it("returns an empty string when there is no start date", () => {
    expect(formatPeriod(null, "2023-01-01", false)).toBe("");
  });
});

describe("formatDate", () => {
  it("formats a valid date as 'Mon D, YYYY'", () => {
    expect(formatDate("2024-03-15")).toBe("Mar 15, 2024");
  });

  it("returns an empty string for an invalid date", () => {
    expect(formatDate("nonsense")).toBe("");
  });
});
