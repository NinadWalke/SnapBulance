import * as React from "react";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { socket } from "../../../utils/socket"; // Import your socket
import "./LookingForDriver.css";
import { api } from "../../../utils/api";

export interface LookingForDriverProps {}

const LookingForDriver: React.FC<LookingForDriverProps> = () => {
  const navigate = useNavigate();
  const { tripId } = useParams();

  useEffect(() => {
    if (!tripId) return;

    // Connect and join the trip room to wait for updates
    socket.connect();
    socket.emit("joinTrip", tripId);

    // Listen for the driver accepting the trip
    socket.on("tripAccepted", (data) => {
      console.log("Driver accepted!", data);
      // Navigate to the tracking page now that we have a driver
      navigate(`/user/track/${tripId}`);
    });

    socket.on("cfrAlert", (data: { message: string; cfrName: string }) => {
      alert(`🚨 CFR ALERT 🚨\n\n${data.message}`);
    });

    return () => {
      socket.off("tripAccepted");
      // Don't disconnect here, we need it for the next page
    };
  }, [navigate, tripId]);

  const handleCancel = async () => {
    try {
      await api.post(`/trips/${tripId}/cancel`);
      // Emit a socket event if you want the backend to know instantly,
      // or just navigate back home
      navigate("/user/home", { replace: true });
    } catch (error) {
      console.error("Failed to cancel trip:", error);
      alert("Could not cancel the trip. Please try again.");
    }
  };

  return (
    <div className="sb-searching">
      <div className="sb-searching__content">
        {/* ── Header ── */}
        <header className="sb-searching__header">
          <span className="sb-searching__eyebrow">
            <span className="sb-searching__eyebrow-dot" aria-hidden="true" />
            Live Dispatch
          </span>
          <h1 className="sb-searching__title">
            Locating
            <br />
            Nearest Unit
          </h1>
          <span className="sb-searching__trip-id" title="Trip ID">
            # {tripId}
          </span>
        </header>

        {/* ── Sonar Pulse Rig ── */}
        <div
          className="sb-sonar"
          role="status"
          aria-label="Searching for ambulance"
        >
          <div
            className="sb-sonar__ring sb-sonar__ring--1"
            aria-hidden="true"
          />
          <div
            className="sb-sonar__ring sb-sonar__ring--2"
            aria-hidden="true"
          />
          <div
            className="sb-sonar__ring sb-sonar__ring--3"
            aria-hidden="true"
          />
          <div className="sb-sonar__core" aria-hidden="true">
            🚑
          </div>
        </div>

        {/* ── Status Ticker ── */}
        <div className="sb-searching__status" aria-live="polite">
          <div className="sb-searching__steps" aria-label="Dispatch steps">
            <span
              className="sb-searching__step sb-searching__step--done"
              title="Trip created"
            />
            <span
              className="sb-searching__step sb-searching__step--done"
              title="Location confirmed"
            />
            <span
              className="sb-searching__step sb-searching__step--active"
              title="Finding driver"
            />
            <span className="sb-searching__step" title="Driver assigned" />
            <span className="sb-searching__step" title="En route" />
          </div>
          <span className="sb-searching__status-label">
            Scanning for available units
            <span className="sb-searching__ellipsis" aria-hidden="true" />
          </span>
        </div>

        {/* ── Cancel Panel ── */}
        <div className="sb-searching__dev-panel">
          <span className="sb-searching__dev-hint">Entered by mistake?</span>
          <button
            onClick={handleCancel}
            className="sb-dev-btn"
            style={{
              background: "transparent",
              color: "#e63946",
              border: "1px solid #e63946",
            }}
          >
            Cancel Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default LookingForDriver;
