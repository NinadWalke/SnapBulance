import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../utils/api';

export interface UserEditProfileProps {}

const UserEditProfile: React.FC<UserEditProfileProps> = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        bloodType: '',
        allergies: '',
        emergencyContact: ''
    });

    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/users/profile');
                const data = response.data; 
                
                setFormData({
                    fullName: data.fullName || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    bloodType: data.bloodType || '',
                    allergies: data.allergies || '',
                    emergencyContact: data.emergencyContact || ''
                });
            } catch (error) {
                console.error('Error fetching profile:', error);
                setMessage({ text: 'Network error or unauthorized.', type: 'error' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ text: 'Saving...', type: 'info' });

        try {
            await api.put('/users/profile', formData);
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
            
            // Redirect back to profile after a short delay
            setTimeout(() => navigate('/user/profile'), 1500);
            
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ text: 'Failed to update profile. Email or phone might already be in use.', type: 'error' });
        }
    };

    if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Edit Profile</h1>
            </div>
            
            {message.text && (
                <div style={{ 
                    padding: '1rem', 
                    marginBottom: '1.5rem', 
                    borderRadius: '4px',
                    border: `1px solid ${message.type === 'error' ? '#ffcccc' : message.type === 'success' ? '#c3e6cb' : '#bee5eb'}`,
                    background: message.type === 'error' ? '#fff5f5' : message.type === 'success' ? '#d4edda' : '#d1ecf1',
                    color: message.type === 'error' ? '#d32f2f' : message.type === 'success' ? '#155724' : '#0c5460'
                }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                <h3 style={{ margin: '0 0 -0.5rem 0', color: '#007bff', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Personal Info</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 'bold', color: '#333' }}>Full Name</label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                        <label style={{ fontWeight: 'bold', color: '#333' }}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                        <label style={{ fontWeight: 'bold', color: '#333' }}>Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 99999 99999"
                            style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }}
                        />
                    </div>
                </div>

                <h3 style={{ margin: '1rem 0 -0.5rem 0', color: '#d32f2f', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Medical Info</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 'bold', color: '#333' }}>Blood Type</label>
                    <select
                        name="bloodType"
                        value={formData.bloodType}
                        onChange={handleChange}
                        style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }}
                    >
                        <option value="">Select Blood Type</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 'bold', color: '#333' }}>Allergies</label>
                    <textarea
                        name="allergies"
                        value={formData.allergies}
                        onChange={handleChange}
                        placeholder="E.g., Penicillin, Peanuts (Leave blank if none)"
                        rows={3}
                        style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem', fontFamily: 'inherit' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 'bold', color: '#333' }}>Emergency Contact</label>
                    <input
                        type="text"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleChange}
                        placeholder="E.g., Jane Doe (+91 99999 88888)"
                        style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button
                        type="submit"
                        style={{ padding: '0.8rem 1.5rem', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1, fontWeight: 'bold' }}
                    >
                        Save Changes
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/user/profile')}
                        style={{ padding: '0.8rem 1.5rem', background: 'transparent', color: '#333', border: '2px solid #ccc', borderRadius: '4px', cursor: 'pointer', flex: 1, fontWeight: 'bold' }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default UserEditProfile;