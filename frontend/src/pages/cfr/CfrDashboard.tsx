import * as React from "react";
import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import { socket } from "../../utils/socket";
import { useAuthStore } from "../../store/useAuthStore";

import "./CfrDashboard.css";

export interface CfrDashboardProps {}

const CfrDashboard: React.FC<CfrDashboardProps> = () => {
  const { user } = useAuthStore();
  const [nearbyEmergencies, setNearbyEmergencies] = useState<any[]>([]);
  const [cfrLocation, setCfrLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  // 1. Get CFR's Live Location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCfrLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Please enable location services to see nearby emergencies.");
          setLoading(false);
        },
        { enableHighAccuracy: true },
      );
    } else {
      setLoading(false);
    }
  }, []);

  // 2. Fetch Nearby Emergencies
  useEffect(() => {
    const fetchEmergencies = async () => {
      if (!cfrLocation) return;
      try {
        const res = await api.get(
          `/cfr/nearby?lat=${cfrLocation[0]}&lng=${cfrLocation[1]}`,
        );
        setNearbyEmergencies(res.data);
      } catch (error) {
        console.error("Failed to fetch emergencies", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmergencies();
    // Poll every 10 seconds for new emergencies
    const interval = setInterval(fetchEmergencies, 10000);
    return () => clearInterval(interval);
  }, [cfrLocation]);

  // 3. Setup Socket Connection for emitting the response
  useEffect(() => {
    socket.connect();
    // No need to join a specific trip room here unless we want to add chat for CFRs later.
    // We just need the connection open to emit the alert.
  }, []);

  const handleRespond = async (tripId: string) => {
    if (!user) return;
    setRespondingTo(tripId);

    try {
      await api.post(`/cfr/respond/${tripId}`);

      socket.emit("cfrResponding", {
        tripId: tripId,
        cfrName: user.fullName,
      });

      alert(
        "You are now responding to this emergency. Please proceed to the location.",
      );
    } catch (error: any) {
      console.error("Failed to respond", error);

      // NEW: If the backend says the trip is no longer active, remove it from the UI!
      if (error.response?.status === 404) {
        alert("This emergency has already been resolved.");
        setNearbyEmergencies((prev) => prev.filter((t) => t.id !== tripId));
      } else {
        alert("Could not process response.");
      }
      setRespondingTo(null);
    }
  };

  // Loading — locating user
  // Loading — locating user
if (loading && !cfrLocation)
  return (
    <div className="sb-cfr__locating">
      <div className="sb-cfr__locating-inner">
        <div className="sb-cfr__spinner" aria-hidden="true" />
        <span className="sb-cfr__locating-text">Locating You…</span>
      </div>
    </div>
  );

return (
  <div className="sb-cfr">
    <div className="sb-cfr__bg-grid" aria-hidden="true" />

    <div className="sb-cfr__page">

      {/* ── Header ── */}
      <header className="sb-cfr__header">
        <div className="sb-cfr__header-left">
          <div className="sb-cfr__eyebrow">
            <span className="sb-cfr__radar-dot" aria-hidden="true" />
            <span className="sb-cfr__eyebrow-text">Live Dispatch · 2km Radius</span>
          </div>
          <h1 className="sb-cfr__title">
            CFR <span className="sb-cfr__title-accent">Command</span>
          </h1>
        </div>
        <div className="sb-cfr__duty-badge">
          <span className="sb-cfr__duty-dot" aria-hidden="true" />
          <span className="sb-cfr__duty-text">On Duty</span>
        </div>
      </header>

      <p className="sb-cfr__subtitle">
        Active emergencies within your 2km radius. Respond only if you can
        safely reach the location.
      </p>

      {/* ── Stats Row ── */}
      <div className="sb-cfr__stats">
        <div className="sb-cfr__stat-card">
          <span className="sb-cfr__stat-label">Nearby</span>
          <span className="sb-cfr__stat-value sb-cfr__stat-value--red">
            {nearbyEmergencies.length}
          </span>
          <span className="sb-cfr__stat-sub">Emergencies</span>
        </div>
        <div className="sb-cfr__stat-card">
          <span className="sb-cfr__stat-label">Radius</span>
          <span className="sb-cfr__stat-value">2.0</span>
          <span className="sb-cfr__stat-sub">Kilometres</span>
        </div>
        <div className="sb-cfr__stat-card">
          <span className="sb-cfr__stat-label">Status</span>
          <span className="sb-cfr__stat-value sb-cfr__stat-value--green">
            {cfrLocation ? "Active" : "Locating"}
          </span>
          <span className="sb-cfr__stat-sub">GPS {cfrLocation ? "locked" : "pending"}</span>
        </div>
      </div>

      {/* ── Section heading ── */}
      <div className="sb-cfr__section-label">
        <span className="sb-cfr__section-label-text">Active Emergencies</span>
        <span className="sb-cfr__section-line" aria-hidden="true" />
      </div>

      {/* ── Empty State ── */}
      {nearbyEmergencies.length === 0 && !loading ? (
        <div className="sb-cfr__empty">
          <span className="sb-cfr__empty-icon" aria-hidden="true">📡</span>
          <h3 className="sb-cfr__empty-title">No Emergencies Nearby</h3>
          <p className="sb-cfr__empty-sub">
            Stay alert. You'll be notified the moment a request comes in range.
          </p>
        </div>
      ) : (
        <div className="sb-cfr__cards">
          {nearbyEmergencies.map((trip) => (
            <div key={trip.id} className="sb-cfr__card">
              <div className="sb-cfr__card-accent" aria-hidden="true" />

              {/* Urgency flash chip */}
              <div className="sb-cfr__urgency-chip">
                <span className="sb-cfr__urgency-dot" aria-hidden="true" />
                <span className="sb-cfr__urgency-label">
                  {trip.status === "SEARCHING" ? "Critical" : "Active"}
                </span>
              </div>

              <div className="sb-cfr__card-body">
                <div className="sb-cfr__card-top">
                  <div className="sb-cfr__card-info">
                    <h2 className="sb-cfr__card-title">Medical Emergency</h2>
                    <p className="sb-cfr__card-address">
                      <span className="sb-cfr__card-address-icon" aria-hidden="true">⬥</span>
                      {trip.pickupAddress}
                    </p>
                    <p className="sb-cfr__card-patient">
                      Patient · {trip.passenger?.fullName || "Unknown"}
                    </p>
                  </div>
                  <div className="sb-cfr__card-distance">
                    <span className="sb-cfr__distance-num">
                      {trip.distanceKm.toFixed(1)}
                    </span>
                    <span className="sb-cfr__distance-unit">km away</span>
                    <span className="sb-cfr__card-status">
                      {trip.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="sb-cfr__card-divider" aria-hidden="true" />

              <div className="sb-cfr__card-footer">
                <button
                  className={`sb-cfr__btn-respond${respondingTo === trip.id ? " sb-cfr__btn-respond--active" : ""}`}
                  onClick={() => handleRespond(trip.id)}
                  disabled={respondingTo === trip.id}
                >
                  <span className="sb-cfr__btn-icon" aria-hidden="true">
                    {respondingTo === trip.id ? "🏃" : "⚡"}
                  </span>
                  {respondingTo === trip.id
                    ? "Responding — En Route"
                    : "I Can Help — Respond"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  </div>
);
};

export default CfrDashboard;
