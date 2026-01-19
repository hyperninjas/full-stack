## 2026-01-19 - Iconify Bundle Bloat
**Learning:** The `IconifyIcon` component imports full JSON datasets for multiple icon libraries (material-symbols, eva, etc.) into the client bundle. This likely causes massive bundle bloat.
**Action:** In the future, refactor `IconifyIcon` to use dynamic imports or an API to fetch icon data on demand, rather than bundling all icon sets.
