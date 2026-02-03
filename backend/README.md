# Backend - Event Reservation API

## 🏗️ Architecture NestJS

API RESTful construite avec NestJS pour la gestion d'événements et de réservations.

## 📦 Stack

- **Framework**: NestJS (TypeScript)
- **Base de données**: PostgreSQL avec Prisma ORM
- **Authentification**: JWT + Passport
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Tests**: Jest
- **PDF**: pdfkit

## 📁 Structure

```
backend/
├── src/
│   ├── auth/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── dto/
│   │   │   ├── register.dto.ts
│   │   │   └── login.dto.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   ├── users/
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── dto/
│   │   ├── users.controller.ts
│   │   ├── users.module.ts
│   │   └── users.service.ts
│   ├── events/
│   │   ├── entities/
│   │   │   └── event.entity.ts
│   │   ├── dto/
│   │   │   ├── create-event.dto.ts
│   │   │   └── update-event.dto.ts
│   │   ├── enums/
│   │   │   └── event-status.enum.ts
│   │   ├── events.controller.ts
│   │   ├── events.module.ts
│   │   └── events.service.ts
│   ├── reservations/
│   │   ├── entities/
│   │   │   └── reservation.entity.ts
│   │   ├── dto/
│   │   │   └── create-reservation.dto.ts
│   │   ├── enums/
│   │   │   └── reservation-status.enum.ts
│   │   ├── reservations.controller.ts
│   │   ├── reservations.module.ts
│   │   └── reservations.service.ts
│   ├── common/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── transform.interceptor.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   └── utils/
│   │       └── pdf-generator.util.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── test/
│   ├── auth.e2e-spec.ts
│   ├── events.e2e-spec.ts
│   └── reservations.e2e-spec.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── .env.example
├── nest-cli.json
├── package.json
├── tsconfig.json
└── Dockerfile
```

## 🚀 Installation

```bash
# Installation des dépendances
npm install

# Configuration
cp .env.example .env

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev

# Seed (optionnel)
npm run seed
```

## 🔧 Scripts Disponibles

```bash
# Développement
npm run start:dev          # Mode watch avec hot-reload

# Production
npm run build              # Build production
npm run start:prod         # Démarrage production

# Tests
npm run test               # Tests unitaires
npm run test:watch         # Tests en mode watch
npm run test:e2e           # Tests E2E
npm run test:cov           # Coverage

# Base de données
npm run migration:generate # Générer migration
npm run migration:run      # Appliquer migrations
npm run db:seed            # Seed data

# Linting & Formatting
npm run lint               # ESLint
npm run format             # Prettier
```

## 🔐 Variables d'Environnement

Créer un fichier `.env` :

```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/event_reservation"

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# PDF
PDF_LOGO_PATH=./assets/logo.png
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur (🔒)

### Events (Public)
- `GET /api/events` - Liste des événements publiés
- `GET /api/events/:id` - Détail d'un événement

### Events (Admin)
- `POST /api/events` - Créer un événement (🔒 Admin)
- `PUT /api/events/:id` - Modifier un événement (🔒 Admin)
- `PATCH /api/events/:id/publish` - Publier (🔒 Admin)
- `PATCH /api/events/:id/cancel` - Annuler (🔒 Admin)
- `GET /api/events/:id/reservations` - Réservations d'un événement (🔒 Admin)
- `GET /api/events/stats/dashboard` - Statistiques (🔒 Admin)

### Reservations (Participant)
- `POST /api/reservations` - Créer une réservation (🔒)
- `GET /api/reservations/my` - Mes réservations (🔒)
- `DELETE /api/reservations/:id` - Annuler ma réservation (🔒)
- `GET /api/reservations/:id/ticket` - Télécharger ticket PDF (🔒)

### Reservations (Admin)
- `GET /api/reservations` - Toutes les réservations (🔒 Admin)
- `PATCH /api/reservations/:id/confirm` - Confirmer (🔒 Admin)
- `PATCH /api/reservations/:id/refuse` - Refuser (🔒 Admin)
- `DELETE /api/reservations/:id/admin` - Annuler (🔒 Admin)

## 🧪 Tests

### Tests Unitaires

```bash
# Lancer tous les tests unitaires
npm run test

# Tests avec coverage
npm run test:cov

# Mode watch
npm run test:watch
```

### Tests E2E

```bash
# Lancer les tests E2E
npm run test:e2e

# Tests E2E spécifiques
npm run test:e2e -- auth.e2e-spec
```

## 🔒 Sécurité

- ✅ JWT avec expiration
- ✅ Guards pour l'authentification
- ✅ Guards pour les rôles (RBAC)
- ✅ Validation des DTOs
- ✅ Hash bcrypt pour les mots de passe
- ✅ CORS configuré
- ✅ Rate limiting (à implémenter)
- ✅ Helmet pour les headers de sécurité

## 📖 Documentation Swagger

URL: `http://localhost:3000/api/docs`

La documentation complète de l'API est générée automatiquement avec Swagger/OpenAPI.

## 🐳 Docker

```bash
# Build l'image
docker build -t event-reservation-api .

# Run le container
docker run -p 3000:3000 --env-file .env event-reservation-api
```

## 📝 Conventions de Code

- **Nomenclature**: camelCase pour variables/fonctions, PascalCase pour classes
- **Structure**: Un module par feature (auth, users, events, reservations)
- **DTOs**: Validation avec class-validator
- **Services**: Logique métier
- **Controllers**: Routing et validation
- **Entities**: Définition des modèles Prisma

## 🐛 Debugging

```bash
# Mode debug
npm run start:debug

# Avec VSCode, utiliser la configuration de debug dans .vscode/launch.json
```

## 🔄 CI/CD

Les tests sont automatiquement lancés sur chaque push via GitHub Actions.

Voir `.github/workflows/backend-ci.yml`

---

**Status**: 🚧 En développement
