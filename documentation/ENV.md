# 🌍 Environment Variables Guide

This document outlines the environment variables required to run SnapBulance locally and how to configure them for production migration.

---

## ⚙️ Backend (NestJS)

Create a `.env` file in the root of your `backend` directory.

```env
# -----------------------------------------------------------------------------
# BACKEND ENVIRONMENT VARIABLES
# -----------------------------------------------------------------------------

# Environment Mode
# Set to 'development' locally. Change to 'production' when deployed.
NODE_ENV=development

# Database Connection
# Local: postgresql://USER:PASSWORD@localhost:5432/snapbulance?schema=public
# Production: Use a managed PostgreSQL URL (e.g., Supabase, Neon, AWS RDS, Render)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/snapbulance?schema=public

# Redis Cache Engine
# The hostname of your Redis instance.
# Local (Bare Metal without Docker): localhost
# Local (Docker Compose): redis (Docker's internal DNS resolves this to the container)
# Production: A managed cloud endpoint (e.g., my-redis-cluster.xyz.us-east-1.amazonaws.com)
REDIS_HOST=localhost

# Redis Port (Optional if you want to make it dynamic later)
# Default is 6379. Cloud providers may issue a different port.
REDIS_PORT=6379

# Authentication
# The secret key used to sign JSON Web Tokens.
# Local: Can be any string.
# Production: MUST be a long, cryptographically secure random string (e.g., generated via `openssl rand -base64 32`).
JWT_SECRET=super_secret_snapbulance_key_change_in_prod
```

### Backend Migration Checklist

- **Database:** You cannot use `localhost` in production. Spin up a cloud PostgreSQL instance (e.g., Supabase, Neon, AWS RDS, Render) and paste its connection string into your hosting provider's environment settings.
- **Security:** Generate a fresh, highly complex `JWT_SECRET` for the production server. **Never commit the production secret to GitHub.**

---

## 💻 Frontend (React + Vite)

Create a `.env` file in the root of your `frontend` directory.

> **Note:** Vite requires all frontend variables to be prefixed with `VITE_`.

```env
# -----------------------------------------------------------------------------
# FRONTEND ENVIRONMENT VARIABLES
# -----------------------------------------------------------------------------

# Environment Mode
# Set to 'development' locally. Change to 'production' when deployed.
VITE_ENVIRONMENT=development

# Backend API URL
# Local: Points to your local NestJS server.
# Production: Change this to your live deployed backend URL (e.g., https://api.snapbulance.com)
VITE_API_URL_LOCAL=http://localhost:3000/
```

### Frontend Migration Checklist

- **API URL Update:** When deploying (e.g., on Vercel or Netlify), add your environment variables in their dashboard and replace `http://localhost:3000/` with the public URL of your deployed NestJS backend.
- **Naming Convention:** It is common practice to rename `VITE_API_URL_LOCAL` to simply `VITE_API_URL` in production so the frontend dynamically hits the correct endpoint depending on where it's hosted.
