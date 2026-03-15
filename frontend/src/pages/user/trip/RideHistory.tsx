import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../utils/api"; // Adjust path if needed
import "./RideHistory.css";

export interface RideHistoryProps {}

// Define the shape based on our backend response
interface TripSummary {
  id: string;
  requestedAt: string;
  pickupAddress: string;
  destAddress: string | null;
  status: string;
  hospital?: { name: string } | null;
}

const RideHistory: React.FC<RideHistoryProps> = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<TripSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/users/trips/history");
        setHistory(response.data);
      } catch (error) {
        console.error("Failed to load history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

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

  // Loading state guard
  if (loading) {
    return (
      <div className="sb-history__loading">
        <div className="sb-history__loading-inner">
          <div className="sb-history__loading-spinner" aria-hidden="true" />
          <span className="sb-history__loading-text">Loading History</span>
        </div>
      </div>
    );
  }

  return (
    <div className="sb-history">
      <div className="sb-history__card">
        {/* ── Page Header ── */}
        <header className="sb-history__header">
          <div className="sb-history__header-left">
            <span className="sb-history__eyebrow">🚑 Dispatch Records</span>
            <h1 className="sb-history__title">Ride History</h1>
            <p className="sb-history__subtitle">
              Your past emergency dispatches and trip details.
            </p>
          </div>

          {history.length > 0 && (
            <div className="sb-history__count-badge">
              <strong>{history.length}</strong>
              {history.length === 1 ? "trip" : "trips"} on record
            </div>
          )}
        </header>

        {/* ── Empty State ── */}
        {history.length === 0 ? (
          <div className="sb-history__empty" role="status">
            <span className="sb-history__empty-icon" aria-hidden="true">
              🛣️
            </span>
            <h2 className="sb-history__empty-title">No trips yet</h2>
            <p className="sb-history__empty-sub">
              Your emergency dispatch history will appear here once you've made
              a booking.
            </p>
          </div>
        ) : (
          /* ── Table Panel ── */
          <div className="sb-history__panel">
            <table className="sb-history__table" aria-label="Ride history">
              <thead className="sb-history__thead">
                <tr>
                  <th className="sb-history__th">Date & Time</th>
                  <th className="sb-history__th">Destination</th>
                  <th className="sb-history__th">Status</th>
                  <th className="sb-history__th sb-history__th--center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((ride) => {
                  const dateObj = new Date(ride.requestedAt);
                  const formattedDay = dateObj.toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });
                  const formattedTime = dateObj.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const destText = ride.hospital?.name || ride.destAddress;
                  const statusVariant = getStatusVariant(ride.status);
                  const statusLabel = ride.status.replace(/_/g, " ");

                  return (
                    <tr className="sb-history__tr" key={ride.id}>
                      {/* Date */}
                      <td className="sb-history__td">
                        <div className="sb-history__date">
                          <span className="sb-history__date-day">
                            {formattedDay}
                          </span>
                          <span className="sb-history__date-time">
                            {formattedTime}
                          </span>
                        </div>
                      </td>

                      {/* Destination */}
                      <td className="sb-history__td">
                        <div className="sb-history__dest">
                          <span
                            className="sb-history__dest-icon"
                            aria-hidden="true"
                          >
                            {ride.hospital ? "🏥" : "📍"}
                          </span>
                          <span
                            className={`sb-history__dest-text${!destText ? " sb-history__dest-text--empty" : ""}`}
                          >
                            {destText || "Not specified"}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="sb-history__td">
                        <span
                          className={`sb-status-badge sb-status-badge--${statusVariant}`}
                        >
                          <span
                            className="sb-status-badge__dot"
                            aria-hidden="true"
                          />
                          {statusLabel}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="sb-history__td sb-history__td--center">
                        <button
                          className="sb-history__view-btn"
                          onClick={() => navigate(`/user/history/${ride.id}`)}
                          aria-label={`View details for trip on ${formattedDay}`}
                        >
                          Details
                          <em
                            className="sb-history__view-btn-arrow"
                            aria-hidden="true"
                          >
                            →
                          </em>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RideHistory;
