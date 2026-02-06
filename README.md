# 🎫 Application de Réservation d'Événements

> Système de gestion d'événements et de réservations avec authentification basée sur les rôles

## 📋 Description

Application web full-stack permettant de gérer des événements (formations, ateliers, conférences) et leurs réservations avec :

- Gestion des événements (création, modification, publication, annulation)
- Système de réservation avec contrôle de capacité
- Authentification JWT avec rôles (Admin/Participant)
- Génération de tickets PDF pour les réservations confirmées
- Dashboard administrateur avec statistiques

## 🛠️ Technologies

### Backend

- **Framework**: NestJS (TypeScript)
- **Base de données**: PostgreSQL
- **ORM**: Prisma
- **Authentification**: JWT + Passport
- **Validation**: class-validator, class-transformer
- **Documentation API**: Swagger/OpenAPI
- **PDF**: pdfkit / puppeteer
- **Tests**: Jest

### Frontend

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Form Validation**: React Hook Form + Zod
- **HTTP Client**: Axios with interceptors

### DevOps

- **Containerisation**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Déploiement**: Docker Hub

## 📁 Structure du Projet

```
Application-de-reservation-d-evenements/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── auth/           # Authentification & JWT
│   │   ├── users/          # Gestion des utilisateurs
│   │   ├── events/         # Gestion des événements
│   │   │   ├── dto/        # DTOs pour la validation
│   │   │   └── entities/   # Entités événements
│   │   ├── reservations/   # Système de réservation
│   │   │   ├── dto/        # DTOs pour la validation
│   │   │   └── entities/   # Entités réservations
│   │   ├── pdf/            # Service de génération PDF
│   │   └── common/         # Utilitaires partagés
│   ├── test/               # Tests unitaires et E2E
│   └── Dockerfile
├── frontend/               # Application client Next.js
├── docs/                   # Documentation
│   ├── SPCIFI~1.MD        # Spécification technique
│   └── Planification JIRA...
└── docker-compose.yml
```

## 🚀 Installation

### Prérequis

- Node.js >= 18.x
- npm ou yarn
- PostgreSQL >= 14
- Docker (optionnel)

### Backend Setup

```bash
cd backend

# Installation des dépendances
npm install

# Configuration de l'environnement
cp .env.example .env
# Éditer .env avec vos configurations

# Générer les fichiers Prisma
npx prisma generate

# Appliquer les migrations de la base de données
npx prisma migrate dev

# Démarrage en mode développement
npm run start:dev
```

### Frontend Setup

```bash
cd frontend

# Installation des dépendances
npm install

# Configuration
cp .env.example .env.local

# Démarrage
npm run dev
```

### Docker (Full Stack)

```bash
# Lancer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

## 📚 Documentation API

Une fois le backend lancé, la documentation Swagger est accessible à :

- **URL**: http://localhost:3000/api/docs

## 🧪 Tests

### Backend

```bash
cd backend

# Tests unitaires
npm run test

# Tests unitaires en mode watch
npm run test:watch

# Tests E2E
npm run test:e2e

# Coverage
npm run test:cov
```

## 👥 Rôles & Permissions

### 🔑 Admin

- Créer, modifier, publier et annuler des événements
- Consulter toutes les réservations
- Confirmer ou refuser des réservations
- Accéder aux statistiques et au dashboard

### 👤 Participant

- Consulter les événements publiés
- Créer des réservations
- Annuler ses propres réservations
- Télécharger son ticket PDF (si confirmé)

## 🔐 Sécurité

- ✅ Authentification JWT
- ✅ Protection par rôles (RBAC)
- ✅ Validation des données (DTO)
- ✅ Hash des mots de passe (bcrypt)
- ✅ Variables d'environnement sécurisées
- ✅ Rate limiting (à implémenter)
- ✅ CORS configuré

## 📊 Planification JIRA

Le projet est organisé en **8 Epics** sur JIRA :

1. Authentification
2. Gestion des Utilisateurs
3. Gestion des Événements (Admin)
4. Consultation des Événements (Public)
5. Réservations (Participant)
6. Gestion des Réservations (Admin)
7. Tests & Qualité
8. Docker & CI/CD

Voir [Planification JIRA](./docs/Planification%20JIRA%20-%20Import%20CSV%20014f8d24c5414abf86aa5142c20b4822.md) pour le détail complet.

## 🔄 Workflow Git

- `main` - Branche de production
- `develop` - Branche de développement
- `feature/*` - Branches de fonctionnalités
- Format des commits : `[SC2-XX] Description` (référence JIRA)

## 📝 Règles Métier

### Statuts des Événements

- `DRAFT` - Événement en brouillon
- `PUBLISHED` - Événement publié et visible
- `CANCELED` - Événement annulé

### Statuts des Réservations

- `PENDING` - En attente de confirmation
- `CONFIRMED` - Confirmée par l'admin
- `REFUSED` - Refusée par l'admin
- `CANCELED` - Annulée par le participant ou l'admin

### Règles de Réservation

- ❌ Pas de réservation sur événement non publié
- ❌ Pas de réservation si capacité atteinte
- ❌ Pas de doublon (1 réservation active max par user/event)
- ✅ Téléchargement PDF uniquement si status = CONFIRMED

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m '[SC2-XX] Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est développé dans le cadre d'une formation académique.

## 👨‍💻 Auteur

[Votre Nom] - [mohamedm999](https://github.com/mohamedm999)

## 📞 Support

Pour toute question, ouvrir une issue sur le dépôt GitHub.

## 🏗️ Avancement

- ✅ Authentification (JWT + RBAC)
- ✅ Gestion des événements (CRUD)
- ✅ Système de réservations
- ✅ Contrôle d'accès par rôles
- ✅ Validation des données
- ✅ Tests unitaires
- 🔄 Frontend Next.js (en cours)
- 🔄 Tests E2E (en cours)
- 🔄 Docker & CI/CD (à faire)

---

**Status**: ✅ Backend complet - Prêt pour le développement frontend
