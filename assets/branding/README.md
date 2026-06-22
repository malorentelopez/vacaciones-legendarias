# Verano Legendario — Branding

Original logo assets for the app.

| File | Usage |
|------|-------|
| `logo-icon.png` | Favicon, app icon, compact nav |
| `logo-full.png` | Login screens, sidebar header |

Sync to both apps:

```bash
pnpm branding:sync
```

This copies files to `apps/player/public/`, `apps/admin/public/`, and sets `app/icon.png` + `app/apple-icon.png`.

UI component: `<AppLogo variant="full|icon" size="sm|md|lg" />` from `@repo/ui`.
