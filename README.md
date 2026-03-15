# SnapBulance 🚑

> **Optimized Emergency Response System**
> *Reducing response times through intelligent routing, community alerts, and automated hospital handshakes.*
<div align="center">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License"/>
  <img src="https://img.shields.io/badge/Status-MVP%20Completed-success?style=for-the-badge" alt="Status"/>
</div>

<br />

## ⚙️ Tech Stack
<div align="center">
  <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3"/>
  <img src="https://img.shields.io/badge/Zustand-%2320232a?style=for-the-badge" alt="Zustand"/>

  <br/>
  <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="NodeJS"/>
  <img src="https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS"/>
  <img src="https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101" alt="Socket.io"/>

  <br/>
  <img src="https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white" alt="Postgres"/>
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma"/>
  <img src="https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white" alt="Redis"/>
  <img src="https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Kubernetes"/>
</div>

## 📖 Overview

**SnapBulance** is a full-stack emergency logistics platform built to solve the critical "last mile" problems in ambulance dispatch. While ride-sharing apps have perfected pickup logistics, emergency services routinely suffer from traffic delays and lack of hospital preparedness.

SnapBulance treats EMS as a **real-time distributed system**. The MVP delivers instant booking, intelligent pathfinding that prioritizes wide roads, preemptive proximity alerts to clear traffic, and automated data relay to destination hospitals — all running on a cloud-native, Kubernetes-orchestrated infrastructure.

---

## 🚀 Key Features

### 1. 🚨 The "Ola" for Ambulances (Dispatch Engine)
- **Instant Dispatch:** One-tap emergency request with precise geolocation, live and operational.
- **Smart Matching:** Algorithms match the nearest *equipped* ambulance (ALS vs. BLS) to the patient — prioritizing capability, not just proximity.
- **Live Tracking:** Real-time WebSocket-based tracking delivers sub-second location updates to the hospital dashboard using Redis-backed socket sessions.

### 2. 🗺️ Route Optimization & Proximity Alerts
- **Optimized Routing:** Drivers receive the fastest route to the nearest hospital, calculated on the fly by our OSRM-powered geocoding module.
- **Dynamic Geofencing:** PostGIS powers a moving buffer zone around the ambulance, alerting only relevant nearby users and avoiding notification fatigue.

### 3. 🏥 Digital Handshake (Hospital Dashboard)
- **Pre-Arrival Vitals:** Paramedics input patient vitals during transit, streamed directly to the receiving hospital in real time.
- **Automated Triage:** The destination hospital receives a live dashboard update with patient status, ETA, and required resources (ICU/Ventilator) *before* the ambulance arrives.
- **AI Triage Integration:** **Gemini Flash (Free Tier)** parses voice notes from paramedics and auto-fills patient report forms as structured JSON — reducing manual data entry in critical moments.

### 4. 🤝 Community First Responder (CFR) Network
- **CPR Bridge:** Simultaneously alerts verified CPR-certified volunteers within a 400m radius of a cardiac event to provide immediate aid while the ambulance is en route.

---

## 🛠️ Tech Stack

### Frontend
- **React (TypeScript):** Type-safe UI for User and Driver apps.
- **Tailwind CSS:** Rapid styling for responsive dashboards.
- **Leaflet / Mapbox GL:** High-performance mapping and route visualization.
- **OSRM API:** Open-source routing engine for calculating fastest driving paths and dynamic ETA simulation.

### Backend
- **NestJS:** Modular, scalable server-side architecture.
- **Prisma:** Type-safe ORM for database interactions.
- **PostgreSQL + PostGIS:** Primary database handling complex geospatial queries (spatial indexing).
- **Redis:** In-memory store for real-time driver location updates and pub/sub messaging.
- **WebSockets (Socket.io):** Bi-directional communication for live tracking and alerts.

### Infrastructure & DevOps
- **Kubernetes (K8s):** Orchestration for scaling microservices.
- **Nginx:** Reverse proxy and load balancing.

### AI & Intelligence
- **Gemini API (Free Tier):** Fast, lightweight LLM for converting voice-to-text triage notes into structured JSON data for hospitals.

---

## 🏗️ System Architecture (High Level)

1.  **Client Layer:**
    * **User App:** Books ride, views live location.
    * **Driver App:** Receives requests, navigation, "Clear Path" emitter.
    * **Hospital Portal:** Web dashboard for incoming patient data.

