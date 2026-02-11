import * as React from 'react';
import { Link } from 'react-router-dom';

export interface LandingPageProps {}
 
const LandingPage: React.FC<LandingPageProps> = () => {
    return ( 
        <div style={{ fontFamily: 'sans-serif' }}>
            {/* Hero Section */}
            <header style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '4rem 2rem', 
                textAlign: 'center', 
                borderBottom: '1px solid #e9ecef' 
            }}>
                <h1 style={{ fontSize: '3.5rem', margin: '0 0 1rem 0', color: '#2c3e50' }}>
                    SnapBulance 🚑
                </h1>
                <p style={{ fontSize: '1.5rem', color: '#6c757d', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
                    India's fastest emergency response network. 
                    <br />
                    <strong>Book an ambulance in seconds.</strong>
                </p>

                {/* Main CTA - The "Panic Button" */}
                <Link to="/user/home">
                    <button style={{ 
                        padding: '1.2rem 3rem', 
                        fontSize: '1.2rem', 
                        backgroundColor: '#dc3545', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '50px', 
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px rgba(220, 53, 69, 0.3)'
                    }}>
                        🚨 BOOK AMBULANCE NOW
                    </button>
                </Link>
            </header>

            {/* Role Selection / Features Grid */}
            <section style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '2rem', 
                padding: '4rem 2rem', 
                maxWidth: '1200px', 
                margin: '0 auto' 
            }}>
                
                {/* For Patients */}
                <div style={cardStyle}>
                    <div style={iconStyle}>👤</div>
                    <h3>For Patients</h3>
                    <p>Live tracking, instant booking, and automated hospital alerts.</p>
                    <Link to="/login" style={linkStyle}>Login as User &rarr;</Link>
                </div>

                {/* For Drivers */}
                <div style={cardStyle}>
                    <div style={iconStyle}>🚑</div>
                    <h3>For Drivers</h3>
                    <p>Receive nearby emergency requests, navigation, and earn per trip.</p>
                    <Link to="/login" style={linkStyle}>Partner Login &rarr;</Link>
                </div>

                {/* For Hospitals */}
                <div style={cardStyle}>
                    <div style={iconStyle}>🏥</div>
                    <h3>For Hospitals</h3>
                    <p>View incoming patient vitals and prepare your ER before arrival.</p>
                    <Link to="/login" style={linkStyle}>Hospital Dashboard &rarr;</Link>
                </div>

            </section>
        </div>
     );
}

// Simple internal styles for cleaner code
const cardStyle: React.CSSProperties = {
    padding: '2rem',
    border: '1px solid #dee2e6',
    borderRadius: '12px',
    textAlign: 'center',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
};

const iconStyle: React.CSSProperties = {
    fontSize: '3rem',
    marginBottom: '1rem'
};

const linkStyle: React.CSSProperties = {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: 'bold',
    marginTop: '1rem',
    display: 'inline-block'
};
 
export default LandingPage;