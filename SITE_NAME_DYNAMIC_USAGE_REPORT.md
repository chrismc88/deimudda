# Dynamic Site Name Usage Report

This report documents all places in the codebase where the site name (previously hardcoded as "deimudda") is used, and whether it has been refactored to use the dynamic `site_name` system setting.

## Refactored to Dynamic
- `client/src/components/Header.tsx` — Site name in header now uses `useSiteName` hook.
- `client/src/components/Footer.tsx` — Site name in footer now uses `useSiteName` hook.
- `client/src/pages/About.tsx` — All visible references to "deimudda" now use `useSiteName` hook.

## Still Hardcoded (to review)
- Documentation files (README.md, DEIMUDDA_AI_RECONSTRUCTION_GUIDE.md, etc.) — informational only, not user-facing.
- Email templates, notification messages, and external links (e.g., info@deimudda.de, https://deimudda.de) — may require further review if dynamic branding is needed.
- Bucket names, environment variables, and config (e.g., deimudda-images) — only change if branding is to be fully dynamic.

## Next Steps
- Review any remaining user-facing UI components/pages for hardcoded site name.
- Decide if documentation, email addresses, and external URLs should be made dynamic or remain as-is.
- If full dynamic branding is required, extend the dynamic logic to those areas.

---
_Last update: 2025-11-16 by GitHub Copilot_
