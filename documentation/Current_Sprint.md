# Sprint: map-routing-hospital-dash

## Phase 1: Proximity Dispatching

- Seed the simulation

- Use user's `[lat and lng]` to check and book all available drivers

- The backend only emits newTripRequest to the single driver with the shortest distance

## Phase 2: Live telemetry & routing

- We'll need to instage Mapbox or Google Maps to calculate actual route  route and return a polyline

- We build a small simulation function on driver's frontend. It will grab coordinates, set an interval and update driver location in the local state effectively driving the marking along the line

- Patient's LiveTripTracking will listen for this event and the update the ambulance marker on their map and recalculates the ETA dynamically

## Phase 3: Dynamic Hospital Routing (Spatial Indexing)

- Hospital Seeding: Add a few hospitals to your database with exact coordinates

- The nearest-neighbor algorithm: When a driver clicks arrived at patient, a backend service triggers and we mark the nearest hospital

- The backend updates the trip record with the winning hospitalId. It then broadcasts a destinationAssigned event

- Both driver and patient frontends fetch and follow the polyline

## Phase 4: Hospital Dashbboard

- Hospital Socket Rooms: When admin logs in they connect here to view data

- Live incoming feed: as soon as phase 3 locks, the backend emits an alert to the room

- Triage UI: A dashboard populates a card showing the incoming ambulance's live ETA and the patient's basic info
