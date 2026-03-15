import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../../utils/socket";
import { useAuthStore } from "../../store/useAuthStore";
import MapComponent from "../../components/MapComponent";
import { api } from "../../utils/api";

import './ActiveNavigation.css'

export interface ActiveNavigationProps {}

interface ChatMessage {
  senderName: string;
  senderId: string;
  message: string;
  timestamp: string;
}

const ActiveNavigation: React.FC<ActiveNavigationProps> = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [status, setStatus] = useState<"TO_PICKUP" | "TO_HOSPITAL">(
    "TO_PICKUP",
  );

  // Map & Routing State
  const [driverLocation, setDriverLocation] = useState<[number, number]>([
    19.1973, 72.9644,
  ]);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [targetLocation, setTargetLocation] = useState<[number, number] | null>(
    null,
  );
  const [targetLabel, setTargetLabel] = useState("📍 Patient");
  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [etaMins, setEtaMins] = useState<number | null>(null);
  const [routeDistanceKm, setRouteDistanceKm] = useState<number | null>(null);

  // 1. Fetch Trip Data to get Patient Location
  useEffect(() => {
    const fetchTrip = async () => {
      if (!tripId) return;
      try {
        // Ensure your backend returns pickupLat and pickupLng here
        const response = await api.get(`/trips/driver/trip/${tripId}`);
        setTargetLocation([response.data.pickupLat, response.data.pickupLng]);

        // If driver has a saved location, set it
        if (response.data.driver?.currentLat) {
          setDriverLocation([
            response.data.driver.currentLat,
            response.data.driver.currentLng,
          ]);
        }
      } catch (error) {
        console.error("Error fetching trip details:", error);
      }
    };
    fetchTrip();
  }, [tripId]);

  // 2. Fetch Route from OSRM
  useEffect(() => {
    const fetchOptimizedRoute = async () => {
      if (!targetLocation) return;

      try {
        // NEW: Added alternatives=true to get multiple path options
        const url = `https://router.project-osrm.org/route/v1/driving/${driverLocation[1]},${driverLocation[0]};${targetLocation[1]},${targetLocation[0]}?overview=full&geometries=geojson&alternatives=true`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.routes && data.routes.length > 0) {
          // OPTIMIZATION ENGINE: Sort routes by shortest duration
          const fastestRoute = data.routes.sort(
            (a: any, b: any) => a.duration - b.duration,
          )[0];

          const coords = fastestRoute.geometry.coordinates.map((c: any[]) => [
            c[1],
            c[0],
          ]);
          setRouteCoords(coords);

          // Set ETA (duration is in seconds) and Distance (in meters)
          setEtaMins(Math.ceil(fastestRoute.duration / 60));
          setRouteDistanceKm(
            parseFloat((fastestRoute.distance / 1000).toFixed(1)),
          );
        }
      } catch (error) {
        console.error("Failed to fetch optimized route", error);
      }
    };

    if (routeCoords.length === 0) {
      fetchOptimizedRoute();
    }
  }, [driverLocation, targetLocation, routeCoords.length]);

  // 3. Telemetry Simulation Engine
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    if (routeCoords.length > 0 && status === "TO_PICKUP") {
      let step = 0;

      timer = setInterval(() => {
        if (step < routeCoords.length) {
          const newLocation = routeCoords[step];
          setDriverLocation(newLocation); // Move on local map

          // Fire socket event to move it on patient's map
          socket.emit("driverLocationUpdate", {
            tripId,
            lat: newLocation[0],
            lng: newLocation[1],
          });

          step++;
        } else {
          clearInterval(timer); // Reached destination
        }
      }, 1000); // Ambulance moves every 1 second for testing
    }

    return () => clearInterval(timer);
  }, [routeCoords, status, tripId]);

  // Socket Setup
  useEffect(() => {
    if (!tripId) return;
    socket.connect();
    socket.emit("joinTrip", tripId);
    socket.on("receiveChat", (data: ChatMessage) =>
      setMessages((prev) => [...prev, data]),
    );
    return () => {
      socket.off("receiveChat");
    };
  }, [tripId]);

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
    setInputText("");
  };

  const handleStatusChange = async () => {
    try {
      if (status === "TO_PICKUP") {
        // 1. Alert Backend. It calculates closest hospital.
        const res = await api.post(`/trips/${tripId}/arrive-to-patient`);
        const updatedTrip = res.data.updatedTrip;

        // 2. Set new target to Hospital
        setTargetLocation([updatedTrip.destLat, updatedTrip.destLng]);
        setTargetLabel(`🏥 ${updatedTrip.hospital.name}`);
        setStatus("TO_HOSPITAL");
        setRouteCoords([]); // Clear route to trigger OSRM recalculation

        // 3. Alert Patient via Socket with NEW DESTINATION
        socket.emit("updateTripStatus", {
          tripId,
          status: "ARRIVED",
          message: `Heading to ${updatedTrip.hospital.name}`,
          destLat: updatedTrip.destLat,
          destLng: updatedTrip.destLng,
        });
      } else {
        await api.post(`/trips/${tripId}/arrive-at-hospital`);
        socket.emit("updateTripStatus", {
          tripId,
          status: "AT_HOSPITAL",
          message: "Arrived at the hospital.",
        });
        navigate(`/driver/handover/${tripId}`);
      }
    } catch (error) {
      console.error("Failed to update trip status", error);
    }
  };

  // Construct markers safely
  // Update markers array for MapComponent
  const markers = [];
  markers.push({ position: driverLocation, label: "🚑 You" });
  if (targetLocation)
    markers.push({ position: targetLocation, label: targetLabel });

  return (
    <div className="sb-nav">
      {/* ── Map Area ── */}
      <div
        className={`sb-nav__map-area${isChatOpen ? " sb-nav__map-area--hidden" : ""}`}
      >
        {/* HUD Overlays */}
        <div className="sb-nav__hud" aria-hidden="true">
          <div className="sb-nav__hud-badge">
            <span className="sb-nav__hud-live-dot" /># {tripId}
          </div>
          <div
            className={`sb-nav__hud-route sb-nav__hud-route--${status === "TO_PICKUP" ? "pickup" : "hospital"}`}
          >
            {status === "TO_PICKUP"
              ? "📍 Route to Patient"
              : `🏥 Route to ${targetLabel.replace("🏥 ", "")}`}
          </div>
        </div>

        <MapComponent
          center={driverLocation}
          zoom={14}
          markers={markers}
          polyline={routeCoords}
        />
      </div>

      {/* ── Chat Panel ── */}
      {isChatOpen && (
        <div className="sb-nav__chat">
          {/* Header */}
          <div className="sb-nav__chat-header">
            <div className="sb-nav__chat-title-wrap">
              <span aria-hidden="true">🩺</span>
              <h3 className="sb-nav__chat-title">Patient Chat</h3>
              <span className="sb-nav__chat-live">
                <span className="sb-nav__chat-live-dot" aria-hidden="true" />
                Live
              </span>
            </div>
            <button
              className="sb-nav__chat-close"
              onClick={() => setIsChatOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            className="sb-nav__messages"
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {messages.length === 0 ? (
              <div className="sb-nav__chat-empty">
                <span className="sb-nav__chat-empty-icon" aria-hidden="true">
                  🩺
                </span>
                <span className="sb-nav__chat-empty-text">
                  Contact patient if needed.
                </span>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div
                    key={idx}
                    className={`sb-nav__msg ${isMe ? "sb-nav__msg--me" : "sb-nav__msg--them"}`}
                  >
                    <span className="sb-nav__msg-sender">{msg.senderName}</span>
                    <div className="sb-nav__msg-bubble">{msg.message}</div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form className="sb-nav__chat-form" onSubmit={handleSendMessage}>
            <input
              className="sb-nav__chat-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Message patient..."
              aria-label="Message input"
              autoComplete="off"
            />
            <button
              type="submit"
              className="sb-nav__chat-send"
              aria-label="Send message"
            >
              ↑
            </button>
          </form>
        </div>
      )}

      {/* ── Bottom Sheet ── */}
      <div
        className={`sb-nav__sheet sb-nav__sheet--${status === "TO_PICKUP" ? "pickup" : "hospital"}`}
      >
        {/* Status Row */}
        <div className="sb-nav__status-row">
          <div className="sb-nav__status-left">
            <span
              className={`sb-nav__phase-label sb-nav__phase-label--${status === "TO_PICKUP" ? "pickup" : "hospital"}`}
            >
              {status === "TO_PICKUP"
                ? "➡️ Head to Pickup"
                : "🏥 Rush to Hospital"}
            </span>

            <div className="sb-nav__metrics">
              <span
                className="sb-nav__metric sb-nav__metric--eta"
                aria-live="polite"
              >
                ⚡ {etaMins ? `${etaMins} min ETA` : "Calculating..."}
              </span>
              <span className="sb-nav__metric sb-nav__metric--dist">
                📏 {routeDistanceKm ? `${routeDistanceKm} km` : "—"}
              </span>
            </div>
          </div>

          {/* Phase progress pills */}
          <div className="sb-nav__phase-pills" aria-label="Mission phase">
            <span
              className={`sb-nav__phase-pill ${status === "TO_PICKUP" ? "sb-nav__phase-pill--active-pickup" : "sb-nav__phase-pill--done"}`}
            >
              <span className="sb-nav__pill-dot" aria-hidden="true" />
              Pickup
            </span>
            <span
              className={`sb-nav__phase-pill ${status === "TO_HOSPITAL" ? "sb-nav__phase-pill--active-hospital" : "sb-nav__phase-pill--done"}`}
            >
              <span className="sb-nav__pill-dot" aria-hidden="true" />
              Hospital
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sb-nav__actions">
          <button
            className={`sb-nav__btn sb-nav__btn--chat${isChatOpen ? " sb-nav__btn--chat--active" : ""}`}
            onClick={() => setIsChatOpen(!isChatOpen)}
            aria-pressed={isChatOpen}
          >
            {isChatOpen ? (
              <>
                <span aria-hidden="true">🗺️</span> Map
              </>
            ) : (
              <>
                <span aria-hidden="true">💬</span> Chat
              </>
            )}
          </button>

          <button
            className={`sb-nav__btn sb-nav__btn--status sb-nav__btn--status-${status === "TO_PICKUP" ? "pickup" : "hospital"}`}
            onClick={handleStatusChange}
            aria-label={
              status === "TO_PICKUP"
                ? "Mark arrived at patient"
                : "Mark arrived at hospital"
            }
          >
            {status === "TO_PICKUP"
              ? "✓ Arrived at Patient"
              : "✓ Arrived at Hospital"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveNavigation;
