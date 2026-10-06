# ShiftLedger

Attendance and payroll preparation for a small business. See [the product brief](PROJECT_BRIEF.md).

## Milestone 1 — local interface demo

Design revision: the supplied dashboard reference replaces the original orange/light design direction with a dark default, charcoal surfaces, violet attendance charts, blue actions, and a compact sidebar. Light mode is still available. Employee hour bars and review progress are calculated from the fictional records and update after correction review; missing punches never receive estimated hours. The new theme preference uses a versioned key so the old design preference does not override the redesign on first visit.

Next.js 16.3.8, React 19.2.8, TypeScript, Tailwind CSS 4, Font Awesome Free, and ASP.NET Core on .NET 10 LTS (SDK 10.0.401). npm's lockfile pins the frontend dependency tree. PostgreSQL/Supabase Auth integration is planned; no live database or real accounts are configured yet.

Run the interface:

```powershell
cd web
npm ci
npm run dev
```

Open http://localhost:3000. The demo uses one fictional business and eight fictional employees. Admin review actions and Staff clock actions are an isolated browser sandbox. Correction drafts/decisions and clock activity persist in this browser, with a 200-action limit. Reset demo clears both, and never sends emails, alters real data, or calculates actual payroll. Theme preference persists locally. Switch roles using the demo selector.

Run the API foundation in another terminal:

```powershell
dotnet run --project api --urls http://localhost:5050
```

Health endpoint: http://localhost:5050/health. This foundation is separate from the interface demo; business API routes and token validation will be added together with Supabase integration. No unauthenticated business write endpoints are exposed.

## Verify

```powershell
cd web
npm run lint
npm run build
npm test
npm run test:e2e
```

```powershell
dotnet build api
```

In the browser: filter attendance, approve the prepared correction, export approved records, switch to Staff, clock in, start/end a break, and clock out. Try narrow layouts and both themes. CSV exports use approved, exception-free completed records; text cells are protected from spreadsheet formula injection.

Browser tests use installed Microsoft Edge; adjust `channel` in `web/playwright.config.ts` for another Chromium installation. The tests cover correction approval/rejection, export inclusion, staff views, double taps, break transitions, theme and demo persistence, reset, malformed storage, failed writes, the activity limit, navigation, and mobile page overflow. These are interface checks, not proof of server-side authorization (not implemented yet).

Dependency audit on October 6, 2026: no production dependency vulnerabilities reported. Five high-severity development-tool findings stem from the Next ESLint plugin's `fast-glob` → `micromatch` → `braces` dependency chain. The available audit suggestion downgrades Next's lint config to an incompatible major; no patched `braces` release is available from npm at setup. Recheck this chain before CI processes untrusted glob patterns. No forced downgrade was applied.

## Next milestones

1. Confirm business timezone, hourly pay basis, break policy, and export format using an anonymized example. Demo assumes Asia/Singapore and unpaid explicit breaks; these are provisional.
2. Configure Supabase PostgreSQL and Auth; enforce business, role, and employee scope in .NET.
3. Persist server-timestamped events with idempotency, transactions, and constraints; corrections preserve originals and require review.
4. Add locked period approval, reliable attendance exports, then precise payroll snapshots and published slips.

## One small change to try

Change a fictional employee's department in `web/src/lib/demo.ts`, then check Employees and Attendance. The data flows from the demo module into the screen, the filter selects matching rows, and the export selects only approved completed rows. In the persistent milestone, the same screen will request those records from .NET, which will authorize the request before querying PostgreSQL.


## Published browser demo

Live: https://shiftledger-demo.netlify.app. See [deployment notes](DEPLOYMENT.md) for updating the existing Netlify project. Eight browser checks passed against the public site on October 6, 2026, including refresh persistence, reset, failed storage, and the 200-action limit.
