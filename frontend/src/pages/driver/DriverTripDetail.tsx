import * as React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import "./DriverTripDetail.css";

export interface DriverTripDetailProps {}

const DriverTripDetail: React.FC<DriverTripDetailProps> = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const response = await api.get(`/trips/driver/trip/${tripId}`);
        setTrip(response.data);
      } catch (error) {
        console.error("Failed to load trip details", error);
        alert("Could not load mission details.");
        navigate("/driver/trips");
      } finally {
        setLoading(false);
      }
    };
    fetchTripDetails();
  }, [tripId, navigate]);

  const getStatusVariant = (status: string): string => {
    switch (status) {
      case "COMPLETED":
        return "completed";
      case "CANCELLED":
        return "cancelled";
      case "IN_PROGRESS":
      case "SEARCHING":
      case "DRIVER_ASSIGNED":
        return "in-progress";
      default:
        return "default";
    }
  };

  const getSeverityVariant = (severity: string): string =>
    (severity || "").toLowerCase().replace("_", "_");

  // Loading guard
  if (loading) {
    return (
      <div className="sb-dtdetail__loading">
        <div className="sb-dtdetail__loading-inner">
          <div className="sb-dtdetail__loading-spinner" aria-hidden="true" />
          <span className="sb-dtdetail__loading-text">Loading Mission</span>
        </div>
      </div>
    );
  }

  if (!trip) return null;

  const reqDate = new Date(trip.requestedAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const compDate = trip.completedAt
    ? new Date(trip.completedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;
  const destText = trip.hospital?.name || trip.destAddress;
  const statusVariant = getStatusVariant(trip.status);

  return (
    <div className="sb-dtdetail">
      <div className="sb-dtdetail__card">
        {/* ── Back ── */}
        <button
          className="sb-dtdetail__back"
          onClick={() => navigate("/driver/trips")}
        >
          <span className="sb-dtdetail__back-arrow" aria-hidden="true">
            ←
          </span>
          Back to Missions
        </button>

        {/* ── Header ── */}
        <header className="sb-dtdetail__header">
          <h1 className="sb-dtdetail__title">Mission Details</h1>
          <span className="sb-dtdetail__trip-id" title="Trip ID">
            # {trip.id}
          </span>
        </header>

        {/* ── Overview Panel ── */}
        <div className="sb-dtdetail__panel">
          <div className="sb-dtdetail__panel-header">
            <div className="sb-dtdetail__panel-heading">
              <span className="sb-dtdetail__panel-icon" aria-hidden="true">
                📋
              </span>
              <h2 className="sb-dtdetail__panel-title">Overview</h2>
            </div>
            <span
              className={`sb-status-badge sb-status-badge--${statusVariant}`}
            >
              <span className="sb-status-badge__dot" aria-hidden="true" />
              {trip.status.replace(/_/g, " ")}
            </span>
          </div>
          <div className="sb-dtdetail__panel-body">
            <div className="sb-dtdetail__row">
              <span className="sb-dtdetail__row-label">Dispatched</span>
              <span className="sb-dtdetail__row-value">{reqDate}</span>
            </div>
            <div className="sb-dtdetail__row">
              <span className="sb-dtdetail__row-label">Completed</span>
              <span
                className={`sb-dtdetail__row-value${!compDate ? " sb-dtdetail__row-value--muted" : ""}`}
              >
                {compDate || "Not yet completed"}
              </span>
            </div>
            <div className="sb-dtdetail__row">
              <span className="sb-dtdetail__row-label">Pickup</span>
              <span className="sb-dtdetail__row-value">
                {trip.pickupAddress}
              </span>
            </div>
            <div className="sb-dtdetail__row">
              <span className="sb-dtdetail__row-label">Destination</span>
              <span
                className={`sb-dtdetail__row-value${!destText ? " sb-dtdetail__row-value--muted" : ""}`}
              >
                {destText || "Not specified"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Patient Panel ── */}
        <div className="sb-dtdetail__panel sb-dtdetail__panel--patient">
          <div className="sb-dtdetail__panel-header">
            <div className="sb-dtdetail__panel-heading">
              <span className="sb-dtdetail__panel-icon" aria-hidden="true">
                🧑‍⚕️
              </span>
              <h2 className="sb-dtdetail__panel-title">Patient Info</h2>
            </div>
          </div>
          <div className="sb-dtdetail__panel-body">
            <div className="sb-dtdetail__row">
              <span className="sb-dtdetail__row-label">Name</span>
              <span className="sb-dtdetail__row-value">
                {trip.passenger.fullName}
              </span>
            </div>
            <div className="sb-dtdetail__row">
              <span className="sb-dtdetail__row-label">Phone</span>
              <span className="sb-dtdetail__row-value sb-dtdetail__row-value--mono">
                {trip.passenger.phone}
              </span>
            </div>
            <div className="sb-dtdetail__row">
              <span className="sb-dtdetail__row-label">Blood Type</span>
              {trip.passenger.bloodType ? (
                <span className="sb-blood-badge">
                  {trip.passenger.bloodType}
                </span>
              ) : (
                <span className="sb-dtdetail__row-value sb-dtdetail__row-value--muted">
                  Not provided
                </span>
              )}
            </div>
            <div className="sb-dtdetail__row">
              <span className="sb-dtdetail__row-label">Allergies</span>
              <span
                className={`sb-dtdetail__row-value${!trip.passenger.allergies ? " sb-dtdetail__row-value--muted" : ""}`}
              >
                {trip.passenger.allergies || "None noted"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Medical Report Panel (conditional) ── */}
        {trip.medicalReport && (
          <div className="sb-dtdetail__panel sb-dtdetail__panel--medical">
            <div className="sb-dtdetail__panel-header">
              <div className="sb-dtdetail__panel-heading">
                <span className="sb-dtdetail__panel-icon" aria-hidden="true">
                  🏥
                </span>
                <h2 className="sb-dtdetail__panel-title">
                  Medical Report Filed
                </h2>
              </div>
            </div>
            <div className="sb-dtdetail__panel-body">
              <div className="sb-dtdetail__row">
                <span className="sb-dtdetail__row-label">Severity</span>
                <span
                  className={`sb-severity-chip sb-severity-chip--${getSeverityVariant(trip.medicalReport.severity)}`}
                >
                  {trip.medicalReport.severity.replace("_", " ")}
                </span>
              </div>

              <div className="sb-dtdetail__row">
                <span className="sb-dtdetail__row-label">Condition</span>
                <span
                  className={`sb-dtdetail__row-value${!trip.medicalReport.suspectedCondition ? " sb-dtdetail__row-value--muted" : ""}`}
                >
                  {trip.medicalReport.suspectedCondition || "None noted"}
                </span>
              </div>

              {trip.medicalReport.vitalsCheck && (
                <div className="sb-dtdetail__row">
                  <span className="sb-dtdetail__row-label">Vitals</span>
                  <div className="sb-dtdetail__vitals">
                    <span className="sb-dtdetail__vital-chip">
                      <span className="sb-dtdetail__vital-label">BP</span>
                      {trip.medicalReport.vitalsCheck.bp || "—"}
                    </span>
                    <span className="sb-dtdetail__vital-chip">
                      <span className="sb-dtdetail__vital-label">Pulse</span>
                      {trip.medicalReport.vitalsCheck.pulse || "—"}
                    </span>
                  </div>
                </div>
              )}

              <div className="sb-dtdetail__row">
                <span className="sb-dtdetail__row-label">Para. Notes</span>
                <span
                  className={`sb-dtdetail__row-value${!trip.medicalReport.paramedicNotes ? " sb-dtdetail__row-value--muted" : ""}`}
                >
                  {trip.medicalReport.paramedicNotes || "No notes recorded"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverTripDetail;
