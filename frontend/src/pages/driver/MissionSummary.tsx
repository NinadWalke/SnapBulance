import * as React from 'react';
import { Link } from 'react-router-dom';

export interface MissionSummaryProps {}
 
const MissionSummary: React.FC<MissionSummaryProps> = () => {
    return ( 
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h1>Mission Complete</h1>
            <p>Great job! The hospital received the patient data successfully.</p>
            
            <div style={{ margin: '2rem 0', padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px' }}>
                <h3>Trip Earnings</h3>
                <h1 style={{ color: 'green', margin: '0.5rem 0' }}>₹450</h1>
            </div>

            <Link to="/driver/dashboard">
                <button style={{ padding: '1rem 2rem', background: 'black', color: 'white', border: 'none', fontSize: '1rem' }}>
                    Back to Dashboard
                </button>
            </Link>
        </div>
     );
}
 
export default MissionSummary;