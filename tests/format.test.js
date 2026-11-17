import assert from "node:assert/strict";
import { test } from "node:test";
import {
  dateTime,
  initials,
  number,
  paymentStatuses,
  rupiah,
} from "../src/lib/format.js";

for (const [name, format] of [
  ["number", number],
  ["rupiah", rupiah],
]) {
  test(`${name} renders null and undefined as an em dash, not as zero`, () => {
    assert.equal(format(null), "—");
    assert.equal(format(undefined), "—");
    assert.equal(format(), "—");
    assert.notEqual(format(0), "—");
  });
}

test("number preserves a zero count", () => {
  assert.equal(number(0), "0");
});

test("number uses Indonesian thousands separators for counts", () => {
  assert.equal(number(1), "1");
  assert.equal(number(1234567), "1.234.567");
  assert.equal(number(-1234), "-1.234");
});

test("number uses an Indonesian decimal comma and rounds to three fractional digits", () => {
  assert.equal(number(1234.5), "1.234,5");
  assert.equal(number(1234.56789), "1.234,568");
});

test("number accepts numeric strings returned by an API", () => {
  assert.equal(number("0"), "0");
  assert.equal(number("10000"), "10.000");
});

test("rupiah preserves zero IDR with the currency symbol and non-breaking space", () => {
  assert.equal(rupiah(0), "Rp\u00a00");
});

test("rupiah uses Indonesian grouping and no fractional digits", () => {
  assert.equal(rupiah(1234567), "Rp\u00a01.234.567");
  assert.equal(rupiah(1234.49), "Rp\u00a01.234");
  assert.equal(rupiah(1234.5), "Rp\u00a01.235");
  assert.equal(rupiah(-1234.5), "-Rp\u00a01.235");
});

test("rupiah accepts numeric strings without confusing string zero with missing data", () => {
  assert.equal(rupiah("0"), "Rp\u00a00");
  assert.equal(rupiah("12500.75"), "Rp\u00a012.501");
});

test("dateTime renders missing and empty values as an em dash", () => {
  assert.equal(dateTime(), "—");
  for (const value of [null, undefined, "", false]) {
    assert.equal(dateTime(value), "—");
  }
});

test("dateTime renders invalid dates as an em dash instead of throwing", () => {
  for (const value of ["not-a-date", "2025-13-40", new Date(NaN), NaN]) {
    assert.equal(dateTime(value), "—");
  }
});

test("dateTime formats a Date with Indonesian medium date and short local time", () => {
  // Construct local time so the expectation works in any host timezone.
  const date = new Date(2025, 0, 15, 9, 5, 47);
  assert.equal(dateTime(date), "15 Jan 2025, 09.05");
});

test("dateTime accepts ISO timestamps and milliseconds and converts them to local time", () => {
  const localDate = new Date(2025, 7, 21, 14, 30, 59);
  assert.equal(dateTime(localDate.toISOString()), "21 Agu 2025, 14.30");
  assert.equal(dateTime(localDate.getTime()), "21 Agu 2025, 14.30");
});

test("dateTime currently treats numeric zero as absent but accepts an epoch Date object", () => {
  assert.equal(dateTime(0), "—");
  assert.notEqual(dateTime(new Date(0)), "—");
});

for (const [description, name, expected] of [
  ["missing name", undefined, "A"],
  ["empty name", "", "A"],
  ["whitespace-only name", " \t\n ", "A"],
  ["single word", "sawitq", "S"],
  ["one character", "q", "Q"],
  ["two words", "sawitq admin", "SA"],
  ["more than two words", "sawitq admin portal", "SA"],
  ["surrounding and repeated whitespace", " \tandi\n  saputra  ", "AS"],
  ["mixed case", "aLeShA sAwIt", "AS"],
  ["hyphenated first word", "sawit-q admin", "SA"],
]) {
  test(`initials handles ${description}`, () => {
    assert.equal(initials(name), expected);
  });
}

test("paymentStatuses exposes the exact Indonesian labels and UI tones", () => {
  assert.deepEqual(paymentStatuses, {
    paid: { label: "Lunas", tone: "success" },
    pending: { label: "Menunggu", tone: "warning" },
    failed: { label: "Gagal", tone: "danger" },
    expired: { label: "Kedaluwarsa", tone: "neutral" },
    cancelled: { label: "Dibatalkan", tone: "neutral" },
    refunded: { label: "Dikembalikan", tone: "neutral" },
  });
});

test("paymentStatuses keys are case-sensitive and unknown statuses have no mapping", () => {
  assert.equal(paymentStatuses.PAID, undefined);
  assert.equal(paymentStatuses.unknown, undefined);
});
