import * as React from 'react';
import { Link } from 'react-router-dom';

export interface UserProfileProps {}
 
const UserProfile: React.FC<UserProfileProps> = () => {
    // Mock Data
    const user = {
        name: "John Doe",
        phone: "+91 98765 43210",
        email: "john.doe@example.com",
        bloodType: "O+",
        allergies: "Peanuts, Penicillin",
        emergencyContact: "Jane Doe (+91 99999 88888)"
    };

    return ( 
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ 
                    width: '80px', height: '80px', borderRadius: '50%', 
                    background: '#ccc', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', 
                    fontSize: '2rem', marginRight: '1rem' 
                }}>
                    👤
                </div>
                <div>
                    <h1 style={{ margin: 0 }}>{user.name}</h1>
                    <p style={{ color: '#666', margin: 0 }}>{user.phone}</p>
                </div>
            </div>

            {/* Personal Details Card */}
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                <h3>Contact Info</h3>
                <p><strong>Email:</strong> {user.email}</p>
            </div>

            {/* Medical ID Card - CRITICAL for Ambulance App */}
            <div style={{ border: '1px solid #ffcccc', background: '#fff5f5', borderRadius: '8px', padding: '1rem', marginBottom: '2rem' }}>
                <h3 style={{ color: '#d32f2f', marginTop: 0 }}>Medical ID 🏥</h3>
                <p><strong>Blood Type:</strong> {user.bloodType}</p>
                <p><strong>Allergies:</strong> {user.allergies}</p>
                <p><strong>Emergency Contact:</strong> {user.emergencyContact}</p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button style={{ padding: '0.8rem 1.5rem', cursor: 'pointer' }}>Edit Profile</button>
                <Link to="/login">
                    <button style={{ padding: '0.8rem 1.5rem', background: '#333', color: 'white', border: 'none', cursor: 'pointer' }}>
                        Logout
                    </button>
                </Link>
            </div>
        </div>
     );
}
 
export default UserProfile;