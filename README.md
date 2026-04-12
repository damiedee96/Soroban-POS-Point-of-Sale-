# Soroban POS — Point of Sale

A next-generation POS platform for SMEs combining traditional retail operations with optional Soroban/Stellar blockchain payments.

## Project Structure

```
soroban-pos/
├── client/          # React frontend (Vite + Tailwind)
├── server/          # Node.js / Express backend
├── blockchain/      # Soroban smart contracts (Rust)
└── docker-compose.yml
```

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Rust + Soroban CLI (for blockchain layer)
- Docker (optional)

### Development

```bash
# Install all dependencies
npm run install:all

# Start dev servers (backend + frontend)
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` in both `client/` and `server/` and fill in values.

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS        |
| Backend     | Node.js, Express, Prisma ORM        |
| Database    | PostgreSQL                          |
| Blockchain  | Soroban (Stellar smart contracts)   |
| Payments    | Flutterwave, Paystack, Stripe       |
| Auth        | JWT + bcrypt                        |

## Phases

- **Phase 1 (MVP):** Core POS, inventory, reporting
- **Phase 2:** Payment gateway integrations, receipts
- **Phase 3:** CRM, analytics dashboard, multi-branch
- **Phase 4:** Soroban smart contracts, crypto payments
