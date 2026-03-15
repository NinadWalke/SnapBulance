import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../utils/api';
import './UserEditProfile.css';

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

    if (isLoading) {
    return (
        <div className="sb-edit__loading">
            <div className="sb-edit__loading-inner">
                <div className="sb-edit__loading-spinner" aria-hidden="true" />
                <span className="sb-edit__loading-text">Loading Profile</span>
            </div>
        </div>
    );
}
 
return (
    <div className="sb-edit">
        <div className="sb-edit__card">
 
            {/* ── Page Header ── */}
            <header className="sb-edit__header">
                <span className="sb-edit__eyebrow">✏️ Edit Mode</span>
                <h1 className="sb-edit__title">Update Your Profile</h1>
                <p className="sb-edit__subtitle">Changes are reflected immediately across your account.</p>
            </header>
 
            {/* ── Toast Message ── */}
            {message.text && (
                <div
                    className={`sb-edit__toast sb-edit__toast--${message.type}`}
                    role="alert"
                    aria-live="polite"
                >
                    <span className="sb-edit__toast-icon" aria-hidden="true">
                        {message.type === 'error' ? '⚠' : message.type === 'success' ? '✓' : '⟳'}
                    </span>
                    {message.text}
                </div>
            )}
 
            {/* ── Form ── */}
            <form className="sb-edit__form" onSubmit={handleSubmit} noValidate>
 
                {/* ── Personal Info Section ── */}
                <div className="sb-edit__section">
                    <div className="sb-edit__section-header">
                        <span className="sb-edit__section-icon" aria-hidden="true">📋</span>
                        <h2 className="sb-edit__section-title">Personal Info</h2>
                    </div>
                    <div className="sb-edit__section-body">
 
                        {/* Full Name */}
                        <div className="sb-edit__field">
                            <label className="sb-edit__label" htmlFor="fullName">Full Name</label>
                            <input
                                id="fullName"
                                className="sb-edit__input"
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="John Doe"
                                autoComplete="name"
                            />
                        </div>
 
                        {/* Email + Phone */}
                        <div className="sb-edit__row-2col">
                            <div className="sb-edit__field">
                                <label className="sb-edit__label" htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    className="sb-edit__input"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john@example.com"
                                    autoComplete="email"
                                />
                            </div>
                            <div className="sb-edit__field">
                                <label className="sb-edit__label" htmlFor="phone">Phone</label>
                                <input
                                    id="phone"
                                    className="sb-edit__input"
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+91 99999 99999"
                                    autoComplete="tel"
                                />
                            </div>
                        </div>
 
                    </div>
                </div>
 
                {/* ── Medical Info Section ── */}
                <div className="sb-edit__section sb-edit__section--medical">
                    <div className="sb-edit__section-header">
                        <span className="sb-edit__section-icon" aria-hidden="true">🏥</span>
                        <h2 className="sb-edit__section-title">Medical ID</h2>
                    </div>
                    <div className="sb-edit__section-body">
 
                        {/* Blood Type */}
                        <div className="sb-edit__field">
                            <label className="sb-edit__label" htmlFor="bloodType">Blood Type</label>
                            <div className="sb-edit__select-wrap">
                                <select
                                    id="bloodType"
                                    className="sb-edit__select"
                                    name="bloodType"
                                    value={formData.bloodType}
                                    onChange={handleChange}
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
                        </div>
 
                        {/* Allergies */}
                        <div className="sb-edit__field">
                            <label className="sb-edit__label" htmlFor="allergies">Allergies</label>
                            <textarea
                                id="allergies"
                                className="sb-edit__textarea"
                                name="allergies"
                                value={formData.allergies}
                                onChange={handleChange}
                                placeholder="E.g., Penicillin, Peanuts — leave blank if none"
                                rows={3}
                            />
                        </div>
 
                        {/* Emergency Contact */}
                        <div className="sb-edit__field">
                            <label className="sb-edit__label" htmlFor="emergencyContact">Emergency Contact</label>
                            <input
                                id="emergencyContact"
                                className="sb-edit__input"
                                type="text"
                                name="emergencyContact"
                                value={formData.emergencyContact}
                                onChange={handleChange}
                                placeholder="E.g., Jane Doe (+91 99999 88888)"
                            />
                        </div>
 
                    </div>
                </div>
 
                {/* ── Actions ── */}
                <div className="sb-edit__actions">
                    <button type="submit" className="sb-edit__btn sb-edit__btn--save">
                        ✓ Save Changes
                    </button>
                    <button
                        type="button"
                        className="sb-edit__btn sb-edit__btn--cancel"
                        onClick={() => navigate('/user/profile')}
                    >
                        ✕ Cancel
                    </button>
                </div>
 
            </form>
        </div>
    </div>
);
}

export default UserEditProfile;