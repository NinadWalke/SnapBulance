import * as React from "react";
import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import { socket } from "../../utils/socket";
import { useAuthStore } from "../../store/useAuthStore";

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

  if (loading && !cfrLocation)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Locating you...
      </div>
    );

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h1 style={{ margin: 0, color: "#d32f2f" }}>CFR Dispatch ⛑️</h1>
        <span
          style={{
            background: "#e8f5e9",
            color: "#2e7d32",
            padding: "0.4rem 0.8rem",
            borderRadius: "20px",
            fontWeight: "bold",
            fontSize: "0.9rem",
          }}
        >
          ON DUTY
        </span>
      </div>

      <p style={{ color: "#666", marginBottom: "2rem" }}>
        Active emergencies within a 2km radius. Respond only if you can safely
        reach the location.
      </p>

      {nearbyEmergencies.length === 0 && !loading ? (
        <div
          style={{
            padding: "3rem",
            textAlign: "center",
            background: "#f9f9f9",
            borderRadius: "8px",
            border: "1px dashed #ccc",
          }}
        >
          <h3 style={{ color: "#888" }}>No emergencies nearby</h3>
          <p style={{ color: "#aaa" }}>
            Stay alert. We will notify you if a request comes in.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {nearbyEmergencies.map((trip) => (
            <div
              key={trip.id}
              style={{
                background: "white",
                padding: "1.5rem",
                borderRadius: "8px",
                borderLeft: "5px solid #d32f2f",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 0.5rem 0" }}>Medical Emergency</h3>
                  <p style={{ margin: 0, color: "#555" }}>
                    📍 {trip.pickupAddress}
                  </p>
                  <p
                    style={{
                      margin: "0.3rem 0",
                      fontSize: "0.9rem",
                      color: "#888",
                    }}
                  >
                    Patient: {trip.passenger?.fullName || "Unknown"}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <h2 style={{ margin: 0, color: "#d32f2f" }}>
                    {trip.distanceKm.toFixed(1)} km
                  </h2>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "#666",
                      fontWeight: "bold",
                    }}
                  >
                    {trip.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleRespond(trip.id)}
                disabled={respondingTo === trip.id}
                style={{
                  width: "100%",
                  padding: "1rem",
                  marginTop: "1.5rem",
                  background: respondingTo === trip.id ? "#4caf50" : "#333",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  cursor: respondingTo === trip.id ? "default" : "pointer",
                }}
              >
                {respondingTo === trip.id
                  ? "RESPONDING 🏃‍♂️"
                  : "I CAN HELP (RESPOND)"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CfrDashboard;
