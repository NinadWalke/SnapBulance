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
        paramedicNotes: notes
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

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>📋 Patient Handover</h1>
      <p>Log patient vitals and condition for hospital records.</p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.2rem",
          marginTop: "2rem",
        }}
      >
        <label>
          <strong>Severity Level</strong>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            style={{ width: "100%", padding: "0.8rem", marginTop: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          >
            {/* These map directly to the SeverityLevel Enum in Prisma */}
            <option value="LOW">Low</option>
            <option value="MODERATE">Moderate</option>
            <option value="CRITICAL">Critical</option>
            <option value="LIFE_THREATENING">Life Threatening</option>
          </select>
        </label>

        <label>
          <strong>Suspected Condition</strong>
          <input
            type="text"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder="e.g. Cardiac Arrest, Fracture, Head Trauma"
            style={{ width: "100%", padding: "0.8rem", marginTop: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </label>

        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ flex: 1 }}>
             <strong>Blood Pressure</strong>
             <input
              type="text"
              value={bp}
              onChange={(e) => setBp(e.target.value)}
              placeholder="e.g. 120/80"
              style={{ width: "100%", padding: "0.8rem", marginTop: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>
          <div style={{ flex: 1 }}>
             <strong>Pulse (BPM)</strong>
             <input
              type="text"
              value={pulse}
              onChange={(e) => setPulse(e.target.value)}
              placeholder="e.g. 90"
              style={{ width: "100%", padding: "0.8rem", marginTop: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>
        </div>

        <label>
          <strong>Paramedic Notes</strong>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional observations..."
            style={{ width: "100%", padding: "0.8rem", marginTop: "0.5rem", minHeight: "80px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: "1rem",
            background: isSubmitting ? "#ccc" : "#2e7d32",
            color: "white",
            border: "none",
            borderRadius: "4px",
            marginTop: "1rem",
            fontSize: "1.1rem",
            fontWeight: "bold",
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