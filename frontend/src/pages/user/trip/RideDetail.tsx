import * as React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../utils/api";
import "./RideDetail.css";

export interface RideDetailProps {}

const RideDetail: React.FC<RideDetailProps> = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const response = await api.get(`/users/trip/${tripId}`);
        setTrip(response.data);
      } catch (error) {
        console.error("Failed to load trip details", error);
        alert("Could not load trip details.");
        navigate("/user/history"); // Go back on error
      } finally {
        setLoading(false);
      }
    };
    fetchTripDetails();
  }, [tripId, navigate]);

  if (!trip) return null;

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

  const getSeverityVariant = (severity: string): string => {
    switch ((severity || "").toUpperCase()) {
      case "CRITICAL":
        return "critical";
      case "HIGH":
        return "high";
      case "MODERATE":
        return "moderate";
      case "LOW":
        return "low";
      default:
        return "default";
    }
  };

  // Loading guard
  if (loading) {
    return (
      <div className="sb-detail__loading">
        <div className="sb-detail__loading-inner">
          <div className="sb-detail__loading-spinner" aria-hidden="true" />
          <span className="sb-detail__loading-text">Loading Trip</span>
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
  const severityVariant = trip.medicalReport
    ? getSeverityVariant(trip.medicalReport.severity)
    : "default";

  return (
    <div className="sb-detail">
      <div className="sb-detail__card">
        {/* ── Back ── */}
        <button
          className="sb-detail__back"
          onClick={() => navigate("/user/history")}
        >
          <span className="sb-detail__back-arrow" aria-hidden="true">
            ←
          </span>
          Back to History
        </button>

        {/* ── Header ── */}
        <header className="sb-detail__header">
          <h1 className="sb-detail__title">Trip Details</h1>
          <span className="sb-detail__trip-id" title="Trip ID">
            # {trip.id}
          </span>
        </header>

        {/* ── Overview Panel ── */}
        <div className="sb-detail__panel">
          <div className="sb-detail__panel-header">
            <div className="sb-detail__panel-heading">
              <span className="sb-detail__panel-icon" aria-hidden="true">
                📋
              </span>
              <h2 className="sb-detail__panel-title">Overview</h2>
            </div>
            <span
              className={`sb-status-badge sb-status-badge--${statusVariant}`}
            >
              <span className="sb-status-badge__dot" aria-hidden="true" />
              {trip.status.replace(/_/g, " ")}
            </span>
          </div>
          <div className="sb-detail__panel-body">
            <div className="sb-detail__row">
              <span className="sb-detail__row-label">Requested</span>
              <span className="sb-detail__row-value">{reqDate}</span>
            </div>
            <div className="sb-detail__row">
              <span className="sb-detail__row-label">Completed</span>
              <span
                className={`sb-detail__row-value${!compDate ? " sb-detail__row-value--muted" : ""}`}
              >
                {compDate || "Not yet completed"}
              </span>
            </div>
            <div className="sb-detail__row">
              <span className="sb-detail__row-label">Pickup</span>
              <span className="sb-detail__row-value">{trip.pickupAddress}</span>
            </div>
            <div className="sb-detail__row">
              <span className="sb-detail__row-label">Destination</span>
              <span
                className={`sb-detail__row-value${!destText ? " sb-detail__row-value--muted" : ""}`}
              >
                {destText || "Not specified"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Responder Panel (conditional) ── */}
        {trip.driver && (
          <div className="sb-detail__panel sb-detail__panel--responder">
            <div className="sb-detail__panel-header">
              <div className="sb-detail__panel-heading">
                <span className="sb-detail__panel-icon" aria-hidden="true">
                  🚑
                </span>
                <h2 className="sb-detail__panel-title">
                  Responder & Ambulance
                </h2>
              </div>
            </div>
            <div className="sb-detail__panel-body">
              <div className="sb-detail__row">
                <span className="sb-detail__row-label">Driver</span>
                <span className="sb-detail__row-value">
                  {trip.driver.user.fullName}
                </span>
              </div>
              <div className="sb-detail__row">
                <span className="sb-detail__row-label">Plate No.</span>
                <span
                  className={`sb-detail__row-value${!trip.driver.ambulance?.plateNumber ? " sb-detail__row-value--muted" : " sb-detail__row-value--mono"}`}
                >
                  {trip.driver.ambulance?.plateNumber || "N/A"}
                </span>
              </div>
              <div className="sb-detail__row">
                <span className="sb-detail__row-label">Unit Type</span>
                <span
                  className={`sb-detail__row-value${!trip.driver.ambulance?.type ? " sb-detail__row-value--muted" : ""}`}
                >
                  {trip.driver.ambulance?.type || "N/A"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Medical Report Panel (conditional) ── */}
        {trip.medicalReport && (
          <div className="sb-detail__panel sb-detail__panel--medical">
            <div className="sb-detail__panel-header">
              <div className="sb-detail__panel-heading">
                <span className="sb-detail__panel-icon" aria-hidden="true">
                  🏥
                </span>
                <h2 className="sb-detail__panel-title">Medical Report</h2>
              </div>
            </div>
            <div className="sb-detail__panel-body">
              <div className="sb-detail__row">
                <span className="sb-detail__row-label">Severity</span>
                <span
                  className={`sb-severity-chip sb-severity-chip--${severityVariant}`}
                >
                  {trip.medicalReport.severity}
                </span>
              </div>
              <div className="sb-detail__row">
                <span className="sb-detail__row-label">Condition</span>
                <span
                  className={`sb-detail__row-value${!trip.medicalReport.suspectedCondition ? " sb-detail__row-value--muted" : ""}`}
                >
                  {trip.medicalReport.suspectedCondition || "None noted"}
                </span>
              </div>
              <div className="sb-detail__row">
                <span className="sb-detail__row-label">Para. Notes</span>
                <span
                  className={`sb-detail__row-value${!trip.medicalReport.paramedicNotes ? " sb-detail__row-value--muted" : ""}`}
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

export default RideDetail;
