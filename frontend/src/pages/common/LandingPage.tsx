import * as React from "react";
import { Link } from "react-router-dom";

import "./LandingPage.css";

export interface LandingPageProps {}

const LandingPage: React.FC<LandingPageProps> = () => {
  return (
    <div className="sb-landing">
      {/* ════════════════════════════════
            HERO SECTION
        ════════════════════════════════ */}
      <section className="sb-lp-hero">
        {/* Background elements */}
        <div className="sb-lp-hero__grid" aria-hidden="true" />
        <div className="sb-lp-hero__glow" aria-hidden="true" />

        {/* ECG line at bottom of hero */}
        <div className="sb-lp-hero__ecg-wrap" aria-hidden="true">
          <svg
            className="sb-lp-hero__ecg"
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 40 L180 40 L200 40 L220 10 L235 70 L250 20 L265 40 L285 40
                             L460 40 L480 40 L500 10 L515 70 L530 20 L545 40 L565 40
                             L740 40 L760 40 L780 10 L795 70 L810 20 L825 40 L845 40
                             L1020 40 L1040 40 L1060 10 L1075 70 L1090 20 L1105 40 L1125 40
                             L1300 40 L1320 40 L1340 10 L1355 70 L1370 20 L1385 40 L1440 40"
            />
          </svg>
        </div>

        {/* Hero Content */}
        <div className="sb-lp-hero__content">
          {/* Live badge */}
          <div className="sb-lp-hero__badge">
            <span className="sb-lp-hero__badge-dot" aria-hidden="true" />
            India's Emergency Response Network — Live
          </div>

          {/* Giant title */}
          <h1 className="sb-lp-hero__title">
            <span className="sb-lp-hero__title-snap">SNAP</span>
            <span className="sb-lp-hero__title-bulance">BULANCE</span>
          </h1>

          {/* Tagline */}
          <p className="sb-lp-hero__tagline">
            Book an ambulance in <em>seconds.</em> Not minutes.
          </p>

          {/* CTA */}
          <div className="sb-lp-cta-wrap">
            <div style={{ position: "relative", display: "inline-flex" }}>
              <div className="sb-lp-cta-ring" aria-hidden="true" />
              <div
                className="sb-lp-cta-ring sb-lp-cta-ring--2"
                aria-hidden="true"
              />
              <div
                className="sb-lp-cta-ring sb-lp-cta-ring--3"
                aria-hidden="true"
              />
              <Link
                to="/user/home"
                className="sb-lp-cta"
                aria-label="Book an ambulance now"
              >
                <span className="sb-lp-cta__icon" aria-hidden="true">
                  🚨
                </span>
                BOOK AMBULANCE NOW
              </Link>
            </div>
            <p className="sb-lp-cta-note">
              For genuine emergencies only · Available 24 / 7
            </p>
          </div>

          {/* Stats strip */}
          <div
            className="sb-lp-stats"
            role="list"
            aria-label="Platform statistics"
          >
            <div className="sb-lp-stat" role="listitem">
              <span className="sb-lp-stat__value sb-lp-stat__value--red">
                4.2s
              </span>
              <span className="sb-lp-stat__label">Avg. Dispatch</span>
            </div>
            <div className="sb-lp-stat" role="listitem">
              <span className="sb-lp-stat__value">1200+</span>
              <span className="sb-lp-stat__label">Active Units</span>
            </div>
            <div className="sb-lp-stat" role="listitem">
              <span className="sb-lp-stat__value sb-lp-stat__value--green">
                99.8%
              </span>
              <span className="sb-lp-stat__label">Uptime</span>
            </div>
            <div className="sb-lp-stat" role="listitem">
              <span className="sb-lp-stat__value">24/7</span>
              <span className="sb-lp-stat__label">Coverage</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="sb-lp-hero__scroll" aria-hidden="true">
          <div className="sb-lp-hero__scroll-line" />
          <span className="sb-lp-hero__scroll-label">Scroll</span>
        </div>
      </section>

      {/* ════════════════════════════════
            ROLE CARDS SECTION
        ════════════════════════════════ */}
      <section className="sb-lp-roles" aria-label="Platform roles">
        <div className="sb-lp-roles__heading">
          <p className="sb-lp-roles__eyebrow">
            <span aria-hidden="true">◈</span> One Platform, Every Role
          </p>
          <h2 className="sb-lp-roles__title">
            WHO ARE
            <br />
            <span className="sb-lp-roles__title-accent">YOU?</span>
          </h2>
        </div>

        <div className="sb-lp-roles__grid">
          {/* Patient */}
          <Link
            to="/login"
            className="sb-lp-card sb-lp-card--patient"
            aria-label="Login as patient"
          >
            <div className="sb-lp-card__icon-orb" aria-hidden="true">
              👤
            </div>
            <div className="sb-lp-card__body">
              <span className="sb-lp-card__label">Emergency User</span>
              <h3 className="sb-lp-card__title">For Patients</h3>
              <p className="sb-lp-card__desc">
                Instant dispatch, live ambulance tracking, and automated
                hospital alerts — all in one tap.
              </p>
              <div className="sb-lp-card__pills" aria-label="Features">
                <span className="sb-lp-card__pill">Live Tracking</span>
                <span className="sb-lp-card__pill">1-Tap Book</span>
                <span className="sb-lp-card__pill">Driver Chat</span>
              </div>
            </div>
            <span className="sb-lp-card__cta">
              Login as User
              <span className="sb-lp-card__cta-arrow" aria-hidden="true">
                →
              </span>
            </span>
          </Link>

          {/* Driver */}
          <Link
            to="/login"
            className="sb-lp-card sb-lp-card--driver"
            aria-label="Login as driver"
          >
            <div className="sb-lp-card__icon-orb" aria-hidden="true">
              🚑
            </div>
            <div className="sb-lp-card__body">
              <span className="sb-lp-card__label">Responder</span>
              <h3 className="sb-lp-card__title">For Drivers</h3>
              <p className="sb-lp-card__desc">
                Receive nearby emergency requests, OSRM-optimised navigation,
                and earn per completed mission.
              </p>
              <div className="sb-lp-card__pills">
                <span className="sb-lp-card__pill">Smart Routing</span>
                <span className="sb-lp-card__pill">Earnings</span>
                <span className="sb-lp-card__pill">CFR Alerts</span>
              </div>
            </div>
            <span className="sb-lp-card__cta">
              Partner Login
              <span className="sb-lp-card__cta-arrow" aria-hidden="true">
                →
              </span>
            </span>
          </Link>

          {/* Hospital */}
          <Link
            to="/login"
            className="sb-lp-card sb-lp-card--hospital"
            aria-label="Login as hospital admin"
          >
            <div className="sb-lp-card__icon-orb" aria-hidden="true">
              🏥
            </div>
            <div className="sb-lp-card__body">
              <span className="sb-lp-card__label">Medical Facility</span>
              <h3 className="sb-lp-card__title">For Hospitals</h3>
              <p className="sb-lp-card__desc">
                View incoming patient vitals and medical reports before arrival
                — prepare your ER in advance.
              </p>
              <div className="sb-lp-card__pills">
                <span className="sb-lp-card__pill">Pre-arrival Data</span>
                <span className="sb-lp-card__pill">Vitals</span>
                <span className="sb-lp-card__pill">Reports</span>
              </div>
            </div>
            <span className="sb-lp-card__cta">
              Hospital Dashboard
              <span className="sb-lp-card__cta-arrow" aria-hidden="true">
                →
              </span>
            </span>
          </Link>
          {/* CFR */}
          <Link
            to="/login"
            className="sb-lp-card sb-lp-card--cfr"
            aria-label="Login as Community First Responder"
          >
            <div className="sb-lp-card__icon-orb" aria-hidden="true">
              ❤️
            </div>
            <div className="sb-lp-card__body">
              <span className="sb-lp-card__label">Volunteer Network</span>
              <h3 className="sb-lp-card__title">For First Responders</h3>
              <p className="sb-lp-card__desc">
                Receive proximity alerts for nearby emergencies and provide
                critical, life-saving CPR while the ambulance is en route.
              </p>
              <div className="sb-lp-card__pills">
                <span className="sb-lp-card__pill">Proximity Alerts</span>
                <span className="sb-lp-card__pill">CPR Bridge</span>
                <span className="sb-lp-card__pill">Save Lives</span>
              </div>
            </div>
            <span className="sb-lp-card__cta">
              Responder Portal
              <span className="sb-lp-card__cta-arrow" aria-hidden="true">
                →
              </span>
            </span>
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════
            FOOTER BAND
        ════════════════════════════════ */}
      <footer className="sb-lp-footer-band">
        <span className="sb-lp-footer-logo">
          Snap<span>Bulance</span>
        </span>
        <span className="sb-lp-footer-tagline">
          © {new Date().getFullYear()} SnapBulance Project · Emergency Response
          Platform
        </span>
      </footer>
    </div>
  );
};

export default LandingPage;
