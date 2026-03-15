import * as React from "react";
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../utils/api";
import "./MissionSummary.css";

export interface MissionSummaryProps {}

const MissionSummary: React.FC<MissionSummaryProps> = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTripSummary = async () => {
      if (!tripId) return;
      try {
        const response = await api.get(`/trips/driver/trip/${tripId}`);
        setTrip(response.data);
      } catch (error) {
        console.error("Failed to load mission summary", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTripSummary();
  }, [tripId]);

  if (loading) {
    return (
      <div className="sb-summary__loading">
        <div className="sb-summary__loading-inner">
          <div className="sb-summary__loading-spinner" aria-hidden="true" />
          <span className="sb-summary__loading-text">Loading Summary</span>
        </div>
      </div>
    );
  }

  // Error guard
  if (!trip) {
    return (
      <div className="sb-summary__error">
        <div className="sb-summary__error-inner">
          <span style={{ fontSize: "2rem" }}>⚠️</span>
          <span className="sb-summary__error-text">Trip data not found.</span>
        </div>
      </div>
    );
  }

  const earnings = trip.distanceKm
    ? Math.round(trip.distanceKm * 50 + 100)
    : 450;

  return (
    <div className="sb-summary">
      <div className="sb-summary__content">
        {/* ── Success Orb ── */}
        <div className="sb-summary__orb" aria-hidden="true">
          <div className="sb-summary__orb-ring sb-summary__orb-ring--1" />
          <div className="sb-summary__orb-ring sb-summary__orb-ring--2" />
          <div className="sb-summary__orb-ring sb-summary__orb-ring--3" />
          <div className="sb-summary__orb-core">✓</div>
        </div>

        {/* ── Header ── */}
        <header className="sb-summary__header">
          <h1 className="sb-summary__title">Mission Complete</h1>
          <p className="sb-summary__subtitle">
            Patient data received. Great work out there.
          </p>
          <p className="sb-summary__handover-line">
            <span className="sb-summary__handover-name">
              {trip.passenger.fullName}
            </span>
            <span className="sb-summary__handover-arrow" aria-hidden="true">
              →
            </span>
            <span className="sb-summary__handover-hospital">
              🏥 {trip.hospital?.name || "Destination"}
            </span>
          </p>
        </header>

        {/* ── Earnings Card ── */}
        <div
          className="sb-summary__earnings"
          aria-label={`Trip earnings: ₹${earnings}`}
        >
          <span className="sb-summary__earnings-label">Trip Earnings</span>
          <span className="sb-summary__earnings-amount">₹{earnings}</span>
          <span className="sb-summary__earnings-sub">Added to your wallet</span>
        </div>

        {/* ── Trip Stats Chips ── */}
        <div className="sb-summary__stats" aria-label="Trip statistics">
          {trip.distanceKm && (
            <span className="sb-summary__stat-chip">
              📏 <strong>{trip.distanceKm.toFixed(1)} km</strong>
            </span>
          )}
          <span className="sb-summary__stat-chip">
            🆔 <strong># {String(tripId).substring(0, 8)}...</strong>
          </span>
          <span className="sb-summary__stat-chip">
            ✅ <strong>Completed</strong>
          </span>
        </div>

        {/* ── Actions ── */}
        <div className="sb-summary__actions">
          <Link to={`/driver/trips/${tripId}`}>
            <button className="sb-summary__btn sb-summary__btn--details">
              📋 Mission Details
            </button>
          </Link>
          <Link to="/driver/dashboard">
            <button className="sb-summary__btn sb-summary__btn--dashboard">
              🚑 Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MissionSummary;
