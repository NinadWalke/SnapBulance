import * as React from 'react';
import { Link } from 'react-router-dom';

export interface UserHomeProps {}
 
const UserHome: React.FC<UserHomeProps> = () => {
    return ( 
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>User Home</h1>
            <p>Current Location: <strong>[ Map Placeholder ]</strong></p>
            
            <div style={{ marginTop: '3rem', border: '1px dashed #ccc', padding: '2rem' }}>
                <h3>Emergency Assistance Needed?</h3>
                <p>Tap the button below to find the nearest ambulance.</p>
                
                {/* This links to the next step in our flow: Finding a Driver */}
                <Link to="/user/searching">
                    <button style={{ 
                        marginTop: '1rem', 
                        padding: '1rem 2rem', 
                        fontSize: '1.5rem', 
                        backgroundColor: 'red', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}>
                        🚨 BOOK AMBULANCE
                    </button>
                </Link>
            </div>
        </div>
     );
}
 
export default UserHome;