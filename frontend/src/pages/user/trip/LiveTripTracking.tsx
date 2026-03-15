import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import MapComponent from "../../../components/MapComponent";
import { useAuthStore } from "../../../store/useAuthStore";
import { socket } from "../../../utils/socket";
import { api } from "../../../utils/api";

import './LiveTripTracking.css'

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
    <div className="sb-tracking">
 
        {/* ── Map Area ── */}
        <div className={`sb-tracking__map-area${isChatOpen ? ' sb-tracking__map-area--hidden' : ''}`}>
            {/* Live HUD badge */}
            <div className="sb-tracking__hud-badge" aria-label="Live trip">
                <span className="sb-tracking__hud-badge-dot" aria-hidden="true" />
                # {tripId}
            </div>
 
            {targetLocation ? (
                <MapComponent
                    center={mapCenter}
                    zoom={14}
                    markers={markers}
                    polyline={routeCoords}
                />
            ) : (
                <div className="sb-tracking__map-loading" role="status">
                    <div className="sb-tracking__map-loading-spinner" aria-hidden="true" />
                    <span className="sb-tracking__map-loading-text">Acquiring Location</span>
                </div>
            )}
        </div>
 
        {/* ── Chat Panel (replaces map when open) ── */}
        {isChatOpen && (
            <div className="sb-tracking__chat">
                {/* Chat Header */}
                <div className="sb-tracking__chat-header">
                    <div className="sb-tracking__chat-title">
                        <span aria-hidden="true">💬</span>
                        <h3 className="sb-tracking__chat-title-text">Driver Chat</h3>
                        <span className="sb-tracking__chat-online">
                            <span className="sb-tracking__chat-online-dot" aria-hidden="true" />
                            Live
                        </span>
                    </div>
                    <button
                        className="sb-tracking__chat-close"
                        onClick={() => setIsChatOpen(false)}
                        aria-label="Close chat"
                    >
                        ✕
                    </button>
                </div>
 
                {/* Message List */}
                <div className="sb-tracking__messages" role="log" aria-live="polite" aria-label="Chat messages">
                    {messages.length === 0 ? (
                        <div className="sb-tracking__chat-empty">
                            <span className="sb-tracking__chat-empty-icon" aria-hidden="true">💬</span>
                            <span className="sb-tracking__chat-empty-text">No messages yet. Say hello!</span>
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            const isMe = msg.senderId === user?.id;
                            return (
                                <div
                                    key={idx}
                                    className={`sb-tracking__msg ${isMe ? 'sb-tracking__msg--me' : 'sb-tracking__msg--them'}`}
                                >
                                    <span className="sb-tracking__msg-sender">{msg.senderName}</span>
                                    <div className="sb-tracking__msg-bubble">{msg.message}</div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>
 
                {/* Chat Input */}
                <form className="sb-tracking__chat-form" onSubmit={handleSendMessage}>
                    <input
                        className="sb-tracking__chat-input"
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Message driver..."
                        aria-label="Message input"
                        autoComplete="off"
                    />
                    <button
                        type="submit"
                        className="sb-tracking__chat-send"
                        aria-label="Send message"
                    >
                        ↑
                    </button>
                </form>
            </div>
        )}
 
        {/* ── Bottom Sheet ── */}
        <div className="sb-tracking__sheet">
 
            {/* Status Row */}
            <div className="sb-tracking__status-row">
                <div className="sb-tracking__status-left">
                    <span className="sb-tracking__status-eyebrow">Live Status</span>
                    <p className="sb-tracking__status-message">{statusMessage}</p>
                    {etaMins !== null && (
                        <span className="sb-tracking__eta" aria-live="polite">
                            ⚡ Arriving in ~{etaMins} min{etaMins !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
 
                <div className="sb-tracking__ambulance">
                    <span className="sb-tracking__plate" title="Ambulance plate number">
                        MH-04-AB-1234
                    </span>
                    <span className="sb-tracking__ambulance-type">Mercedes Sprinter (ALS)</span>
                </div>
            </div>
 
            {/* Action Buttons */}
            <div className="sb-tracking__actions">
                <button
                    className={`sb-tracking__btn sb-tracking__btn--chat${isChatOpen ? ' sb-tracking__btn--chat--active' : ''}`}
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    aria-pressed={isChatOpen}
                >
                    {isChatOpen ? (
                        <><span aria-hidden="true">🗺️</span> View Map</>
                    ) : (
                        <>
                            <span aria-hidden="true">💬</span>
                            Chat
                            {messages.length > 0 && (
                                <span className="sb-tracking__chat-badge" aria-label={`${messages.length} messages`}>
                                    {messages.length}
                                </span>
                            )}
                        </>
                    )}
                </button>
 
                <button className="sb-tracking__btn sb-tracking__btn--share">
                    <span aria-hidden="true">📍</span>
                    Share Status
                </button>
            </div>
 
        </div>
    </div>
);
};

export default LiveTripTracking;
