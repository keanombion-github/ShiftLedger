# ShiftLedger — attendance and payroll preparation

Prepared for Kean Ombion. Copy this file into a new project folder as the starting brief for a new chat.

## Name and purpose

**Recommended working name: ShiftLedger.** “Shift” connects to attendance and schedules; “Ledger” connects to reviewed records and pay preparation. Alternatives: CrewClock, PayRoster, and WorkTally. These are name suggestions, not verified trademarks or available domains. Check availability before selling under a name.

Build a practical app for a small business currently tracking attendance and preparing pay in spreadsheets. Staff record attendance and review their own records. Administrators review exceptions, approve corrections, generate attendance tables, export approved hours, and prepare draft payroll.

Start with attendance and payroll exports. Add payroll preparation after the attendance workflow is trustworthy. The public demo should be useful for a portfolio; commercial use is a later decision based on customer feedback and verified requirements.

## Product boundaries

- First customer type: one small business with hourly-paid staff and spreadsheet-based attendance/pay preparation.
- First deployment: one business, Admin and Staff roles. Keep a business identifier in records; do not claim multi-business SaaS or offer public business registration yet.
- Admin manages employees, schedules, corrections, attendance approval, exports, rates, and pay runs.
- Staff can only see their own attendance, requests, and published payslips. Staff cannot edit rates or approve attendance.
- Public demo: fictional employees, schedules, punches, and pay runs. Clearly separate it from actual business data.
- No bank payouts, tax filing, statutory contribution engine, biometric verification, or accounting integration in the MVP.
- No guarantee of zero hosting cost or production payroll compliance. Check provider limits and business requirements before deployment or sale.

## Validate before building

Ask an owner to show an anonymized attendance sheet and describe a pay period. Learn how they record breaks, approve overtime, correct forgotten punches, and handle schedule changes. Confirm their timezone, pay frequency, employee types, and export format.

Write one example from attendance through pay preparation and have the owner check it. Do not import their real employee records into a public demo. If the first business uses daily or monthly salaries, revise the pay model explicitly rather than treating every employee as hourly.

## Technology choices

Use supported, compatible stable versions at setup; pin them and document them in the README. Read the installed Next.js bundled guidance before writing framework code.

| Part | Choice | What it does and why |
| --- | --- | --- |
| Interface | Next.js, React, TypeScript | Builds staff/admin pages; builds on Kean's frontend skills. |
| Styling | Tailwind CSS and shared CSS theme tokens | Keeps layouts, tables, forms, and both themes consistent. |
| Icons | Font Awesome Free with the official React component | Familiar icons without a paid kit; import only used icons. |
| Text font | Inter, self-hosted where practical; system sans-serif fallback | Clear text and readable table figures. Font Awesome is for icons, not body text. |
| Backend | ASP.NET Core on a supported .NET LTS release | Enforces access, attendance rules, approvals, and pay calculations. |
| Data access | EF Core with Npgsql | Models relationships, migrations, and transactions; learn the SQL it produces. |
| Database | Supabase PostgreSQL | Stores attendance, employees, schedules, and immutable pay-run snapshots. |
| Authentication | Supabase Auth | Handles identity; .NET validates tokens and applies application permissions. |
| API data | TanStack Query | Manages fetching, loading/error states, and refresh after changes. |
| Forms | React Hook Form and Zod | Helps users enter valid data; backend validation remains authoritative. |
| Exports | CSV first; XLSX later if users need it | CSV is a useful spreadsheet handoff without an elaborate reporting service. |
| Payslips | Print-friendly HTML with Save as PDF first | A simple, understandable route to downloadable slips. |
| Checks | xUnit for domain rules; Playwright for key journeys | Verify calculations, permissions, corrections, and approval behavior. |
| Hosting direction | Netlify frontend, Render API, Supabase database | Familiar to existing projects. Verify current free-tier capacity across the account before creating resources. |

Do not add Redis, background queues, microservices, AI, or a separate reporting service until there is a specific need.

### How the pieces connect

Staff/Admin browser → Next.js interface → .NET API → PostgreSQL.

Supabase Auth identifies the signed-in person. The API maps that identity to the business, employee, and role. It checks authorization on every request, not just in navigation. Keep database/service credentials on the server. A database connection that bypasses row-level security still needs explicit business/employee filters in the API.

## Design direction

Use a clean operations dashboard, with warm orange as the primary accent. **Light theme by default; dark theme has a pure-black `#000000` page background.** Avoid tinted purple/navy dark backgrounds.

| Token | Light | Dark |
| --- | --- | --- |
| Page background | `#F7F7F5` | `#000000` |
| Card/sidebar surface | `#FFFFFF` | `#111111` |
| Secondary surface | `#F0F0EC` | `#191919` |
| Primary text | `#171717` | `#F5F5F5` |
| Muted text | `#525252` | `#A3A3A3` |
| Border | `#D4D4D4` | `#333333` |
| Orange accent | `#C2410C` | `#FB923C` |
| Primary button | `#C2410C` with white text | `#FB923C` with black text |

