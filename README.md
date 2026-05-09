# Inventr

**Inventr** est une application web progressive (PWA) de gestion de patrimoine personnel. Elle permet de centraliser vos biens, documents et garanties en un seul endroit.

🌐 [inventr.fr](https://www.inventr.fr)

---

## Fonctionnalités

- 📦 Inventaire de biens (nom, catégorie, valeur, date d'achat, garantie)
- 🔍 Recherche de biens par nom (temps réel, optimisée)
- 📄 Gestion de documents (factures, manuels, certificats)
- 🔔 Alertes de garanties expirant bientôt
- 🔐 Authentification sécurisée (JWT, vérification email)
- 📱 PWA mobile-first, installable sur iOS et Android
- 🔒 Conformité RGPD (export JSON/CSV/XLSX et suppression de données)
- 🗺️ Roadmap publique et historique des versions (changelog)
- 🛠️ Suivi de maintenance (historique, rappels d'échéance)
- 🧭 Checklist de démarrage pour les nouveaux utilisateurs
- 🔃 Tri de l'inventaire par nom, prix, date d'achat ou garantie

---

## Stack technique

### Frontend

- [Angular 19](https://angular.dev) - framework principal
- [Tailwind CSS v4](https://tailwindcss.com) - styles
- [Lucide Angular](https://lucide.dev) - icônes
- [ExcelJS](https://github.com/exceljs/exceljs) - export XLSX
- Déployé sur [Vercel](https://vercel.com)

### Backend

- [NestJS](https://nestjs.com) - framework Node.js
- [TypeORM](https://typeorm.io) - ORM
- [PostgreSQL](https://www.postgresql.org) via [Supabase](https://supabase.com)
- [Supabase Storage](https://supabase.com/storage) - stockage de documents
- [Resend](https://resend.com) - emails transactionnels
- Déployé sur [Railway](https://railway.app)

---

## Architecture

```
inventr/
├── frontend/          # Application Angular 19
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/          # Services, guards, intercepteurs
│   │   │   ├── features/      # Pages (assets, auth, profile...)
│   │   │   └── shared/        # Composants partagés (navbar, sidebar...)
│   │   └── environments/      # Configuration par environnement
│   └── ngsw-config.json       # Configuration PWA
│
└── backend/           # API NestJS
    └── src/
        ├── assets/            # Gestion des biens
        ├── auth/              # Authentification & RGPD
        ├── documents/         # Gestion des documents
        ├── email/             # Service d'emails
        ├── maintenance-events/# Événements de maintenance
        ├── storage/           # Supabase Storage
        └── migrations/        # Migrations TypeORM
```

---

## Lancer le projet en local

### Prérequis

- Node.js >= 20
- npm
- Un projet Supabase (BDD + Storage)
- Un compte Resend

### Backend

```bash
cd backend
cp .env.example .env   # Remplir les variables
npm install
npm run start:dev
```

Variables d'environnement requises :

```env
NODE_ENV=development
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRATION=
JWT_REFRESH_EXPIRATION=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
EMAIL_FROM=
CONTACT_EMAIL=
FRONTEND_URL=http://localhost:4200
PORT=3000
```

### Frontend

```bash
cd frontend
npm install
ng serve
```

L'application est accessible sur `http://localhost:4200`.

---

## Tests

```bash
# Backend
cd backend
npm test                # Tests unitaires
npm run test:cov        # Couverture de code
```

---

## Workflow Git

```
dev → staging → main (production)
```

- `dev` - développement quotidien
- `staging` - intégration et tests avant prod
- `main` - production, déploiement automatique

Chaque PR vers `staging` ou `main` déclenche automatiquement les tests CI (GitHub Actions).

---

## Licence

Projet privé - © 2026 Inventr. Tous droits réservés.