2.  **Service Layer (NestJS):**
    * `Auth Service`: JWT handling.
    * `Dispatch Service`: Matches riders to drivers using Redis GEO commands.
    * `Trip Service`: Manages state (En Route -> Picked Up -> Arrived).
    * `Notification Service`: Push notifications via FCM/APNS.

3.  **Data Layer:**
    * **Postgres:** Durable storage (Users, Trips, Medical Logs).
    * **Redis:** Ephemeral storage (Driver Lat/Long, Active Socket IDs).

---

## 🔬 Under the Hood (Implementation Details)

A summary of the core engineering decisions that power the MVP:

- **Location Tracking & ETA:** Integrated the **OSRM (Open Source Routing Machine) API** to calculate real-time ambulance ETAs and generate route geometry. The frontend decodes OSRM's polyline response to draw the live route overlay on the React/Leaflet map — with no per-request billing.

- **Real-Time Sockets:** Built a `LocationGateway` using **NestJS WebSockets** (`@nestjs/platform-socket.io`). Hospitals join dedicated Socket.IO **rooms** keyed by their ID on login, so ambulance location broadcasts are scoped exclusively to the relevant hospital — achieving sub-second latency with a **Redis adapter** ensuring message delivery across multiple backend replicas.

- **Security & Stability:** Applied a custom global `HttpExceptionFilter` across all routes, guaranteeing the frontend always receives a clean, predictable error JSON envelope regardless of where an exception originates. `@nestjs/throttler` enforces strict per-IP rate limiting (100 requests / 60 seconds) globally via `APP_GUARD`, protecting against brute-force and DDoS vectors.

- **Caching & Session Management:** Redis serves a dual role — caching expensive, infrequently-changing PostgreSQL queries (such as hospital lists) to cut database load, and storing active `socketId → userId` session mappings to enable fast, stateless WebSocket message routing across pods.

- **Cloud-Native Infrastructure:** The entire stack is fully Dockerized using multi-stage builds for minimal image sizes. Kubernetes manifests cover **ConfigMaps & Secrets** (decoupling config from code), **Deployments** with 3 HA replicas and rolling update strategies for the backend, `livenessProbe` / `readinessProbe` health checks for automatic pod recovery, and **ClusterIP Services** providing stable internal DNS (`redis-service`, `postgres-service`) so pods communicate reliably regardless of dynamic IP changes.

---

## 🌱 Local Setup & Database Seeding

Before running the application or simulating the real-time WebSocket features, you need to configure your environment and seed the database with initial actors (Drivers, Hospitals, Admins).

**1. Environment Configuration**
Please refer to **ENV.md** in the project directory at `/documentation`. Copy the required configuration variables listed there and paste them into your local `.env` file at the root of the backend directory.

**2. Seeding the System**
To make testing the MVP frictionless, we have built a dedicated development controller that populates the database with realistic, geolocated test data. Once your NestJS server is running, use Postman, cURL, or your terminal to hit the following endpoints:

**Seed the Database**
Make a `POST` request to: `http://localhost:3000/dev/seed-system`

This will automatically generate:

- **2 Hospitals** (Jupiter Hospital & Bethany Hospital) with specific bed/ICU capacities and geospatial coordinates.

- **2 Hospital Admins** to access the receiving dashboard.

- **2 Drivers** with active ambulances (One ALS unit in Thane, One BLS unit in Pune) complete with vehicle metadata and starting coordinates.

- **1 Verified Community First Responder** (CFR).

*Note: All dummy user accounts are created with the password: `password123`*

**Reset the Database**
Make a `DELETE` request to: `http://localhost:3000/dev/reset-system`

If your testing gets messy, this endpoint acts as a "Clean Slate" button. It safely cascades and deletes all trips, active chat messages, medical reports, and dummy users, then automatically re-seeds the system so you instantly have a fresh, predictable environment for testing routing and live tracking.

---

## 📬 Contact & Inquiries

SnapBulance's MVP is fully shipped — a distributed, real-time emergency dispatch system running on a production-grade Kubernetes cluster. Building this from scratch across the full stack, from WebSocket gateways and Redis session stores to K8s health probes and rolling deployments, has been an exercise in treating emergency logistics as the resilient distributed system it deserves to be.

If you'd like to dig into the architecture, discuss the engineering tradeoffs, or explore collaboration opportunities, I'd love to hear from you.

📧 **Email:** [ninadwalke00@gmail.com](mailto:ninadwalke00@gmail.com)

---