import * as React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import { socket } from "../../utils/socket";
import MapComponent from "../../components/MapComponent";

import './IncomingPatientDetail.css';

export interface IncomingPatientDetailProps {}

const IncomingPatientDetail: React.FC<IncomingPatientDetailProps> = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [driverLocation, setDriverLocation] = useState<[number, number] | null>(
    null,
  );

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await api.get(`/hospitals/trip/${tripId}`);
        setTrip(res.data);
        if (res.data.driver?.currentLat) {
          setDriverLocation([
            res.data.driver.currentLat,
            res.data.driver.currentLng,
          ]);
        }
      } catch (err) {
        console.error(err);
        navigate("/hospital/dashboard");
      }
    };
    fetchTrip();
  }, [tripId, navigate]);

  // Listen to live telemetry!
  useEffect(() => {
    if (!tripId) return;
    socket.connect();
    socket.emit("joinTrip", tripId); // Join the same room as the driver and patient

    socket.on("driverLocationUpdated", (data: { lat: number; lng: number }) => {
      setDriverLocation([data.lat, data.lng]);
    });

    socket.on("tripStatusChanged", (data: any) => {
      if (data.status === "COMPLETED") {
        alert("Patient Handover Complete. Returning to dashboard.");
        navigate("/hospital/dashboard");
      }
    });

    return () => {
      socket.off("driverLocationUpdated");
      socket.off("tripStatusChanged");
    };
  }, [tripId, navigate]);

  if (!trip)
    return (
      <div className="sb-ipd__loading">
        <div className="sb-ipd__loading-inner">
          <div className="sb-ipd__spinner" aria-hidden="true" />
          <span className="sb-ipd__loading-text">Loading Patient Data…</span>
        </div>
      </div>
    );

  const hospitalLocation: [number, number] = [trip.destLat, trip.destLng];
  const mapCenter = driverLocation || hospitalLocation;

  return (
    <div className="sb-ipd">
      <div className="sb-ipd__bg-grid" aria-hidden="true" />

      <div className="sb-ipd__page">
        {/* ── Back ── */}
        <button
          className="sb-ipd__back"
          onClick={() => navigate("/hospital/dashboard")}
        >
          <span className="sb-ipd__back-arrow" aria-hidden="true">
            ←
          </span>
          Back to Dashboard
        </button>

        {/* ── Two-Column Layout ── */}
        <div className="sb-ipd__layout">
          {/* ── LEFT — Patient Info ── */}
          <div className="sb-ipd__left">
            {/* Alert banner */}
            <div
              className={`sb-ipd__alert-banner sb-ipd__alert-banner--${
                trip.medicalReport?.severity === "CRITICAL"
                  ? "critical"
                  : "high"
              }`}
            >
              <div className="sb-ipd__alert-top">
                <h1 className="sb-ipd__alert-condition">
                  {trip.medicalReport?.suspectedCondition || "Emergency"}
                </h1>
                <div
                  className={`sb-ipd__severity-pill sb-ipd__severity-pill--${
                    trip.medicalReport?.severity === "CRITICAL"
                      ? "critical"
                      : "high"
                  }`}
                >
                  <span className="sb-ipd__severity-dot" aria-hidden="true" />
                  <span className="sb-ipd__severity-text">
                    {trip.medicalReport?.severity ?? "Unknown"}
                  </span>
                </div>
              </div>
              <div className="sb-ipd__alert-meta">
                <div className="sb-ipd__meta-line">
                  <strong>Patient</strong>
                  <span>{trip.passenger.fullName}</span>
                  {trip.passenger.bloodType && (
                    <span className="sb-ipd__meta-badge">
                      {trip.passenger.bloodType}
                    </span>
                  )}
                </div>
                <div className="sb-ipd__meta-line">
                  <strong>Unit</strong>
                  <span className="sb-ipd__meta-badge">
                    {trip.driver?.ambulance?.plateNumber ?? "N/A"}
                  </span>
                  <span className="sb-ipd__meta-type">
                    {trip.driver?.ambulance?.type ?? ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Vitals panel */}
            <div className="sb-ipd__panel">
              <div className="sb-ipd__panel-header">
                <span className="sb-ipd__panel-icon" aria-hidden="true">
                  🩺
                </span>
                <h2 className="sb-ipd__panel-title">Vitals & Clinical Notes</h2>
              </div>
              <div className="sb-ipd__panel-body">
                <div className="sb-ipd__vital-row">
                  <span className="sb-ipd__vital-label">Blood Pressure</span>
                  <span
                    className={`sb-ipd__vital-value${!trip.medicalReport?.vitalsCheck?.bp ? " sb-ipd__vital-value--muted" : " sb-ipd__vital-value--mono"}`}
                  >
                    {trip.medicalReport?.vitalsCheck?.bp || "Pending"}
                  </span>
                </div>
                <div className="sb-ipd__vital-row">
                  <span className="sb-ipd__vital-label">Pulse</span>
                  <span
                    className={`sb-ipd__vital-value${!trip.medicalReport?.vitalsCheck?.pulse ? " sb-ipd__vital-value--muted" : " sb-ipd__vital-value--mono"}`}
                  >
                    {trip.medicalReport?.vitalsCheck?.pulse || "Pending"}
                  </span>
                </div>
                <div className="sb-ipd__panel-sep" aria-hidden="true" />
                <div className="sb-ipd__vital-row">
                  <span className="sb-ipd__vital-label">Para. Notes</span>
                  <span
                    className={`sb-ipd__vital-value sb-ipd__vital-value--notes${!trip.medicalReport?.paramedicNotes ? " sb-ipd__vital-value--muted" : ""}`}
                  >
                    {trip.medicalReport?.paramedicNotes || "None provided."}
                  </span>
                </div>
                <div className="sb-ipd__vital-row">
                  <span className="sb-ipd__vital-label">Allergies</span>
                  <span
                    className={`sb-ipd__vital-value${!trip.passenger.allergies ? " sb-ipd__vital-value--muted" : ""}`}
                  >
                    {trip.passenger.allergies || "None recorded"}
                  </span>
                </div>
              </div>

              {/* ETA strip */}
              <div className="sb-ipd__eta-strip">
                <span className="sb-ipd__eta-dot" aria-hidden="true" />
                <span className="sb-ipd__eta-text">Ambulance ETA</span>
                <span className="sb-ipd__eta-value">
                  {driverLocation ? "Tracking…" : "Awaiting GPS"}
                </span>
              </div>
            </div>
          </div>

          {/* ── RIGHT — Map ── */}
          <div className="sb-ipd__map-wrap">
            <div className="sb-ipd__map-live-badge">
              <span className="sb-ipd__map-live-dot" aria-hidden="true" />
              <span className="sb-ipd__map-live-text">Live Tracking</span>
            </div>
            <MapComponent
              center={mapCenter}
              zoom={15}
              markers={[
                { position: hospitalLocation, label: `🏥 ${trip.destAddress}` },
                ...(driverLocation
                  ? [{ position: driverLocation, label: "🚑 Ambulance (Live)" }]
                  : []),
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default IncomingPatientDetail;