These are starting tokens; verify contrast, hover, focus, disabled, and error states in both themes. Use orange for key actions and active navigation. Do not make every card orange. Use text labels alongside status colors.

- Font Awesome Free icons for dashboard, clock, calendar, people, approvals, reports, payslips, settings, and theme switching. Icon-only actions need accessible labels; decorative icons are hidden from assistive technology.
- Admin: sidebar, page title/action row, a few useful summary cards, and the main table.
- Staff: mobile-first dashboard with a prominent clock action, today's schedule, and personal attendance history.
- Persist theme preference; respect reduced motion; support keyboard navigation.
- Tables: sticky headers where helpful, tabular numbers, clear column labels, date filters, search, and pagination. Do not show fake trends as real analytics.
- On phones, use compact record cards or a labeled scrolling table; keep clocking and approval actions touch-sized.
- Every navigation item leads to working content. Include loading, empty, unavailable, and error states.

## Pages and workflows

### Staff

1. Login: invited staff account; no self-registration in the initial business app.
2. My day: scheduled shift, current attendance state, clock in/out, break start/end.
3. My attendance: date range and daily rows with punches, breaks, worked minutes, and status.
4. Corrections: request a missing/incorrect punch with the intended timestamp and reason; view pending/approved/rejected requests.
5. My payslips: published slips only. Never show another employee's pay.

### Admin

1. Overview: who is clocked in, missing punches, pending corrections, and attendance awaiting approval.
2. Employees: invite staff, active/inactive state, employment/pay configuration. Deactivation preserves history.
3. Schedules: simple weekly shifts and dated exceptions. One shift per employee per day for the MVP; an overnight shift may finish the next day.
4. Attendance: review table, employee/date filters, unresolved issues, and period totals.
5. Approvals: approve/reject requests with a reason and review attendance before export.
6. Reports: daily/monthly/period attendance tables and CSV downloads.
7. Payroll preparation: create a draft from approved attendance, inspect inputs and adjustments, approve/finalize, then publish payslips.
8. Settings: business identity, timezone, pay period, and explicitly configured demo rules.

### Attendance tables

Daily detail columns: employee, work date, scheduled start/end, first in, last out, break minutes, worked minutes, late minutes, overtime candidate minutes, approval state, and exception.

Period summary columns: employee, scheduled days, recorded days, missing/exception days, approved regular hours, approved overtime hours, and approval state. Do not call a day “absent” solely because a punch is missing; review the schedule and exceptions first.

## Rules that make the records trustworthy

### Clocking and time

- The server timestamps normal clock actions in UTC. Store the business timezone and render dates locally; browser clocks are not authoritative.
- Start with one open attendance session per employee, enforced in the database. Reject double clock-in and clock-out without an open session.
- Make repeated requests safe: a double tap or network retry must not create a second punch. Use idempotency keys and uniqueness constraints.
- Track explicit breaks. Breaks cannot overlap or occur outside the session. Validate timestamps and nonnegative durations.
- Flag missing clock-out or an open break for review. Do not manufacture worked hours.
- Attribute an overnight shift to its scheduled start date, with timezone-aware reporting. Test month/pay-period boundaries.
- Preserve the original events. An approved correction changes the effective record and records requester, reviewer, reason, and timestamps; it must not silently erase evidence.
- Lock approved periods against silent changes. Reopening requires authorization and an audit entry.
- Clocking proves a submitted action, not physical presence. GPS, device checks, biometric attendance, and anti-fraud claims are outside this version.

### Draft payroll

- Only approved, exception-free attendance enters a pay run. Unresolved records block inclusion or produce an explicit exclusion warning.
- First demo calculation: approved regular minutes × hourly rate ÷ 60, plus approved overtime under a labeled configurable sample multiplier, plus explicit adjustments.
- Overtime candidates are not automatically approved pay. Do not double count regular/overtime minutes or combine overnight/night/holiday premiums without specified rules.
- Attendance lateness is a report value. Do not introduce an extra lateness deduction on top of pay for actual minutes without a reviewed rule.
- Use precise decimal arithmetic and a documented rounding rule. Save final currency amounts as integer minor units; never use floating-point arithmetic for money.
- Snapshot employee identity, period, rates, attendance inputs, policy version, adjustments, totals, and approver into finalized pay-run items. Later rate or profile edits must not rewrite previous slips.
- Pay-run states: Draft → Finalized → Published. Finalized/published runs are immutable; use a documented reversal or replacement workflow if corrections are needed.
- Prevent overlapping finalized runs for the same employee/period. Export or download does not mark salary paid.
- Show employee-facing slips only after publication. Label demo slips “Sample calculation — not for actual payroll.”

## Minimum data model

| Record | Responsibility |
| --- | --- |
| Business | Timezone, currency, name, policy configuration |
| UserMembership | Auth identity, business, Admin/Staff role, linked employee |
| Employee | Staff profile, active state; pay data restricted to authorized views |
| PayRate | Effective-dated rate and pay basis |
| ScheduledShift | Employee, dated start/end, expected breaks |
| AttendanceEvent / Session | Original clock events, server time, session boundaries and breaks |
| CorrectionRequest | Requested change, reason, reviewer, decision |
| AttendanceApproval | Effective reviewed totals, period/version, approver |
| PayRun / PayRunItem | Period, status, immutable inputs and calculated amounts |
| Adjustment | Itemized amount, type, reason, and approval |
| AuditEvent | Actor, action, affected record, timestamp, and relevant change details |

