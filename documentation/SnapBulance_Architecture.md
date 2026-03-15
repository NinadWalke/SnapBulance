# SnapBulance — Architecture & Implementation Documentation

> **SnapBulance** is an emergency ambulance dispatch and real-time tracking system. This document details the core architectural decisions, integration patterns, and infrastructure setup behind the five foundational backlog items that power the platform.

---

## Table of Contents

1. [Real-Time Location Tracking & ETA — OSRM API](#1-real-time-location-tracking--eta--osrm-api)
2. [Bi-Directional Communication — NestJS WebSockets](#2-bi-directional-communication--nestjs-websockets)
3. [API Security — Rate Limiting & Exception Filters](#3-api-security--rate-limiting--exception-filters)
4. [Caching & Session Management — Redis](#4-caching--session-management--redis)
5. [Containerization & Orchestration — Docker & Kubernetes](#5-containerization--orchestration--docker--kubernetes)

---

## 1. Real-Time Location Tracking & ETA — OSRM API

### Problem

Calculating accurate, real-time ETAs and drawing live routes between ambulances and hospitals is a core requirement. Using a commercial mapping service like Google Maps Platform introduces per-request billing that is unsustainable at scale for an emergency system.

### Solution

We integrated the **Open Source Routing Machine (OSRM)** — a high-performance, open-source routing engine built on OpenStreetMap data. It is self-hostable, free to use, and returns sub-100ms routing responses.

### How It Works

The data flow for a single route calculation is:

```
Ambulance GPS Device
        │
        ▼
  Driver Mobile App
  (captures lat/lng)
        │
        ▼
  POST /route/v1/driving/{origin};{destination}
  → OSRM Routing Engine
        │
        ▼
  JSON Response
  { duration, distance, geometry }
        │
        ▼
  Frontend decodes polyline
  → Renders blue route on React Map
```

#### API Request Format

The ambulance app sends a request to the OSRM `/route/v1/driving/` endpoint with the driver's current coordinates as the origin and the destination hospital's coordinates as the target:

```
GET http://<osrm-host>/route/v1/driving/{lng_origin},{lat_origin};{lng_dest},{lat_dest}?overview=full&geometries=polyline
```

> **Note:** OSRM uses `longitude,latitude` ordering (GeoJSON convention), not `latitude,longitude`.

#### Sample OSRM Response

```json
{
  "code": "Ok",
  "routes": [
    {
      "duration": 780.5,
      "distance": 4321.2,
      "geometry": "_p~iF~ps|U_ulLnnqC_mqNvxq`@",
      "legs": [
        {
          "summary": "MG Road, Ring Road",
          "duration": 780.5,
          "distance": 4321.2,
          "steps": []
        }
      ]
    }
  ],
  "waypoints": [
    { "name": "Starting point", "location": [72.9781, 19.2183] },
    { "name": "City Hospital", "location": [72.8777, 19.0760] }
  ]
}
```

#### Frontend Polyline Decoding

The `geometry` field is an encoded polyline string. The React frontend decodes this using a polyline library to reconstruct the array of coordinates, which are then passed to the map renderer as the route path:

```javascript
import polyline from '@mapbox/polyline';

const decodedCoords = polyline.decode(route.geometry);
// Returns: [[lat, lng], [lat, lng], ...]
// These coordinates are used to draw the blue route line on the map.
```

### Key Outputs

| Field | Description | Example |
|---|---|---|
| `duration` | Estimated travel time in seconds | `780.5` (~13 min) |
| `distance` | Route distance in metres | `4321.2` (~4.3 km) |
| `geometry` | Encoded polyline of the full route | `_p~iF~ps|U...` |

### Why OSRM?

| Criterion | Google Maps API | OSRM |
|---|---|---|
| Cost | Per-request billing | Free / self-hosted |
| Latency | ~150–400ms | ~10–80ms (self-hosted) |
| Data ownership | Dependent on Google | Full control |
| Offline capability | No | Yes |

---

## 2. Bi-Directional Communication — NestJS WebSockets

### Problem

In an emergency dispatch system, polling the server via standard HTTP every few seconds introduces unacceptable latency. A 5-second polling interval means a hospital dashboard could be showing an ambulance location that is already 5 seconds stale — a critical gap in a life-or-death scenario.

### Solution

We implemented a persistent, bi-directional WebSocket layer using `@nestjs/platform-socket.io` and `@nestjs/websockets`. This enables sub-second location pushes from ambulances to hospital dashboards with zero polling overhead.

### Architecture Overview

```
Ambulance App                  NestJS Backend (LocationGateway)         Hospital Dashboard
     │                                    │                                      │
     │──── emit('updateLocation') ───────►│                                      │
     │     { lat, lng, ambulanceId }      │                                      │
     │                                    │── server.to(hospitalId)              │
     │                                    │     .emit('locationBroadcast') ─────►│
     │                                    │                                      │
     │                                    │   (Hospital joined its own room      │
     │                                    │    on login via hospitalId)          │
```

### Implementation

#### Gateway Setup

The core of the real-time layer is the `LocationGateway`, a NestJS class decorated with `@WebSocketGateway()`. It handles connection, disconnection, and message routing:

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class LocationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Called when a hospital dashboard connects and joins its own room
  handleConnection(client: Socket) {
    const hospitalId = client.handshake.query.hospitalId as string;
    if (hospitalId) {
      client.join(hospitalId);
      console.log(`Hospital ${hospitalId} joined room.`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Ambulances emit their GPS coordinates to this event handler
  @SubscribeMessage('updateLocation')
  handleLocationUpdate(
    @MessageBody() payload: { ambulanceId: string; lat: number; lng: number; hospitalId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Immediately broadcast to the target hospital's room only
    this.server.to(payload.hospitalId).emit('locationBroadcast', {
      ambulanceId: payload.ambulanceId,
      lat: payload.lat,
      lng: payload.lng,
      timestamp: new Date().toISOString(),
    });
  }
}
```

#### Room Strategy

Rather than broadcasting every location update to every connected client, we use Socket.IO **rooms** to scope messages:

- On login, each hospital dashboard calls `client.join(hospitalId)`, subscribing to only its own room.
- When an ambulance emits `updateLocation`, the backend routes the broadcast exclusively to `server.to(hospitalId)`, ensuring no cross-hospital data leakage.

### Performance Characteristics

| Metric | HTTP Polling (5s interval) | WebSocket (this implementation) |
|---|---|---|
| Update latency | ~2,500ms (avg) | < 100ms |
| Server load | High (repeated connections) | Low (persistent connection) |
| Network overhead | High (full HTTP headers) | Minimal (framed messages) |
| Scalability | Poor | Good (with Redis adapter) |

> **Scaling note:** For multi-instance deployments, the Socket.IO Redis Adapter (`@socket.io/redis-adapter`) is used so that events emitted on one backend pod are correctly broadcast by another pod. This is covered in [Section 4](#4-caching--session-management--redis).

---

## 3. API Security — Rate Limiting & Exception Filters

### Overview

Two complementary hardening measures are applied globally to the NestJS application: a **rate limiter** to prevent API abuse and a **custom exception filter** to standardize all error responses sent to the frontend.

---

### 3.1 Rate Limiting — `@nestjs/throttler`

#### Problem

Without request throttling, the API is vulnerable to brute-force attacks (e.g., against the `/auth/login` endpoint), DDoS attempts, and unintentional runaway clients hammering the server.

#### Implementation

We use the official `@nestjs/throttler` package, configured globally so that every route is protected by default.

**Installation:**

```bash
npm install @nestjs/throttler
```

**Module Configuration (`app.module.ts`):**

```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,   // Time window: 60 seconds (in milliseconds)
        limit: 100,   // Max requests per IP within the time window
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Applied globally to all routes
    },
  ],
})
export class AppModule {}
```

#### Behaviour When Limit Is Exceeded

When a client exceeds 100 requests in 60 seconds, NestJS automatically returns:

```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

> **Note:** The `ThrottlerGuard` uses the client's IP address as the tracking key by default. For custom key strategies (e.g., throttling by user ID after authentication), the guard can be extended.

---

### 3.2 Global Exception Filter — `HttpExceptionFilter`

#### Problem

By default, unhandled exceptions in NestJS can expose raw stack traces or inconsistently formatted error objects to the frontend. This creates unpredictable client-side error handling and risks leaking internal implementation details.

#### Implementation

We created a custom `HttpExceptionFilter` that intercepts all `HttpException` instances and returns a clean, predictable JSON envelope:

**Filter Definition (`http-exception.filter.ts`):**

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message,
    });
  }
}
```

**Global Registration (`main.ts`):**

```typescript
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
}
bootstrap();
```

#### Standardized Error Response Shape

Every API error — regardless of where it originates — will now return this consistent structure:

```json
{
  "statusCode": 404,
  "timestamp": "2025-07-14T08:32:11.024Z",
  "path": "/api/ambulances/99",
  "message": "Ambulance not found"
}
```

This predictable shape allows the frontend to handle all errors with a single interceptor.

---

## 4. Caching & Session Management — Redis

### Overview

Redis serves two distinct roles in SnapBulance: a **caching layer** to reduce database load on expensive queries, and a **WebSocket session store** to maintain connection-to-user mappings across the backend.

### Infrastructure Setup

#### Local Development (Docker)

Redis runs as a Docker container using the lightweight Alpine image:

```bash
docker run -d --name snapbulance-redis -p 6379:6379 redis:alpine
```

Or via `docker-compose.yml` (see [Section 5](#5-containerization--orchestration--docker--kubernetes)):

```yaml
redis:
  image: redis:alpine
  ports:
    - "6379:6379"
  restart: unless-stopped
```

#### Production (Kubernetes)

In the K8s cluster, Redis runs as its own `Deployment` with a `ClusterIP` `Service`, making it reachable internally at the stable DNS name `redis-service:6379`. Pod-to-pod communication uses this DNS name rather than dynamic IP addresses.

### NestJS Integration

**Installation:**

```bash
npm install @nestjs/cache-manager cache-manager-redis-yet
```

**Module Registration (`app.module.ts`):**

```typescript
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT) || 6379,
          },
          ttl: 300, // Default TTL: 5 minutes (in seconds)
        }),
      }),
    }),
  ],
})
export class AppModule {}
```

### Use Cases

#### Use Case 1: Database Query Caching

Heavy, infrequently changing queries — such as fetching the full hospital directory or static region metadata — are cached to avoid repeated PostgreSQL round-trips:

```typescript
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class HospitalService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
  ) {}

  async getAllHospitals() {
    const cacheKey = 'hospitals:all';
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) return cached; // Cache hit — return immediately

    const hospitals = await this.prisma.hospital.findMany(); // Cache miss — query DB
    await this.cacheManager.set(cacheKey, hospitals, 300);   // Cache for 5 minutes
    return hospitals;
  }
}
```

#### Use Case 2: WebSocket Session Mapping

When an ambulance driver connects via WebSocket, their `socketId → userId` mapping is stored in Redis. This allows any backend instance (in a multi-replica deployment) to look up which user owns a given socket connection and route messages accordingly:

```
Redis Key:   socket:session:<socketId>
Redis Value: { userId, role, hospitalId }
TTL:         Automatically cleared on disconnect
```

This is critical for horizontal scaling — without a shared session store, a location update processed by Pod A could not be routed by Pod B.

### Redis Role Summary

| Role | Cache Key Pattern | TTL | Purpose |
|---|---|---|---|
| Hospital list cache | `hospitals:all` | 5 min | Reduce DB reads |
| Static metadata | `metadata:<type>` | 10 min | Config/reference data |
| Socket session map | `socket:session:<id>` | Connection lifetime | WebSocket routing |

---

## 5. Containerization & Orchestration — Docker & Kubernetes

### Overview

The entire SnapBulance stack — PostgreSQL, Redis, NestJS backend, and React frontend — is fully containerized and deployable both locally via Docker Compose and at scale via Kubernetes (tested with Minikube).

---

### 5.1 Docker Setup

#### Multi-Stage Dockerfiles

Both the frontend and backend use multi-stage builds to keep final image sizes minimal by separating the build environment from the runtime environment.

**Backend (`Dockerfile`):**

```dockerfile
# --- Stage 1: Build ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Stage 2: Production Runtime ---
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

**Frontend (`Dockerfile`):**

```dockerfile
# --- Stage 1: Build ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose (Local Development)

A single `docker-compose.yml` orchestrates the full four-service stack locally:

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: snapbulance
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: snapbulance_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  backend:
    build:
      context: ./backend
      target: production
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://snapbulance:${DB_PASSWORD}@postgres:5432/snapbulance_db
      REDIS_HOST: redis
    depends_on:
      - postgres
      - redis

  frontend:
    build:
      context: ./frontend
      target: production
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  pgdata:
```

**Start the entire stack with a single command:**

```bash
docker compose up -d --build
```

---

### 5.2 Kubernetes Architecture

Moving from local Compose to Kubernetes enables horizontal scaling, self-healing, and zero-downtime deployments. The cluster was developed and tested using Minikube.

#### Cluster Setup Commands

```bash
# Start a local Minikube cluster using Docker as the driver
minikube start --driver=docker

# Point your local Docker CLI to Minikube's internal Docker daemon
# This ensures images built locally are available to the cluster without a registry push
eval $(minikube docker-env)

# Build images directly into the cluster
docker build -t snapbulance-backend:latest ./backend
docker build -t snapbulance-frontend:latest ./frontend

# Deploy the entire stack from the k8s/ manifest directory
kubectl apply -f k8s/
```

#### Directory Structure

```
k8s/
├── backend-config.yaml       # ConfigMap & Secret for env vars
├── postgres-deployment.yaml
├── redis-deployment.yaml
├── backend-deployment.yaml   # 3 replicas with health probes
├── frontend-deployment.yaml
└── services.yaml             # ClusterIP services for internal DNS
```

#### ConfigMaps & Secrets

Environment variables are decoupled from application code using a `ConfigMap` for non-sensitive config and a `Secret` for credentials:

```yaml
# k8s/backend-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
data:
  REDIS_HOST: "redis-service"
  POSTGRES_HOST: "postgres-service"
  NODE_ENV: "production"

---
apiVersion: v1
kind: Secret
metadata:
  name: backend-secrets
type: Opaque
stringData:
  DATABASE_URL: "postgresql://snapbulance:password@postgres-service:5432/snapbulance_db"
  JWT_SECRET: "your-secure-jwt-secret"
```

#### Backend Deployment — High Availability Configuration

The backend runs with **3 replicas** and strict resource limits to prevent any single pod from destabilizing the node:

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: snapbulance-backend
spec:
  replicas: 3           # Three pods for HA and rolling updates
  selector:
    matchLabels:
      app: backend
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1   # At most 1 pod unavailable during a deploy
      maxSurge: 1         # At most 1 extra pod during a deploy
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: snapbulance-backend:latest
          imagePullPolicy: Never  # Use local Minikube image
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef:
                name: backend-config
            - secretRef:
                name: backend-secrets
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "500m"         # Prevents CPU starvation of other pods
              memory: "512Mi"     # Prevents OOM crashes from cascading
          livenessProbe:          # Restart container if it becomes unresponsive
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 20
            failureThreshold: 3
          readinessProbe:         # Remove from load balancer if not ready to serve
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 10
```

#### Health Probes Explained

| Probe | Endpoint | Effect on Failure |
|---|---|---|
| `livenessProbe` | `GET /health` | K8s **kills and restarts** the container |
| `readinessProbe` | `GET /health` | K8s **removes pod from Service endpoints** (stops sending traffic) until it recovers |

Together, these probes ensure that frozen or slow-starting containers are handled automatically without manual intervention.

#### ClusterIP Services — Stable Internal DNS

Every workload is fronted by a `ClusterIP` Service, which provides a stable internal DNS name that doesn't change even when pod IPs rotate:

```yaml
# redis-service remains stable regardless of which pod IP Redis is currently running on
apiVersion: v1
kind: Service
metadata:
  name: redis-service
spec:
  selector:
    app: redis
  ports:
    - port: 6379
      targetPort: 6379
  type: ClusterIP
```

This means application code always connects to `redis-service:6379` and `postgres-service:5432` — never to fragile dynamic IP addresses.

#### Service Topology Summary

```
External Traffic
      │
      ▼
┌─────────────────────────────────────────────────────┐
│                   Kubernetes Cluster                │
│                                                     │
│  frontend-service ──► frontend pods (x1)            │
│         │                                           │
│         ▼                                           │
│  backend-service  ──► backend pods (x3, HA)         │
│         │                                           │
│    ┌────┴────┐                                      │
│    ▼         ▼                                      │
│ postgres-  redis-                                   │
│ service    service                                  │
│    │          │                                     │
│  postgres   redis                                   │
│  pod (x1)   pod (x1)                               │
└─────────────────────────────────────────────────────┘
```

---

## Appendix — Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + Leaflet/Mapbox | Dashboard UI & route visualization |
| Backend | NestJS (Node.js) | REST API & WebSocket Gateway |
| Routing | OSRM | ETA & route geometry |
| Real-Time | Socket.IO via NestJS | Bi-directional location updates |
| Database | PostgreSQL | Persistent data storage |
| Cache / Sessions | Redis | Query caching & socket mappings |
| Containerization | Docker + Docker Compose | Local multi-service orchestration |
| Orchestration | Kubernetes (Minikube) | Production scaling & HA |
| Security | `@nestjs/throttler` | Rate limiting (100 req / 60s) |
| Error Handling | Custom `HttpExceptionFilter` | Standardized API error responses |

---

*Documentation version: 1.0.0 — Generated for the SnapBulance core backlog sprint.*
