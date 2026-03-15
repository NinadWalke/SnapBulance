import * as React from "react";
import './Footer.css'
export interface FooterProps {}

const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="sb-footer">
      <div className="sb-footer__inner">
        {/* ── Left: Brand ── */}
        <div className="sb-footer__brand">
          <a href="/" className="sb-footer__logo">
            <span className="sb-footer__logo-icon">🚑</span>
            <span className="sb-footer__logo-text">
              Snap<span>Bulance</span>
            </span>
          </a>
          <span className="sb-footer__tagline">
            Emergency Dispatch Platform
          </span>
        </div>

        {/* ── Center: ECG + Copyright ── */}
        <div className="sb-footer__center">
          {/* Animated ECG flatline-spike SVG */}
          <svg
            className="sb-footer__pulse"
            viewBox="0 0 120 28"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M0 14 L28 14 L34 14 L38 4 L42 24 L46 8 L50 14 L56 14 L92 14 L120 14" />
          </svg>

          <p className="sb-footer__copyright">
            &copy; {new Date().getFullYear()}{" "}
            <strong>SnapBulance Project.</strong> All rights reserved.
          </p>
        </div>

        {/* ── Right: System Status ── */}
        <div className="sb-footer__status">
          <div className="sb-footer__status-pill">
            <span className="sb-footer__status-dot" aria-hidden="true" />
            <span className="sb-footer__status-label">
              All Systems Operational
            </span>
          </div>
          <span className="sb-footer__build">
            v1.0.0 · {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
