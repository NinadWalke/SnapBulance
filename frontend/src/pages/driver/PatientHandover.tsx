import * as React from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../utils/api";
import { socket } from "../../utils/socket";

export interface PatientHandoverProps {}

const PatientHandover: React.FC<PatientHandoverProps> = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId) return;

    setIsSubmitting(true);

    try {
      await api.post(`/trips/${tripId}/complete`, {
        action: "complete_handover",
      });

      // Fire the final socket event to close out the patient UI
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

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📋 Patient Handover</h1>
      <p>Enter vitals to alert the hospital.</p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginTop: "2rem",
        }}
      >
        {/* AI Voice Button Placeholder */}
        <div
          style={{
            border: "2px dashed #007bff",
            padding: "2rem",
            textAlign: "center",
            borderRadius: "8px",
            background: "#eef6fc",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: "2rem" }}>🎙️</span>
          <p style={{ margin: 0, fontWeight: "bold", color: "#007bff" }}>
            Tap to Record (AI Triage)
          </p>
          <small>Auto-fills the form below using Gemini AI</small>
        </div>

        <hr />

        {/* Manual Fields (Ignored in submission for now) */}
        <label>
          <strong>Patient Condition</strong>
          <select
            style={{ width: "100%", padding: "0.8rem", marginTop: "0.5rem" }}
          >
            <option>Critical (ICU Needed)</option>
            <option>Stable</option>
            <option>Trauma / Accident</option>
          </select>
        </label>

        <div style={{ display: "flex", gap: "1rem" }}>
          <input
            type="text"
            placeholder="BP (e.g. 120/80)"
            style={{ flex: 1, padding: "0.8rem" }}
          />
          <input
            type="text"
            placeholder="Pulse (e.g. 90)"
            style={{ flex: 1, padding: "0.8rem" }}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: "1rem",
            background: isSubmitting ? "#ccc" : "green",
            color: "white",
            border: "none",
            marginTop: "1rem",
            fontSize: "1.1rem",
            cursor: isSubmitting ? "not-allowed" : "pointer",
          }}
        >
          {isSubmitting ? "COMPLETING..." : "COMPLETE HANDOVER"}
        </button>
      </form>
    </div>
  );
};

export default PatientHandover;
