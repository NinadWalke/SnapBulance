# SnapBulance 🚑

> **Optimized Emergency Response System**
> *Reducing response times through intelligent routing, community alerts, and automated hospital handshakes.*
<div align="center">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License"/>
  <img src="https://img.shields.io/badge/Status-In%20Development-orange?style=for-the-badge" alt="Status"/>
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
</div>

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