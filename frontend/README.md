# Frontend Application (Next.js)

This is the frontend application for the Event Reservation System built with Next.js 14+.

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx (Landing/Home SSR)
│   │   ├── events/
│   │   │   ├── page.tsx (Liste événements - SSR)
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx (Détail événement - SSR)
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   ├── page.tsx
│   │   │   ├── register/
│   │   │   │   ├── page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx (Protected layout)
│   │   │   ├── page.tsx (Dashboard participant - CSR)
│   │   │   ├── reservations/
│   │   │   │   ├── page.tsx (Mes réservations - CSR)
│   │   ├── admin/
│   │   │   ├── layout.tsx (Admin protected layout)
│   │   │   ├── page.tsx (Dashboard admin - CSR)
│   │   │   ├── events/
│   │   │   │   ├── page.tsx (Gestion événements - CSR)
│   │   │   │   ├── create/
│   │   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── edit/
│   │   │   │   │   │   ├── page.tsx
│   │   │   ├── reservations/
│   │   │   │   ├── page.tsx (Toutes les réservations - CSR)
│   ├── components/
│   │   ├── ui/
│   │   ├── events/
│   │   ├── reservations/
│   │   ├── auth/
│   │   ├── layout/
│   ├── lib/
│   │   ├── api/
│   │   ├── store/
│   │   ├── utils/
│   ├── types/
│   ├── hooks/
├── public/
├── package.json
```

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Form Validation**: React Hook Form + Zod
- **HTTP Client**: Axios with interceptors

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Status

The frontend is planned but not yet implemented. The backend API is ready and available for integration.
