# SnapBulance 🚑

> **Optimized Emergency Response System**
> *Reducing response times through intelligent routing, community alerts, and automated hospital handshakes.*

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Stack](https://img.shields.io/badge/stack-PERN-green)
![Status](https://img.shields.io/badge/status-In%20Development-orange)

## 📖 Overview

**SnapBulance** is a full-stack emergency logistics platform designed to solve the critical "last mile" problems in ambulance dispatch. While ride-sharing apps have perfected pickup logistics, emergency services often suffer from traffic delays and lack of hospital preparedness.

SnapBulance treats EMS as a **real-time distributed system**. It offers instant booking, intelligent pathfinding that prioritizes wide roads, preemptive proximity alerts to clear traffic, and automated data relay to destination hospitals.

---

## 🚀 Key Features

### 1. 🚨 The "Ola" for Ambulances (Dispatch Engine)
- **Instant Dispatch:** One-tap emergency request with precise geolocation.
- **Smart Matching:** Algorithms match the nearest *equipped* ambulance (ALS vs. BLS) to the patient, not just the geographically closest one.
- **Live Tracking:** Real-time WebSocket-based tracking for the user (60fps updates) using Redis geospatial data.

### 2. 🗺️ Route Optimization & Proximity Alerts
- **"Clear the Way" Alerts:** Users along the ambulance's predicted route receive push notifications to clear the road.
- **Dynamic Geofencing:** Uses PostGIS to create a moving buffer zone around the ambulance, alerting only relevant users (avoiding notification fatigue).

### 3. 🏥 Digital Handshake (Hospital Dashboard)
- **Pre-Arrival Vitals:** Paramedics input vitals during transit.
- **Automated Triage:** The destination hospital receives a real-time dashboard update with patient status, ETA, and required resources (ICU/Ventilator) *before* the ambulance arrives.
- **AI Triage Integration:** Uses **Gemini Flash (Free Tier)** to parse voice notes from paramedics and auto-fill the patient report forms.

### 4. 🤝 Community First Responder (CFR) Network
- **CPR Bridge:** Simultaneously alerts verified CPR-certified volunteers within a 400m radius of a cardiac event to provide aid while the ambulance is en route.

---

## 🛠️ Tech Stack

### Frontend
- **React (TypeScript):** Type-safe UI for User and Driver apps.
- **Tailwind CSS:** Rapid styling for responsive dashboards.
- **Leaflet / Mapbox GL:** High-performance mapping and route visualization.

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
- **Gemini API (Free Tier):** fast, lightweight LLM for converting voice-to-text triage notes into structured JSON data for hospitals.

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

## 📬 Contact & Inquiries

Thank you for checking out SnapBulance! This project is currently in active development.

If you have any questions, suggestions, or would like to discuss the architecture, feel free to reach out:

📧 **Email:** [ninadwalke00@gmail.com](mailto:ninadwalke00@gmail.com)

---