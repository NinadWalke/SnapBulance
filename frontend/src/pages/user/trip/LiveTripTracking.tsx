import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import MapComponent from "../../../components/MapComponent";
import { useAuthStore } from "../../../store/useAuthStore";
import { socket } from "../../../utils/socket";
import { api } from "../../../utils/api";

export interface LiveTripTrackingProps {}

interface ChatMessage {
  senderName: string;
  senderId: string;
  message: string;
  timestamp: string;
}

const LiveTripTracking: React.FC<LiveTripTrackingProps> = () => {
  const { tripId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [targetLocation, setTargetLocation] = useState<[number, number] | null>(
    null,
  );
  const [targetLabel, setTargetLabel] = useState("📍 You");
  const [driverLocation, setDriverLocation] = useState<[number, number] | null>(
    null,
  );
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [statusMessage, setStatusMessage] = useState("Ambulance is En Route");

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [etaMins, setEtaMins] = useState<number | null>(null);

  // 1. Fetch initial trip data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await api.get(`/users/trip/${tripId}`);
        setTargetLocation([response.data.pickupLat, response.data.pickupLng]);

        if (response.data.driver && response.data.driver.currentLat) {
          setDriverLocation([
            response.data.driver.currentLat,
            response.data.driver.currentLng,
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch initial trip data", error);
      }
    };
    fetchInitialData();
  }, [tripId]);

  // 2. Fetch OSRM Route to display to patient
  useEffect(() => {
    const fetchOptimizedRoute = async () => {
      if (!targetLocation || !driverLocation || routeCoords.length > 0) return;
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${driverLocation[1]},${driverLocation[0]};${targetLocation[1]},${targetLocation[0]}?overview=full&geometries=geojson&alternatives=true`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.routes && data.routes.length > 0) {
          // Sort for fastest route
          const fastestRoute = data.routes.sort(
            (a: any, b: any) => a.duration - b.duration,
          )[0];

          const coords = fastestRoute.geometry.coordinates.map((c: any[]) => [
            c[1],
            c[0],
          ]);
          setRouteCoords(coords);

          // Calculate precise ETA
          setEtaMins(Math.ceil(fastestRoute.duration / 60));
        }
      } catch (error) {
        console.error("Failed to fetch route", error);
      }
    };
    fetchOptimizedRoute();
  }, [driverLocation, targetLocation, routeCoords.length]);

  // Socket Logic
  useEffect(() => {
    if (!tripId) return;
    socket.connect();
    socket.emit("joinTrip", tripId);

    socket.on("tripStatusChanged", (data: any) => {
      setStatusMessage(data.message);
      if (data.status === "COMPLETED") navigate(`/user/history/${tripId}`);

      // NEW: If driver arrives at patient, switch the map's target to the hospital!
      if (data.status === "ARRIVED" && data.destLat && data.destLng) {
        setTargetLocation([data.destLat, data.destLng]);
        setTargetLabel("🏥 Hospital Destination");
        setRouteCoords([]); // Trigger OSRM recalculation
      }
    });

    socket.on("driverLocationUpdated", (data: { lat: number; lng: number }) => {
      setDriverLocation([data.lat, data.lng]);
    });

    socket.on("receiveChat", (data: ChatMessage) =>
      setMessages((prev) => [...prev, data]),
    );

    socket.on("cfrAlert", (data: { message: string; cfrName: string }) => {
      alert(`🚨 CFR ALERT 🚨\n\n${data.message}`);
    });

    return () => {
      socket.off("tripStatusChanged");
      socket.off("driverLocationUpdated");
    };
  }, [tripId, navigate]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !tripId) return;

    socket.emit("sendChat", {
      tripId,
      senderName: user.fullName,
      senderId: user.id,
      message: inputText.trim(),
    });

    setInputText(""); // Clear input
  };

  const markers = [];
  if (targetLocation)
    markers.push({ position: targetLocation, label: targetLabel });
  if (driverLocation)
    markers.push({ position: driverLocation, label: "🚑 Ambulance" });

  // Fix for the TypeScript union error: guarantee a strict [number, number] tuple
  const mapCenter: [number, number] = driverLocation ||
    targetLocation || [19.1973, 72.9644];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        maxWidth: "600px",
        margin: "0 auto",
        border: "1px solid #ddd",
        position: "relative",
      }}
    >
      {/* Map Area */}
      <div
        style={{
          flex: 2,
          position: "relative",
          display: isChatOpen ? "none" : "block",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            zIndex: 1000,
            background: "white",
            padding: "0.5rem 1rem",
            borderRadius: "20px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            fontSize: "0.9rem",
            fontWeight: "bold",
          }}
        >
          Trip ID: {tripId}
        </div>

        {targetLocation ? (
          <MapComponent
            center={mapCenter}
            zoom={14}
            markers={markers}
            polyline={routeCoords}
          />
        ) : (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            Loading Map...
          </div>
        )}
      </div>{" "}
      {/* <-- ADDED THIS MISSING CLOSING DIV TO FIX YOUR SCOPE ERROR */}
      {/* Chat Area (Overlays Map when open) */}
      {isChatOpen && (
        <div
          style={{
            flex: 2,
            display: "flex",
            flexDirection: "column",
            background: "#f9f9f9",
          }}
        >
          <div
            style={{
              padding: "1rem",
              background: "#333",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ margin: 0 }}>Driver Chat</h3>
            <button
              onClick={() => setIsChatOpen(false)}
              style={{
                background: "transparent",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontSize: "1.2rem",
              }}
            >
              ✖
            </button>
          </div>

          {/* Message List */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {messages.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  color: "#888",
                  marginTop: "2rem",
                }}
              >
                No messages yet. Say hello!
              </p>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div
                    key={idx}
                    style={{
                      alignSelf: isMe ? "flex-end" : "flex-start",
                      maxWidth: "80%",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#666",
                        marginBottom: "2px",
                        textAlign: isMe ? "right" : "left",
                      }}
                    >
                      {msg.senderName}
                    </div>
                    <div
                      style={{
                        padding: "0.8rem",
                        borderRadius: "12px",
                        background: isMe ? "#d32f2f" : "#e0e0e0",
                        color: isMe ? "white" : "black",
                        borderBottomRightRadius: isMe ? "2px" : "12px",
                        borderBottomLeftRadius: isMe ? "12px" : "2px",
                      }}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: "1rem",
              background: "white",
              borderTop: "1px solid #ddd",
              display: "flex",
              gap: "0.5rem",
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Message driver..."
              style={{
                flex: 1,
                padding: "0.8rem",
                borderRadius: "20px",
                border: "1px solid #ccc",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "0 1.2rem",
                background: "#333",
                color: "white",
                border: "none",
                borderRadius: "20px",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
      {/* Bottom Sheet / Driver Info */}
      <div
        style={{
          flex: 1,
          padding: "1.5rem",
          background: "white",
          borderTop: "1px solid #ccc",
          boxShadow: "0 -4px 10px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ margin: "0 0 0.2rem 0", color: "#333" }}>
              Status Update
            </h2>
            <p style={{ margin: 0, color: "#2e7d32", fontWeight: "bold" }}>
              {statusMessage}
            </p>
            {etaMins !== null && (
              <p
                style={{
                  margin: "0.5rem 0 0 0",
                  color: "#d32f2f",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                }}
              >
                ⚡ Arriving in ~{etaMins} min{etaMins !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <h3
              style={{
                margin: "0 0 0.2rem 0",
                background: "#f5f5f5",
                padding: "0.3rem 0.6rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
                display: "inline-block",
              }}
            >
              MH-04-AB-1234
            </h3>
            <p style={{ margin: 0, color: "#666", fontSize: "0.9rem" }}>
              Mercedes Sprinter (ALS)
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          {/* Toggle Chat Button */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            style={{
              flex: 1,
              padding: "1rem",
              background: isChatOpen ? "#ddd" : "#f0f0f0",
              border: "1px solid #ccc",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            {isChatOpen ? "🗺️ View Map" : "💬 Chat with Driver"}
          </button>
          <button
            style={{
              flex: 1,
              padding: "1rem",
              background: "#d32f2f",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            📍 Share Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveTripTracking;
