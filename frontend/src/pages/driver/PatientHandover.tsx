import * as React from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../utils/api";
import { socket } from "../../utils/socket";
import "./PatientHandover.css";

export interface PatientHandoverProps {}

const PatientHandover: React.FC<PatientHandoverProps> = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State mapping to the MedicalReport model
  const [severity, setSeverity] = useState("MODERATE");
  const [condition, setCondition] = useState("");
  const [bp, setBp] = useState("");
  const [pulse, setPulse] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId) return;

    setIsSubmitting(true);

    try {
      // Send the medical data in the request body
      await api.post(`/trips/${tripId}/complete`, {
        severity,
        suspectedCondition: condition,
        vitalsCheck: { bp, pulse },
        paramedicNotes: notes,
      });

      socket.emit("updateTripStatus", {
        tripId,
        status: "COMPLETED",
        message: "Handover complete. Wishing you a speedy recovery!",
      });

      navigate(`/driver/summary/${tripId}`);
    } catch (error) {
      console.error("Error during handover:", error);
      alert("Failed to complete handover. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const severityMeta: Record<string, { label: string }> = {
    LOW: { label: "Low" },
    MODERATE: { label: "Moderate" },
    CRITICAL: { label: "Critical" },
    LIFE_THREATENING: { label: "Life Threatening" },
  };

  return (
    <div className="sb-handover">
      <div className="sb-handover__card">
        {/* ── Header ── */}
        <header className="sb-handover__header">
          <span className="sb-handover__eyebrow">
            <span className="sb-handover__eyebrow-dot" aria-hidden="true" />
            Patient Handover
          </span>
          <h1 className="sb-handover__title">Clinical Record</h1>
          <p className="sb-handover__subtitle">
            Log vitals and condition before completing the handover.
          </p>

          {/* Trip ID strip */}
          <div className="sb-handover__trip-strip">
            <span className="sb-handover__trip-strip-label">Trip&nbsp;</span>#{" "}
            {tripId}
          </div>
        </header>

        {/* ── Form ── */}
        <form className="sb-handover__form" onSubmit={handleSubmit} noValidate>
          {/* ── Severity Section ── */}
          <div className="sb-handover__section sb-handover__section--critical">
            <div className="sb-handover__section-header">
              <span className="sb-handover__section-icon" aria-hidden="true">
                ⚠️
              </span>
              <h2 className="sb-handover__section-title">
                Severity Assessment
              </h2>
            </div>
            <div className="sb-handover__section-body">
              <div className="sb-handover__field">
                <label className="sb-handover__label" htmlFor="severity">
                  Severity Level
                </label>
                <div className="sb-handover__select-wrap">
                  <select
                    id="severity"
                    className="sb-handover__select"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                  >
                    <option value="LOW">Low</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="LIFE_THREATENING">Life Threatening</option>
                  </select>
                </div>

                {/* Live severity bar */}
                <div
                  className="sb-handover__severity-preview"
                  aria-hidden="true"
                >
                  <div
                    className={`sb-handover__severity-bar sb-handover__severity-bar--${severity}`}
                  />
                  <span
                    className={`sb-handover__severity-label sb-handover__severity-label--${severity}`}
                  >
                    {severityMeta[severity]?.label ?? severity}
                  </span>
                </div>
              </div>

              <div className="sb-handover__field">
                <label className="sb-handover__label" htmlFor="condition">
                  Suspected Condition
                </label>
                <input
                  id="condition"
                  className="sb-handover__input"
                  type="text"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  placeholder="e.g. Cardiac Arrest, Fracture, Head Trauma"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          {/* ── Vitals Section ── */}
          <div className="sb-handover__section">
            <div className="sb-handover__section-header">
              <span className="sb-handover__section-icon" aria-hidden="true">
                🩺
              </span>
              <h2 className="sb-handover__section-title">Vitals Check</h2>
            </div>
            <div className="sb-handover__section-body">
              <div className="sb-handover__row-2col">
                <div className="sb-handover__field">
                  <label className="sb-handover__label" htmlFor="bp">
                    Blood Pressure
                  </label>
                  <input
                    id="bp"
                    className="sb-handover__input sb-handover__input--mono"
                    type="text"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    placeholder="120/80"
                    autoComplete="off"
                  />
                </div>
                <div className="sb-handover__field">
                  <label className="sb-handover__label" htmlFor="pulse">
                    Pulse (BPM)
                  </label>
                  <input
                    id="pulse"
                    className="sb-handover__input sb-handover__input--mono"
                    type="text"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    placeholder="90"
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Notes Section ── */}
          <div className="sb-handover__section">
            <div className="sb-handover__section-header">
              <span className="sb-handover__section-icon" aria-hidden="true">
                📋
              </span>
              <h2 className="sb-handover__section-title">Paramedic Notes</h2>
            </div>
            <div className="sb-handover__section-body">
              <div className="sb-handover__field">
                <label className="sb-handover__label" htmlFor="notes">
                  Observations
                </label>
                <textarea
                  id="notes"
                  className="sb-handover__textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional observations, patient responsiveness, scene notes..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* ── Submit ── */}
          <div className="sb-handover__submit-wrap">
            <button
              type="submit"
              className="sb-handover__submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              aria-label={
                isSubmitting
                  ? "Completing handover, please wait"
                  : "Complete patient handover"
              }
            >
              {isSubmitting ? (
                <>
                  <div
                    className="sb-handover__submit-spinner"
                    aria-hidden="true"
                  >
                    <span />
                    <span />
                    <span />
                  </div>
                  COMPLETING...
                </>
              ) : (
                <>✓ COMPLETE HANDOVER</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientHandover;
