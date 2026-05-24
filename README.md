# PBX Front

React + Vite admin shell for the PBX multi-tenant SaaS.

## Requirements

- Node.js 20+
- pnpm

## Setup

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

Default dev server: http://localhost:8010

## Environment

| Variable | Description |
|----------|-------------|
| `VITE_APP_API_URL` | API base URL (e.g. `http://pbx-back.test/api/admin`) |
| `VITE_APP_TENANT` | Tenant id sent as `X-Tenant` header |
| `VITE_APP_TITLE` | Application title |

## Stack

- React 19 + Vite
- React Router
- Tailwind CSS
- Zustand + Context API
- Axios (multi-tenant headers)
