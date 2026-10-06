# Netlify demo deployment

Published October 6, 2026: https://shiftledger-demo.netlify.app. Netlify project ID: `bea85ba3-8ba3-4459-9d6b-547f9cb50d43`. Dashboard: https://app.netlify.com/projects/shiftledger-demo. The existing Netlify project is now linked to https://github.com/keanombion-github/ShiftLedger. Pushes to main build the web frontend and publish web/out to the same site URL.

The frontend is a static Next.js export. It needs no API server, database, secrets, or Netlify Functions for this milestone. `netlify.toml` specifies the `web` base directory, build command, pinned Node version, and `out` publish directory.

## Manual deployment

1. Sign in at https://app.netlify.com/drop.
2. Upload `dist/shiftledger-demo.zip`, or drag the `web/out` folder into Netlify Drop.
3. Open the assigned site URL and verify correction approval → refresh → CSV export, then Staff clock in → break → refresh → end break → clock out.
4. Use Settings → Reset demo to clear corrections and clock history. Test on a phone as well.

The zip contains the generated site files at its root, not the source project. Rebuild and replace it when the source changes:

```powershell
npm --prefix web ci
npm --prefix web run build
Compress-Archive -Path web/out/* -DestinationPath dist/shiftledger-demo.zip -Force
```

Automatic deployment uses the main branch of the ShiftLedger GitHub repository. The root netlify.toml supplies the web base directory, npm run build command, out publish directory, and Node version. Manual uploads are an optional fallback; upload to the existing project rather than creating a duplicate.

## Persistence boundaries

One versioned browser entry stores the correction decision/reason and at most 200 timestamped clock actions. Sample employee and attendance fixtures remain fixed in source; approval derives an effective record from the preserved original. Data remains on the same browser/device and site origin. Localhost progress will not transfer to the published URL. Role selection and page filters reset on refresh; correction drafts, decisions, clock state/history, and theme survive it.

Reset replaces the stored demo with its initial state and keeps theme preference. Clearing site data also removes progress. A storage failure leaves the app usable for the visit and displays a message. Invalid saved data falls back to initial fixtures and displays a recovery message. Open tabs synchronize changes through storage events, but this remains a fictional sandbox with no server authorization or durable audit guarantees.

No attendance data is sent to a server. The .NET foundation is not deployed for this browser-only milestone. The public demo does not generate real payroll or published payslips yet.

