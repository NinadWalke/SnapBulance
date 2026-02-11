import * as React from 'react';
import { useParams } from 'react-router-dom';

export interface IncomingPatientDetailProps {}
 
const IncomingPatientDetail: React.FC<IncomingPatientDetailProps> = () => {
    const { tripId } = useParams();

    return ( 
        <div style={{ padding: '2rem', display: 'flex', gap: '2rem', height: '80vh' }}>
            
            {/* Left: Patient Data */}
            <div style={{ flex: 1 }}>
                <div style={{ background: '#ffebee', padding: '1rem', borderRadius: '8px', border: '1px solid red', marginBottom: '2rem' }}>
                    <h1 style={{ color: '#c62828', margin: 0 }}>CRITICAL: Cardiac Arrest</h1>
                    <p><strong>ETA:</strong> 4 Minutes</p>
                    <p><strong>Ambulance:</strong> MH-04-AB-1234 (ALS)</p>
                </div>

                <h3>🩺 Live Vitals (Streamed)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={vitalBoxStyle}>
                        <small>BP</small>
                        <h2>140/90</h2>
                    </div>
                    <div style={vitalBoxStyle}>
                        <small>Pulse</small>
                        <h2>110 bpm</h2>
                    </div>
                    <div style={vitalBoxStyle}>
                        <small>SpO2</small>
                        <h2>92%</h2>
                    </div>
                </div>

                <h3>🤖 AI Triage Summary</h3>
                <p style={{ background: '#f1f1f1', padding: '1rem', borderRadius: '4px' }}>
                    "Patient male, 55 years old. Complaining of severe chest pain radiating to left arm. Sweating profusely. History of hypertension. Suspected STEMI."
                </p>

                <button style={{ width: '100%', padding: '1rem', background: 'green', color: 'white', border: 'none', fontSize: '1.2rem', marginTop: '1rem' }}>
                    ACKNOWLEDGE & PREPARE BED
                </button>
            </div>

            {/* Right: Live Map */}
            <div style={{ flex: 1, background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                <h3>🗺️ Ambulance Location Map ({tripId})</h3>
            </div>
        </div>
     );
}

const vitalBoxStyle: React.CSSProperties = {
    background: 'white', border: '1px solid #ccc', padding: '1rem', textAlign: 'center', borderRadius: '8px'
};
 
export default IncomingPatientDetail;