# Shop-Hub

Modern e-commerce platform with admin panel, payment integration, and multi-language support.

## Tech Stack

**Frontend:** Next.js 14, TypeScript, Tailwind CSS, Zustand, Shadcn/ui  
**Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT  
**Payment:** Stripe  
**Storage:** Cloudinary  
**Infrastructure:** Turborepo

## Quick Start

### Prerequisites

-   Node.js 18+
-   PostgreSQL 14+
-   Yarn
-   Stripe account
-   Cloudinary account

### Development Setup

Clone and install dependencies:

```bash
git clone <repo-url> shop-hub
cd shop-hub
yarn install
```

Setup environment variables:

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your database, JWT secret, Stripe, and Cloudinary credentials

# Frontend
cd ../frontend
cp .env.example .env.local
# Edit .env.local with API URL and Stripe publishable key
```

Run database migrations and seed:

```bash
cd backend
npx prisma db push
npx tsx prisma/seed.ts
```

Start development servers:

```bash
# From root directory
yarn dev
```

The frontend will be available at http://localhost:3000 and the API at http://localhost:5000.

### Demo Account

After seeding, you can login to admin panel with:

-   Email: `admin@shop-hub.com`
-   Password: `admin123`

## Project Structure

```
shop-hub/
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (admin)/    # Admin panel
│   │   │   └── (shop)/     # Shop pages
│   │   ├── components/
│   │   ├── stores/         # Zustand stores
│   │   ├── lib/            # i18n, API client
│   │   └── types/
│   └── public/
├── backend/           # Express API
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── middleware/
│   │   ├── routes/
│   │   │   ├── admin/
│   │   │   └── user/
│   │   ├── services/       # Stripe, Cloudinary
│   │   └── server.ts
│   └── uploads/
└── package.json       # Turborepo config
```

## Available Scripts

```bash
yarn dev              # Start all services
yarn build            # Build all packages
yarn lint             # Lint all packages

# Backend specific
cd backend
yarn dev              # Start backend server
npx prisma studio     # Open Prisma Studio GUI

# Frontend specific
cd frontend
yarn dev              # Start frontend server
yarn build            # Build for production
```

## Features

-   User authentication (JWT)
-   Multi-language support (English, Ukrainian, Russian)
-   Dark/Light theme toggle
-   Shopping cart with localStorage persistence
-   Favorites system
-   Product search and filtering (category, price, name)
-   Stripe payment integration
-   Order management (users and admins)
-   Admin panel (products, categories, orders, statistics)
-   Product reviews and ratings
-   Image upload via Cloudinary
-   Responsive design

## License

MIT
