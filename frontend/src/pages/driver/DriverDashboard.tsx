import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import { socket } from "../../utils/socket";
import { useAuthStore } from "../../store/useAuthStore";

import './DriverDashboard.css'

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
    <div className="sb-driver">
      {/* Ambient background glow — reacts to online/offline */}
      <div
        className={`sb-driver__ambient sb-driver__ambient--${isOnline ? "online" : "offline"}`}
        aria-hidden="true"
      />

      <div className="sb-driver__card">
        {/* ── Stats Bar ── */}
        <div className="sb-driver__stats">
          <div className="sb-driver__stat">
            <span className="sb-driver__stat-label">Today's Earnings</span>
            <span className="sb-driver__stat-value sb-driver__stat-value--green">
              ₹1,200
            </span>
          </div>
          <div className="sb-driver__stat">
            <span className="sb-driver__stat-label">Trips Completed</span>
            <span className="sb-driver__stat-value">4</span>
          </div>
        </div>

        {/* ── Header ── */}
        <header className="sb-driver__header">
          <h1 className="sb-driver__title">Driver Dashboard</h1>
          <p className="sb-driver__subtitle">
            Tap the orb to toggle your availability.
          </p>
        </header>

        {/* ── Status Toggle Orb ── */}
        <div
          className={`sb-driver__orb-wrap sb-driver__orb-wrap--${isOnline ? "online" : "offline"}`}
        >
          <div
            className={`sb-driver__orb sb-driver__orb--${isToggling ? "toggling" : isOnline ? "online" : "offline"}`}
            onClick={toggleStatus}
            role="switch"
            aria-checked={isOnline}
            aria-label={`Driver status: ${isOnline ? "Online" : "Offline"}. Click to toggle.`}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && toggleStatus()}
          >
            {isToggling ? (
              <div className="sb-driver__orb-spinner" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            ) : (
              <>
                <span className="sb-driver__orb-icon" aria-hidden="true">
                  {isOnline ? "🟢" : "🚑"}
                </span>
                <span
                  className={`sb-driver__orb-label${!isOnline ? " sb-driver__orb-label--offline" : ""}`}
                >
                  {isOnline ? "ONLINE" : "OFFLINE"}
                </span>
              </>
            )}
          </div>

          {/* Status caption */}
          <span
            className={`sb-driver__orb-caption sb-driver__orb-caption--${isOnline ? "online" : "offline"}`}
          >
            {isToggling
              ? "Updating status..."
              : isOnline
                ? "You are receiving requests"
                : "Go online to receive emergencies"}
          </span>

          {/* Scanning indicator — only when online */}
          {isOnline && (
            <div className="sb-driver__scanning" aria-live="polite">
              <span className="sb-driver__scanning-dot" aria-hidden="true" />
              Scanning for nearby emergencies
              <div className="sb-driver__scan-bars" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
        </div>

        {/* ── Request Feed ── */}
        {incomingRequests.length > 0 && (
          <>
            <div className="sb-driver__feed-header">
              <h2 className="sb-driver__feed-title">Incoming Requests</h2>
              <span
                className="sb-driver__feed-count"
                aria-label={`${incomingRequests.length} pending requests`}
              >
                {incomingRequests.length}
              </span>
            </div>

            <div
              className="sb-driver__feed"
              role="list"
              aria-label="Emergency requests"
            >
              {incomingRequests.map((req) => (
                <div
                  key={req.id}
                  className="sb-driver__request"
                  role="listitem"
                >
                  <div className="sb-driver__request-top">
                    {/* Info */}
                    <div className="sb-driver__request-info">
                      <h3 className="sb-driver__request-title">
                        🚨 Emergency Request
                      </h3>
                      <span className="sb-driver__request-address">
                        📍 {req.pickupAddress || "Live Location"}
                      </span>
                      <span className="sb-driver__request-id">
                        # {req.id.substring(0, 8)}...
                      </span>
                    </div>

                    {/* Distance */}
                    <div className="sb-driver__request-dist">
                      <span className="sb-driver__request-dist-value">
                        ~{req.distanceKm ? req.distanceKm.toFixed(1) : "—"}
                      </span>
                      <span className="sb-driver__request-dist-unit">
                        km away
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="sb-driver__request-actions">
                    <button
                      className="sb-driver__req-btn sb-driver__req-btn--ignore"
                      onClick={() =>
                        setIncomingRequests((prev) =>
                          prev.filter((r) => r.id !== req.id),
                        )
                      }
                      aria-label="Ignore this request"
                    >
                      Ignore
                    </button>
                    <button
                      className="sb-driver__req-btn sb-driver__req-btn--accept"
                      onClick={() => handleAccept(req.id)}
                      aria-label={`Accept emergency request ${req.id.substring(0, 8)}`}
                    >
                      ✓ Accept Ride
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