Use database transactions for approvals and finalization. Add foreign keys, uniqueness constraints, and concurrency checks so simultaneous reviewers cannot overwrite decisions.

## Public demo

Seed one fictional business, approximately 8 employees, and realistic sample history: regular shifts, overnight shift, missing clock-out, correction request, approved overtime, and a published sample slip.

Provide clearly labeled Admin demo and Staff demo entry points. Keep demo roles and data separate from real accounts. Prefer public read-only exploration plus an isolated resettable interactive sandbox for actions. If implementing only one initially, document what visitors can and cannot do.

Do not weaken real authorization to make the demo work. Never use real employee names, salaries, bank details, IDs, or uploaded documents. Do not send emails or trigger payments from demo actions. Explain persistence and reset behavior.

Suggested walkthrough: inspect attendance → review a missing-punch request → approve corrected hours → export attendance → inspect a draft calculation → publish a sample payslip → see that slip as its staff member. A read-only walkthrough should use prepared states rather than pretend an action changed data.

## Learning and build milestones

1. **Discover:** agree on one business workflow and write example attendance/pay calculations. Explain scope before coding.
2. **Design:** build representative admin/staff screens, orange tokens, both themes, and responsive tables. Use fictional data.
3. **Identity:** add login, invitations, role and employee scope. Demonstrate that staff cannot retrieve another employee's records through the API.
4. **Attendance:** persist clock/break events, prevent duplicates, and handle overnight sessions. Explain the difference between a timestamp and a local work date.
5. **Review:** corrections, audit trail, period approvals, and conflicts. Explain original versus effective attendance.
6. **Reports:** produce tables and CSV exports from reviewed data. Validate totals against a small hand-calculated example.
7. **Pay preparation:** precise draft calculations, approvals, immutable snapshots, and published slips. Explain why changing a rate cannot change old payroll.
8. **Demo:** isolated sample data, admin/staff entry, hosting, reset behavior, screenshots, and README.
9. **Pilot:** privately review the app with an owner, record feedback, and resolve gaps before considering actual payroll use.

At each milestone, explain what changed, trace one request from screen to database and back, show how to verify it, and give Kean one small change to make himself. Keep tasks bounded; avoid unnecessary agents and repeated whole-repository reads.

## Validation and finish criteria

Meaningful checks cover staff/admin permissions, duplicate punches, open breaks, missing punches, overnight/pay-period boundaries, corrections, approval races, rate changes, rounding, pay-run locking, and demo isolation. Validate CSV formula injection for text cells; escape untrusted data in HTML/print output.

Check narrow/wide layouts and both themes, keyboard access, readable focus indicators, loading/errors, API failure recovery, and print output. No real emails or payments during tests.

The demo is finished when staff attendance, admin review, exported tables, a draft run, and a published sample payslip form a coherent journey; data behavior and limitations are documented; the important rule checks pass; and Kean can explain the workflow and make a small change independently.

## From portfolio demo to possible business offer

Initial offer: attendance setup, staff onboarding, approval workflow, spreadsheet exports, and support for a small business. Validate willingness to pay before building subscriptions or multi-business tenancy.

Before commercial payroll: verify the target jurisdiction's current pay/overtime/holiday, tax, contribution, payslip, recordkeeping, and privacy requirements with qualified input. Establish backups and restoration, account recovery, access controls, monitoring, correction procedures, support expectations, and data export/deletion policies. Demo rules do not establish legal compliance.

Free-tier hosting may suit a small demonstration, subject to current capacity and limits. Business-critical timekeeping should budget for reliable availability and backups. If free projects are already used by other apps, choose deliberately; never repurpose an existing production database without authorization.

## New-chat starter prompt

> We are building ShiftLedger from this brief. Start by inspecting the project folder and applicable instructions. Build attendance and payroll exports first, then payroll preparation. Use Next.js/TypeScript, a .NET API, Supabase PostgreSQL/Auth, and Font Awesome Free icons. Use a light default theme with orange accents and a pure-black dark background. Keep Admin and Staff permissions enforced server-side. Use fictional demo data only. Teach me the decisions, give me small milestones and changes I can make myself, and validate each useful workflow before moving on. Do not claim production payroll compliance or deploy paid services without my explicit approval.

## Implementation references

- [Font Awesome React setup](https://docs.fontawesome.com/web/use-with/react/) — use its official React component and Free icon packages.
- [Font Awesome with Next.js](https://docs.fontawesome.com/web/use-with/react/use-with/) — review the framework-specific CSS setup.
- [ASP.NET Core JWT bearer authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication) — validate identity before application authorization.
- [Supabase Auth documentation](https://supabase.com/docs/guides/auth) — check current auth and deployment setup when scaffolding.

These are implementation references, not confirmation of payroll compliance, hosting eligibility, or name availability.
