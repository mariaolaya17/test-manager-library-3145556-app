# test-manager-library-3145556-app

Manager Library Frontend — React 18 + Vite + React Router.

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

Or with Docker (from `infra/`):

```bash
docker compose up -d
```

The frontend connects to the API at `VITE_API_URL` (default: `http://localhost:8000/api/v1`).

## Features

- **Login** — username + password, JWT stored in sessionStorage
- **Books** — search, filter by category, pagination, create/edit/delete (admin only)
- **Members** — list, search, create
- **New Loan** — select member + 1-3 books, shows errors in Spanish
- **Loans** — list with filters (date range, status, member), return items
- **Overdue** — list overdue loans ordered by days late
- **Report** — most borrowed books by date range (admin only)
- **Users** — create librarians (admin only)

## Environment variables

See `.env.example`.
