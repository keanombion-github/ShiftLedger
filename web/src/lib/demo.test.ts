import assert from "node:assert/strict";
import test from "node:test";
import { attendanceCsv, csvCell, initialAttendance } from "./demo.ts";

test("CSV excludes unresolved records and splits regular/overtime minutes", () => {
  const csv = attendanceCsv(initialAttendance);
  assert.equal(csv.split("\r\n").length, 7);
  assert.ok(!csv.includes("Morgan Lee"));
  assert.ok(!csv.includes("Riley Santos"));
  assert.ok(csv.includes('"60","480","60","Approved"'));
  assert.ok(csv.includes('"2026-10-05","22:00 – 07:00 (+1)"'));
});
test("CSV neutralizes formulas, preserves quotes and line breaks", () => {
  assert.equal(csvCell(" =SUM(A1)"), '"\' =SUM(A1)"');
  assert.equal(csvCell("@command"), '"\'@command"');
  assert.equal(csvCell('a,"b"\nc'), '"a,""b""\nc"');
});
