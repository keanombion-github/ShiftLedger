export type Employee = { id: string; name: string; initials: string; department: string; role: string; color: string };
export type Attendance = { id: string; employeeId: string; date: string; shift: string; firstIn: string; lastOut: string; breakMinutes: number; workedMinutes: number | null; overtimeMinutes: number; status: "Approved" | "Needs review" | "In progress"; exception: string | null };

export const employees: Employee[] = [
  { id: "e1", name: "Alex Rivera", initials: "AR", department: "Operations", role: "Team lead", color: "orange" },
  { id: "e2", name: "Jamie Chen", initials: "JC", department: "Customer service", role: "Associate", color: "green" },
  { id: "e3", name: "Morgan Lee", initials: "ML", department: "Operations", role: "Associate", color: "blue" },
  { id: "e4", name: "Sam Patel", initials: "SP", department: "Warehouse", role: "Coordinator", color: "pink" },
  { id: "e5", name: "Casey Brooks", initials: "CB", department: "Customer service", role: "Associate", color: "orange" },
  { id: "e6", name: "Jordan Park", initials: "JP", department: "Warehouse", role: "Associate", color: "green" },
  { id: "e7", name: "Taylor Reed", initials: "TR", department: "Operations", role: "Associate", color: "blue" },
  { id: "e8", name: "Riley Santos", initials: "RS", department: "Warehouse", role: "Associate", color: "pink" },
];
export const initialAttendance: Attendance[] = [
  { id: "a1", employeeId: "e1", date: "2026-10-05", shift: "09:00 – 18:00", firstIn: "09:00", lastOut: "18:00", breakMinutes: 60, workedMinutes: 480, overtimeMinutes: 0, status: "Approved", exception: null },
  { id: "a2", employeeId: "e2", date: "2026-10-05", shift: "09:00 – 18:00", firstIn: "09:12", lastOut: "18:00", breakMinutes: 60, workedMinutes: 468, overtimeMinutes: 0, status: "Approved", exception: null },
  { id: "a3", employeeId: "e3", date: "2026-10-05", shift: "09:00 – 18:00", firstIn: "09:00", lastOut: "—", breakMinutes: 60, workedMinutes: null, overtimeMinutes: 0, status: "Needs review", exception: "Missing clock-out" },
  { id: "a4", employeeId: "e4", date: "2026-10-05", shift: "08:00 – 17:00", firstIn: "08:00", lastOut: "17:00", breakMinutes: 60, workedMinutes: 480, overtimeMinutes: 0, status: "Approved", exception: null },
  { id: "a5", employeeId: "e5", date: "2026-10-05", shift: "09:00 – 18:00", firstIn: "09:00", lastOut: "19:00", breakMinutes: 60, workedMinutes: 540, overtimeMinutes: 60, status: "Approved", exception: null },
  { id: "a6", employeeId: "e6", date: "2026-10-05", shift: "08:00 – 17:00", firstIn: "08:00", lastOut: "17:00", breakMinutes: 60, workedMinutes: 480, overtimeMinutes: 0, status: "Approved", exception: null },
  { id: "a7", employeeId: "e7", date: "2026-10-05", shift: "22:00 – 07:00 (+1)", firstIn: "22:00", lastOut: "07:00 (+1)", breakMinutes: 60, workedMinutes: 480, overtimeMinutes: 0, status: "Approved", exception: null },
  { id: "a8", employeeId: "e8", date: "2026-10-05", shift: "08:00 – 17:00", firstIn: "08:00", lastOut: "—", breakMinutes: 60, workedMinutes: null, overtimeMinutes: 0, status: "Needs review", exception: "Missing clock-out" },
];
export function duration(minutes: number | null): string {
  if (minutes === null) return "—";
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}
export function csvCell(value: unknown): string {
  const text = String(value ?? "");
  const safe = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}
export function attendanceCsv(rows: Attendance[]): string {
  const approved = rows.filter(row => row.status === "Approved" && row.workedMinutes !== null && !row.exception);
  return [
    ["Employee", "Work date", "Scheduled shift", "First in", "Last out", "Break minutes", "Regular minutes", "Approved overtime minutes", "Status"],
    ...approved.map(row => [employees.find(employee => employee.id === row.employeeId)?.name, row.date, row.shift, row.firstIn, row.lastOut, row.breakMinutes, row.workedMinutes! - row.overtimeMinutes, row.overtimeMinutes, row.status]),
  ].map(row => row.map(csvCell).join(",")).join("\r\n");
}
