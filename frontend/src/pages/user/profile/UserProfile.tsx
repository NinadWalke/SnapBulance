import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/useAuthStore';
import { api } from '../../../utils/api';

export interface UserProfileProps {}
 
const UserProfile: React.FC<UserProfileProps> = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    
    const [profileData, setProfileData] = useState<any>(user);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchProfile = async () => {
        setIsRefreshing(true);
        try {
            // Updated endpoint to hit the dedicated user controller
            const response = await api.get('/users/profile');
            setProfileData(response.data);
        } catch (error) {
            console.error("Error fetching live profile data:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleLogout = async () => {
        await logout(); 
        navigate('/login', { replace: true });
    };

    if (!profileData) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Profile...</div>;
    }

    return ( 
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ 
                        width: '80px', height: '80px', borderRadius: '50%', 
                        background: '#ccc', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', 
                        fontSize: '2rem', marginRight: '1rem' 
                    }}>
                        👤
                    </div>
                    <div>
                        <h1 style={{ margin: 0 }}>{profileData.fullName}</h1>
                        <p style={{ color: '#666', margin: 0 }}>{profileData.role}</p>
                    </div>
                </div>
                
                <button 
                    onClick={fetchProfile} 
                    disabled={isRefreshing}
                    style={{ 
                        padding: '0.5rem 1rem', 
                        cursor: isRefreshing ? 'not-allowed' : 'pointer',
                        background: '#e0e0e0',
                        border: 'none',
                        borderRadius: '4px'
                    }}
                >
                    {isRefreshing ? 'Syncing...' : '↻ Refresh'}
                </button>
            </div>

            {/* Personal Details Card */}
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                <h3 style={{ marginTop: 0 }}>Contact Info</h3>
                <p><strong>Email:</strong> {profileData.email}</p>
                <p><strong>Phone:</strong> {profileData.phone}</p>
            </div>

            {/* Dynamic Medical ID Card */}
            <div style={{ border: '1px solid #ffcccc', background: '#fff5f5', borderRadius: '8px', padding: '1rem', marginBottom: '2rem' }}>
                <h3 style={{ color: '#d32f2f', marginTop: 0 }}>Medical ID 🏥</h3>
                <p><strong>Blood Type:</strong> {profileData.bloodType || 'Not specified'}</p>
                <p><strong>Allergies:</strong> {profileData.allergies || 'None listed'}</p>
                <p><strong>Emergency Contact:</strong> {profileData.emergencyContact || 'Not specified'}</p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
                <Link to={'/user/profile/edit'} style={{ textDecoration: 'none' }}>
                    <button style={{ padding: '0.8rem 1.5rem', cursor: 'pointer', border: '1px solid #333', background: 'transparent', borderRadius: '4px', color: '#333' }}>
                        Edit Profile
                    </button>
                </Link>
                
                <button 
                    onClick={handleLogout}
                    style={{ padding: '0.8rem 1.5rem', background: '#e63946', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Logout
                </button>
            </div>
        </div>
     );
}
 
export default UserProfile;