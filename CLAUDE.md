# RIA Builder - Project Rules

## Project Overview
RIA Builder is a practice management and workflow tool for Registered Investment Advisors. It helps organize prospect experience, client operations, compliance, and growth initiatives.

## Tech Stack
- Frontend: React
- Styling: Tailwind CSS
- Backend: Firebase
- Language: TypeScript

## Architecture
### Core Principles
- Configuration-driven: All categories, pages, statuses defined in config, not hardcoded
- Single source of truth: CATEGORY_STRUCTURE in src/ideaStore.ts
- Loosely coupled: Components are generic, receive data as props
- Data-driven UI: Render dynamically from config, use mapping over arrays
- Modular: Features are independent, can be added/removed without breaking others

### Single Source of Truth Locations
| Data | Location |
|------|----------|
| Categories & default pages | `src/ideaStore.ts` → `CATEGORY_STRUCTURE` |
| Custom pages | Firebase `customPages` collection |
| Ideas | Firebase `ideas` collection |
| Merged page list | `getPagesForCategory()` function |

### Key Files
| File | Purpose |
|------|---------|
| `src/ideaStore.ts` | Category structure, defaults, and main store |
