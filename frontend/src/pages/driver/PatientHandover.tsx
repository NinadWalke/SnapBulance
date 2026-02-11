import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export interface PatientHandoverProps {}
 
const PatientHandover: React.FC<PatientHandoverProps> = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Send data to backend -> Hospital Dashboard updates
        navigate(`/driver/summary/${tripId}`);
    };

    return ( 
        <div style={{ padding: '2rem' }}>
            <h1>📋 Patient Handover</h1>
            <p>Enter vitals to alert the hospital.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                
                {/* AI Voice Button Placeholder */}
                <div style={{ 
                    border: '2px dashed #007bff', padding: '2rem', 
                    textAlign: 'center', borderRadius: '8px', 
                    background: '#eef6fc', cursor: 'pointer' 
                }}>
                    <span style={{ fontSize: '2rem' }}>🎙️</span>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#007bff' }}>
                        Tap to Record (AI Triage)
                    </p>
                    <small>Auto-fills the form below using Gemini AI</small>
                </div>

                <hr />

                {/* Manual Fields */}
                <label>
                    <strong>Patient Condition</strong>
                    <select style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}>
                        <option>Critical (ICU Needed)</option>
                        <option>Stable</option>
                        <option>Trauma / Accident</option>
                    </select>
                </label>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input type="text" placeholder="BP (e.g. 120/80)" style={{ flex: 1, padding: '0.8rem' }} />
                    <input type="text" placeholder="Pulse (e.g. 90)" style={{ flex: 1, padding: '0.8rem' }} />
                </div>

                <button type="submit" style={{ padding: '1rem', background: 'green', color: 'white', border: 'none', marginTop: '1rem', fontSize: '1.1rem' }}>
                    COMPLETE HANDOVER
                </button>
            </form>
        </div>
     );
}
 
export default PatientHandover;