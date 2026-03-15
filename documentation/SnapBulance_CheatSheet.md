# 🚀 SnapBulance: Total Tech Stack Cheat Sheet

## 1. ⚛️ Frontend: React (Vite + TypeScript)

### Setup & Initialization

```bash
# Create project (Select React -> TypeScript)
npm create vite@latest client -- --template react-ts

# Enter directory & Install
cd frontend
npm install

# Install Core Dependencies (Routing, State, API)
npm install react-router-dom axios socket.io-client zustand

# Install UI & Maps
npm install tailwindcss postcss autoprefixer lucide-react leaflet react-leaflet
```

### Development Commands

```bash
# Start Dev Server (HMR enabled)
npm run dev

# Linting (Check for TS errors)
npm run lint

# Preview Production Build locally
npm run preview
```

### Build & Production

```bash
# Build for production (creates /dist folder)
npm run build
```

---

## 2. 🦁 Backend: NestJS (The Core)

### Installation & Setup

```bash
# Install CLI Globally
npm i -g @nestjs/cli

# Create New Project
nest new server

# Install Essential Libraries (Validation, Config, Throttling)
npm install class-validator class-transformer @nestjs/config @nestjs/throttler

# Install Caching & Rate Limiting
npm install @nestjs/cache-manager cache-manager-redis-yet @nestjs/throttler
```

### Running the Server

```bash
# Development (Watch Mode - updates on save)
npm run start:dev

# Debug Mode (Attach debugger)
npm run start:debug

# Production Mode (Runs from /dist)
npm run start:prod
```

### Generators (CLI Magic)

> Run inside `/server` directory

```bash
# 1. Structure (Modules)
nest g module modules/auth
nest g module modules/user
nest g module modules/trip

# 2. Components
nest g controller modules/auth --no-spec  # Create controller (no test file)
nest g service modules/auth --no-spec     # Create service (no test file)

# 3. Advanced Components
nest g guard common/guards/jwt-auth       # Create Auth Guard
nest g interceptor common/interceptors/logging
nest g gateway modules/location           # Create WebSocket Gateway
nest g decorator common/decorators/get-user # Create Custom Decorator
```

### Authentication & Security Packages

```bash
# Install Auth/Security Libs (Argon2 for hashing, Passport for JWT)
npm install argon2 @nestjs/passport @nestjs/jwt passport passport-jwt
npm install -D @types/passport-jwt
```

---

## 3. 🐘 Database: Prisma & PostgreSQL

### Setup

```bash
# Install Prisma
npm install prisma --save-dev
npm install @prisma/client

# Initialize Prisma (Creates /prisma/schema.prisma)
npx prisma init
```

### Migration & Management

```bash
# 1. Migrate (Run this after changing schema.prisma)
# Creates a migration file AND updates the DB schema
npx prisma migrate dev --name <name_of_change> 
# Example: npx prisma migrate dev --name init_users

# 2. Generate Client (Run if TS doesn't see your new tables)
npx prisma generate

# 3. GUI (View/Edit Data)
npx prisma studio

# 4. Deploy (For Production/CI)
npx prisma migrate deploy

# 5. Reset (Wipe DB and re-run all migrations)
npx prisma migrate reset
```

### Advanced DB Restart Scripts (Add to package.json)

> Automates nuking and restarting the Docker DB

```json
{
  "scripts": {
    "db:dev:rm": "docker compose rm dev-db -s -f -v",
    "db:dev:up": "docker compose up dev-db -d",
    "db:dev:restart": "npm run db:dev:rm && npm run db:dev:up && npm run prisma:dev:deploy"
  }
}
```

**Usage:**

```bash
npm run db:dev:restart
```

---

## 4. 🐳 Docker & Infrastructure

### Management Commands

```bash
# Start Services (Detached mode)
docker-compose up -d

# Stop Services
docker-compose down

# Stop & Remove Volumes (Clean slate)
docker-compose down -v

# View Logs (Follow output)
docker logs -f <container_name>
```

### System Cleanup

> ⚠️ **WARNING:** The command below is destructive. It removes ALL unused containers,
> images, networks, and volumes — including build cache. Only run this when you want
> a completely clean Docker environment and are sure you don't need any stopped
> containers or untagged images.

```bash
# Nuclear cleanup — reclaims all unused RAM/Disk space
docker system prune -a --volumes
```

### Redis Specifics

