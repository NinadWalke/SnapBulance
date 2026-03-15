import * as React from 'react';
import { Link } from 'react-router-dom';

import './NotFoundPage.css'

export interface NotFoundPageProps {}
 
const NotFoundPage: React.FC<NotFoundPageProps> = () => {
    return (
    <div className="sb-404">
 
        {/* Background elements */}
        <div className="sb-404__grid" aria-hidden="true" />
        <div className="sb-404__glow" aria-hidden="true" />
 
        <div className="sb-404__content">
 
            {/* ── Flatline ECG ── */}
            <div className="sb-404__ecg-wrap" aria-hidden="true">
                <svg className="sb-404__ecg" viewBox="0 0 380 48" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Heartbeat segment — draws in then fades */}
                    <path
                        className="sb-404__ecg-beat"
                        d="M0 24 L60 24 L72 24 L80 6 L88 42 L96 10 L104 24 L116 24 L176 24 L188 24 L196 6 L204 42 L212 10 L220 24 L232 24 L260 24"
                    />
                    {/* Flatline after the beat dies */}
                    <line className="sb-404__ecg-flat" x1="255" y1="24" x2="380" y2="24" />
                </svg>
            </div>
 
            {/* ── Giant 404 ── */}
            <div className="sb-404__number" aria-hidden="true">404</div>
 
            {/* ── Status pill ── */}
            <div className="sb-404__status" role="status">
                <span className="sb-404__status-dot" aria-hidden="true" />
                Signal Lost
            </div>
 
            {/* ── Copy ── */}
            <h1 className="sb-404__title">Page Not Found</h1>
            <p className="sb-404__desc">
                The route you're looking for doesn't exist or has been moved. Let's get you back to safety.
            </p>
 
            {/* ── Actions ── */}
            <div className="sb-404__cta-wrap">
                <Link to="/" className="sb-404__btn" aria-label="Return to SnapBulance home">
                    ← Return to Base
                </Link>
            </div>
 
            {/* ── Decorative error code ── */}
            <div className="sb-404__code" aria-hidden="true">
                <span className="sb-404__code-label">ERR</span>
                HTTP_404_NOT_FOUND · SNAPBULANCE_DISPATCH
            </div>
 
        </div>
    </div>
);
}
 
export default NotFoundPage;