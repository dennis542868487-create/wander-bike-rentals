import { describe, expect, it } from "vitest";
import { hintText } from "@/components/forms/hint-text";

describe("hintText", () => {
  it("states a min/max rule before anything is typed", () => {
    expect(hintText({ length: 0, min: 5, max: 240 }).text).toBe(
      "5–240 characters",
    );
  });

  it("warns while a minimum is not met yet", () => {
    const hint = hintText({ length: 3, min: 5, max: 240 });

    expect(hint.text).toBe("At least 5 characters needed · 3 so far");
    expect(hint.short).toBe(true);
  });

  it("switches to a plain count once the minimum is met", () => {
    const hint = hintText({ length: 12, min: 5, max: 240 });

    expect(hint.text).toBe("12 / 240 characters");
    expect(hint.short).toBe(false);
  });

  it("never warns on an empty field", () => {
    // An untouched form should not be covered in amber.
    expect(hintText({ length: 0, min: 20 }).short).toBe(false);
  });

  it("marks an optional field while it is empty", () => {
    expect(hintText({ length: 0, max: 80, optional: true }).text).toBe(
      "Optional · Up to 80 characters",
    );
  });

  it("drops the optional prefix once the field has content", () => {
    expect(hintText({ length: 4, max: 80, optional: true }).text).toBe(
      "4 / 80 characters",
    );
  });

  it("renders a static rule with no counter", () => {
    expect(hintText({ min: 2, max: 80 }).text).toBe("2–80 characters");
    expect(hintText({ max: 1000 }).text).toBe("Up to 1000 characters");
  });

  it("returns nothing when there is no rule to state", () => {
    expect(hintText({}).text).toBe("");
  });
});
