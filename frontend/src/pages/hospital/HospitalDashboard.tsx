import * as React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../utils/api";

import './HospitalDashboard.css'

export interface HospitalDashboardProps {}

const HospitalDashboard: React.FC<HospitalDashboardProps> = () => {
  const [incomingTrips, setIncomingTrips] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/hospitals/dashboard");
        setIncomingTrips(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000); // Poll for new arrivals
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sb-hosp">
      <div className="sb-hosp__bg-grid" aria-hidden="true" />

      <div className="sb-hosp__page">
        {/* ── Header ── */}
        <header className="sb-hosp__header">
          <div className="sb-hosp__header-left">
            <div className="sb-hosp__eyebrow">
              <span className="sb-hosp__pulse-dot" aria-hidden="true" />
              <span className="sb-hosp__eyebrow-text">
                Live Feed · Polling Every 5s
              </span>
            </div>
            <h1 className="sb-hosp__title">
              ER <span className="sb-hosp__title-accent">Dashboard</span>
            </h1>
          </div>
          <div className="sb-hosp__header-actions">
            <Link to="/hospital/profile" className="sb-hosp__btn-manage">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M7 1v2M7 11v2M1 7h2M11 7h2M3.2 3.2l1.4 1.4M9.4 9.4l1.4 1.4M3.2 10.8l1.4-1.4M9.4 4.6l1.4-1.4"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              Manage Resources
            </Link>
          </div>
        </header>

        <p className="sb-hosp__subtitle">
          Real-time incoming ambulances & patient triage queue for your
          facility.
        </p>

        {/* ── Live ticker ── */}
        {incomingTrips.length > 0 && (
          <div className="sb-hosp__ticker" aria-live="polite">
            <span className="sb-hosp__ticker-label">Live</span>
            <span className="sb-hosp__ticker-sep" aria-hidden="true" />
            <span className="sb-hosp__ticker-text">
              {incomingTrips
                .map(
                  (t) =>
                    `Unit ${t.driver?.ambulance?.plateNumber ?? "—"} · ${t.medicalReport?.suspectedCondition ?? "Emergency"} · ${t.medicalReport?.severity ?? ""}`,
                )
                .join(" — ")}
            </span>
          </div>
        )}

        {/* ── Stats Row ── */}
        <div className="sb-hosp__stats">
          <div className="sb-hosp__stat">
            <span className="sb-hosp__stat-label">Incoming</span>
            <span className="sb-hosp__stat-val sb-hosp__stat-val--red">
              {incomingTrips.length}
            </span>
            <span className="sb-hosp__stat-sub">Ambulances en route</span>
          </div>
          <div className="sb-hosp__stat">
            <span className="sb-hosp__stat-label">Critical</span>
            <span className="sb-hosp__stat-val sb-hosp__stat-val--red">
              {
                incomingTrips.filter(
                  (t) => t.medicalReport?.severity === "CRITICAL",
                ).length
              }
            </span>
            <span className="sb-hosp__stat-sub">Immediate prep</span>
          </div>
          <div className="sb-hosp__stat">
            <span className="sb-hosp__stat-label">High</span>
            <span className="sb-hosp__stat-val sb-hosp__stat-val--amber">
              {
                incomingTrips.filter(
                  (t) => t.medicalReport?.severity === "HIGH",
                ).length
              }
            </span>
            <span className="sb-hosp__stat-sub">Urgent triage</span>
          </div>
          <div className="sb-hosp__stat">
            <span className="sb-hosp__stat-label">Moderate +</span>
            <span className="sb-hosp__stat-val sb-hosp__stat-val--blue">
              {
                incomingTrips.filter(
                  (t) =>
                    t.medicalReport?.severity !== "CRITICAL" &&
                    t.medicalReport?.severity !== "HIGH",
                ).length
              }
            </span>
            <span className="sb-hosp__stat-sub">Standard triage</span>
          </div>
        </div>

        {/* ── Section label ── */}
        <div className="sb-hosp__section-label">
          <span className="sb-hosp__section-label-text">
            Incoming Units ({incomingTrips.length})
          </span>
          <span className="sb-hosp__section-line" aria-hidden="true" />
        </div>

        {/* ── Empty state ── */}
        {incomingTrips.length === 0 ? (
          <div className="sb-hosp__empty">
            <span className="sb-hosp__empty-icon" aria-hidden="true">
              📡
            </span>
            <h3 className="sb-hosp__empty-title">No Ambulances En Route</h3>
            <p className="sb-hosp__empty-sub">
              All clear. This feed refreshes automatically every 5 seconds.
            </p>
          </div>
        ) : (
          <div className="sb-hosp__grid">
            {incomingTrips.map((trip) => {
              const isCritical = trip.medicalReport?.severity === "CRITICAL";
              const variant = isCritical ? "critical" : "high";

              return (
                <div
                  key={trip.id}
                  className={`sb-hosp__card sb-hosp__card--${variant}`}
                >
                  <div
                    className={`sb-hosp__card-bar sb-hosp__card-bar--${variant}`}
                    aria-hidden="true"
                  />

                  {/* Severity chip */}
                  <div
                    className={`sb-hosp__severity-chip sb-hosp__severity-chip--${variant}`}
                  >
                    <span
                      className="sb-hosp__severity-dot"
                      aria-hidden="true"
                    />
                    <span className="sb-hosp__severity-label">
                      {trip.medicalReport?.severity ?? "Unknown"}
                    </span>
                  </div>

                  <div className="sb-hosp__card-body">
                    <h2 className="sb-hosp__card-condition">
                      {trip.medicalReport?.suspectedCondition || "Emergency"}
                    </h2>

                    <div className="sb-hosp__card-meta">
                      {trip.medicalReport?.paramedicNotes && (
                        <div className="sb-hosp__meta-row">
                          <span
                            className="sb-hosp__meta-icon"
                            aria-hidden="true"
                          >
                            ⬥
                          </span>
                          <span className="sb-hosp__meta-text">
                            {trip.medicalReport.paramedicNotes}
                          </span>
                        </div>
                      )}
                      <div className="sb-hosp__meta-row">
                        <span className="sb-hosp__meta-icon" aria-hidden="true">
                          🚑
                        </span>
                        <span className="sb-hosp__meta-plate">
                          {trip.driver?.ambulance?.plateNumber ?? "N/A"}
                        </span>
                      </div>
                    </div>

                    <span className="sb-hosp__card-status">
                      {trip.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="sb-hosp__card-divider" aria-hidden="true" />

                  <div className="sb-hosp__card-footer">
                    <Link
                      to={`/hospital/patient/${trip.id}`}
                      className={`sb-hosp__btn-track sb-hosp__btn-track--${variant}`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle
                          cx="7"
                          cy="7"
                          r="2.5"
                          stroke="currentColor"
                          strokeWidth="1.3"
                        />
                        <circle
                          cx="7"
                          cy="7"
                          r="6"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeDasharray="3 2"
                        />
                      </svg>
                      Live Tracking & Vitals
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export default HospitalDashboard;