```bash
# Enter Redis CLI inside container
docker exec -it snapbulance_redis redis-cli

# Inside Redis CLI:
# > PING           (Returns PONG)
# > KEYS *         (Show all keys)
# > FLUSHALL       (Clear all data)
```

---

## 5. 🧪 Testing (E2E with PactumJS)

### Setup

```bash
# Install Testing Libs
npm install --save-dev pactum dotenv-cli

# Create Test DB Container (in docker-compose.yml)
# (Ensure port 5435 is mapped for test-db)
```

### Test Scripts (Add to package.json)

> Ensures Test DB is clean before running tests

```json
{
  "scripts": {
    "db:test:rm": "docker compose rm test-db -s -f -v",
    "db:test:up": "docker compose up test-db -d",
    "db:test:restart": "npm run db:test:rm && npm run db:test:up && npm run prisma:test:deploy",
    "pretest:e2e": "npm run db:test:restart",
    "test:e2e": "dotenv -e .env.test -- jest --watch --no-cache --config ./test/jest-e2e.json"
  }
}
```

### Running Tests

```bash
# Run End-to-End Tests
npm run test:e2e

# Run Unit Tests
npm run test

# Run Test Coverage
npm run test:cov
```

---

## 6. ⚡ Real-Time (WebSockets & Redis)

### Dependencies

```bash
# Install Socket.io & Redis Adapter
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install ioredis
```

### Debugging Sockets

Use **Postman** (WebSocket Request) or **Firecamp** to test:

1. Connect to `ws://localhost:3000`
2. Emit Event: `join_room` → `{"tripId": "123"}`
3. Listen Event: `driver_location`

---

## 7. 🐙 Git Workflow

```bash
# 1. Check Status
git status

# 2. Stage All Changes
git add .

# 3. Commit
git commit -m "feat: implemented auth module with jwt guard"

# 4. Push
git push origin main
```

---

## 8. ☸️ Kubernetes & Minikube (Orchestration)

### Cluster Setup

```bash
# Start a local K8s cluster using Docker as the driver
minikube start --driver=docker

# Point your terminal's Docker CLI to Minikube's internal Docker daemon
# IMPORTANT: Run this before building images — it ensures images land
# inside the cluster and are available to pods without a registry push
eval $(minikube docker-env)

# Build images directly into the Minikube cluster
docker build -t snapbulance-backend:latest ./backend
docker build -t snapbulance-frontend:latest ./frontend
```

### Deploying

```bash
# Apply all manifests in the k8s/ directory at once
kubectl apply -f k8s/
```

### Monitoring & Debugging

```bash
# Watch all pods in real-time (Ctrl+C to exit)
kubectl get pods -w

# Inspect a pod's full event log and config (great for CrashLoopBackOff errors)
kubectl describe pod <pod-name>

# Stream logs from a running pod
kubectl logs <pod-name>

# Stream logs continuously (follow mode)
kubectl logs -f <pod-name>
```

### Port Forwarding (Local Access)

```bash
# Forward a K8s service port to your local machine for testing
# Access the backend at http://localhost:3001 while it runs on port 3000 inside the cluster
kubectl port-forward service/backend-service 3001:3000
```

### Teardown

```bash
# Stop the Minikube cluster (preserves state, can be restarted)
minikube stop

# Completely delete the cluster and free all resources
minikube delete
```

---

## 9. 🗺️ Routing & Maps (OSRM)

We use the **Open Source Routing Machine (OSRM)** as our routing engine instead of paid third-party APIs (e.g., Google Maps Platform). OSRM is self-hostable, built on OpenStreetMap data, and has no per-request billing — making it ideal for a high-frequency emergency dispatch system.

**What we use it for:**
- Calculating real-time ambulance ETAs to destination hospitals
- Generating route geometry (encoded polylines) that the React frontend decodes and renders as the live route overlay on the map

**Endpoint pattern:**

```
GET /route/v1/driving/{lng_origin},{lat_origin};{lng_dest},{lat_dest}?overview=full&geometries=polyline
```

> **Note:** OSRM uses `longitude, latitude` ordering (GeoJSON convention) — the reverse of what most GPS libraries return. Always swap coordinates before sending the request.

**Key response fields:**

| Field | Description |
|---|---|
| `routes[0].duration` | ETA in seconds |
| `routes[0].distance` | Route distance in metres |
| `routes[0].geometry` | Encoded polyline — decode on the frontend to draw the route |

---

**✨ Pro Tip:** Keep this cheatsheet handy for quick reference during development!
