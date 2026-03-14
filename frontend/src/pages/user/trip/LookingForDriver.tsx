import * as React from "react";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { socket } from "../../../utils/socket"; // Import your socket

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

  return (
    <div
      style={{
        padding: "2rem",
        textAlign: "center",
        maxWidth: "600px",
        margin: "0 auto",
        marginTop: "10vh",
      }}
    >
      <style>{`
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 30px rgba(211, 47, 47, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(211, 47, 47, 0); }
                }
            `}</style>

      <h1 style={{ color: "#333" }}>🔍 Locating Ambulance...</h1>
      <p style={{ color: "#666" }}>Trip ID: {tripId}</p>

      <div
        style={{
          margin: "4rem auto",
          height: "120px",
          width: "120px",
          background: "#d32f2f",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "pulse 1.5s infinite",
          color: "white",
          fontSize: "2rem",
        }}
      >
        🚑
      </div>

      <div style={{ marginTop: "4rem", paddingTop: "1rem" }}>
        <p
          style={{ color: "#888", fontSize: "0.9rem", marginBottom: "0.5rem" }}
        >
          Match taking too long?
        </p>
        <Link to={`/user/track/${tripId}`}>
          <button
            style={{
              padding: "0.6rem 1.2rem",
              background: "#333",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Force Dev Match
          </button>
        </Link>
      </div>
    </div>
  );
};

export default LookingForDriver;
