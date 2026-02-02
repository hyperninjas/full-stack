# Bolt's Journal

## 2024-05-22 - [Bundle Size Bloat from Iconify]
**Learning:** The `IconifyIcon` component was importing entire icon sets (JSON files) statically, resulting in a ~9MB main bundle. This defeats the purpose of code splitting and significantly hurts initial load time.
**Action:** Use `@iconify/react`'s default fetching mechanism or dynamic imports for collections. Avoid importing full icon datasets in the main bundle.
