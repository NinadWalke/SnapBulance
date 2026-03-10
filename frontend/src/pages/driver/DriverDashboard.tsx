import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import { socket } from "../../utils/socket";
import { useAuthStore } from "../../store/useAuthStore";

export interface DriverDashboardProps {}

const DriverDashboard: React.FC<DriverDashboardProps> = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isOnline, setIsOnline] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);

  useEffect(() => {
    socket.connect();
    return () => {
      // Optional cleanup
    };
  }, []);

  // NEW: Fetch requests when online
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const fetchRequests = async () => {
      try {
        const response = await api.get("/drivers/pending-requests");
        setIncomingRequests(response.data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    if (isOnline) {
      fetchRequests(); // Fetch immediately
      interval = setInterval(fetchRequests, 5000); // Then poll every 5s
    } else {
      setIncomingRequests([]); // Clear if offline
    }

    return () => clearInterval(interval);
  }, [isOnline]);

  // Add inside DriverDashboard component
  useEffect(() => {
    const checkActiveTrip = async () => {
      try {
        const response = await api.get("/drivers/active-trip");
        if (response.data) {
          // If driver has an active trip, throw them right back into navigation
          navigate(`/driver/mission/${response.data.id}`);
        }
      } catch (error) {
        console.error("Failed to check active trip", error);
      }
    };
    checkActiveTrip();
  }, [navigate]);

  const toggleStatus = async () => {
    if (isToggling) return;
    setIsToggling(true);
    const newStatus = !isOnline;

    try {
      await api.put("/drivers/status", { isOnline: newStatus });
      setIsOnline(newStatus);
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Could not update status.");
    } finally {
      setIsToggling(false);
    }
  };

  const handleAccept = (tripId: string) => {
    if (!user) return;

    // Emit socket event (this now updates the DB via our Gateway changes!)
    socket.emit("acceptTrip", {
      tripId: tripId,
      driverId: user.id,
    });

    // Navigate driver to tracking
    navigate(`/driver/mission/${tripId}`);
  };

  return (
    <div
      style={{
        padding: "2rem",
        textAlign: "center",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "2rem",
          color: "#666",
        }}
      >
        <span>Earnings: ₹1,200</span>
        <span>Trips: 4</span>
      </div>

      <h1>Driver Dashboard 🚑</h1>

      <div
        onClick={toggleStatus}
        style={{
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          background: isOnline ? "#28a745" : "#ccc",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "2rem auto",
          cursor: isToggling ? "wait" : "pointer",
          fontSize: "1.5rem",
          fontWeight: "bold",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          opacity: isToggling ? 0.7 : 1,
        }}
      >
        {isToggling ? "..." : isOnline ? "ONLINE" : "OFFLINE"}
      </div>

      {isOnline ? (
        <p>Scanning for nearby emergencies...</p>
      ) : (
        <p>Go online to start receiving requests.</p>
      )}

      {/* Request Feed UI */}
      <div
        style={{
          marginTop: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {incomingRequests.map((req) => (
          <div
            key={req.id}
            style={{
              background: "white",
              border: "1px solid #ffcccc",
              borderLeft: "5px solid red",
              padding: "1.5rem",
              borderRadius: "8px",
              textAlign: "left",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
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
                <h3 style={{ margin: "0 0 0.5rem 0", color: "#d32f2f" }}>
                  🚨 Emergency Request
                </h3>
                <p style={{ margin: 0, color: "#555" }}>
                  📍 {req.pickupAddress || "Live Location"}
                </p>
                <p
                  style={{
                    margin: "0.2rem 0 0 0",
                    fontSize: "0.9rem",
                    color: "#888",
                  }}
                >
                  Trip ID: {req.id.substring(0, 8)}...
                </p>
              </div>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  color: "#28a745",
                }}
              >
                ~{req.distanceKm ? req.distanceKm.toFixed(1) : "Unknown"} km
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button
                onClick={() =>
                  setIncomingRequests((prev) =>
                    prev.filter((r) => r.id !== req.id),
                  )
                }
                style={{
                  flex: 1,
                  padding: "0.8rem",
                  background: "#f5f5f5",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Ignore
              </button>
              <button
                onClick={() => handleAccept(req.id)}
                style={{
                  flex: 2,
                  padding: "0.8rem",
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                ACCEPT RIDE
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DriverDashboard;
