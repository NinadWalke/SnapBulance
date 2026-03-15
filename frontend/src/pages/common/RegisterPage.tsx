import * as React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore"; // Adjust path as needed

import "./Register.css";

export interface RegisterPageProps {}

// Exclude SYS_ADMIN from public registration
type RegisterRole = "USER" | "DRIVER" | "HOSPITAL_ADMIN" | "CFR";

const RegisterPage: React.FC<RegisterPageProps> = () => {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuthStore();

  // Form state
  const [role, setRole] = useState<RegisterRole>("USER");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      // Mapping local state to your SignupDto
      await signup({
        fullName,
        email,
        phone,
        passwordHash: password,
        role,
      });

      // Route them based on the role they just registered as
      if (role === "USER") navigate("/user/home", { replace: true });
      else if (role === "DRIVER")
        navigate("/driver/dashboard", { replace: true });
      else if (role === "HOSPITAL_ADMIN")
        navigate("/hospital/dashboard", { replace: true });
      else if (role === "CFR") navigate("/cfr/dashboard", { replace: true });
    } catch (error: any) {
      // Display validation errors from NestJS (often an array of strings for class-validator)
      const message = error.response?.data?.message;
      if (Array.isArray(message)) {
        setErrorMsg(message[0]);
      } else {
        setErrorMsg(message || "Registration failed. Please try again.");
      }
    }
  };

  const roleConfig: Record<
    RegisterRole,
    { icon: string; label: string; desc: string }
  > = {
    USER: {
      icon: "👤",
      label: "Patient",
      desc: "Book & track ambulances",
    },
    DRIVER: {
      icon: "🚑",
      label: "Driver",
      desc: "Accept & navigate missions",
    },
    HOSPITAL_ADMIN: {
      icon: "🏥",
      label: "Hospital",
      desc: "Manage incoming patients",
    },
    CFR: {
      icon: "❤️",
      label: "Responder",
      desc: "Volunteer for CPR alerts",
    },
  };

  return (
    <div className="sb-register">
      {/* Background elements */}
      <div className="sb-register__grid" aria-hidden="true" />
      <div className="sb-register__glow-left" aria-hidden="true" />
      <div className="sb-register__glow-right" aria-hidden="true" />

      {/* ── Two-Panel Layout ── */}
      <div className="sb-register__layout" role="main">
        {/* ── Left: Brand Panel ── */}
        <div className="sb-register__brand" aria-hidden="true">
          <div className="sb-register__brand-top">
            <div className="sb-register__brand-name">
              SNAP
              <span>
                BUL
                <br />
                ANCE
              </span>
            </div>
            <p className="sb-register__brand-tagline">
              Join India's fastest emergency response network. Choose your role
              below.
            </p>

            {/* Live role preview — reacts to role state */}
            <div className="sb-register__brand-roles">
              {(
                Object.entries(roleConfig) as [
                  RegisterRole,
                  (typeof roleConfig)[RegisterRole],
                ][]
              ).map(([key, cfg]) => (
                <div
                  key={key}
                  className={`sb-register__brand-role${role === key ? ` sb-register__brand-role--active-${key}` : ""}`}
                >
                  <span className="sb-register__brand-role-icon">
                    {cfg.icon}
                  </span>
                  <div className="sb-register__brand-role-info">
                    <span className="sb-register__brand-role-name">
                      {cfg.label}
                    </span>
                    <span className="sb-register__brand-role-desc">
                      {cfg.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="sb-register__brand-bottom">
            Secure registration · Emergency personnel only · All data is
            encrypted
          </p>
        </div>

        {/* ── Right: Form Panel ── */}
        <div className="sb-register__form-panel">
          {/* Header */}
          <div className="sb-register__form-header">
            <span className="sb-register__form-eyebrow">📝 New Account</span>
            <h1 className="sb-register__form-title">Create Account</h1>
            <p className="sb-register__form-subtitle">
              Fill in your details to get started.
            </p>
          </div>

          {/* ── Role Selector ── */}
          <div
            className="sb-register__roles"
            role="group"
            aria-label="Select your role"
          >
            {(
              Object.entries(roleConfig) as [
                RegisterRole,
                (typeof roleConfig)[RegisterRole],
              ][]
            ).map(([key, cfg]) => (
              <button
                key={key}
                type="button"
                className={`sb-register__role-btn${role === key ? ` sb-register__role-btn--active-${key}` : ""}`}
                onClick={() => setRole(key)}
                aria-pressed={role === key}
                aria-label={`Register as ${cfg.label}`}
              >
                <span className="sb-register__role-icon" aria-hidden="true">
                  {cfg.icon}
                </span>
                <span className="sb-register__role-label">{cfg.label}</span>
              </button>
            ))}
          </div>

          {/* Error message */}
          {errorMsg && (
            <div
              className="sb-register__error"
              role="alert"
              aria-live="assertive"
            >
              <span aria-hidden="true">⚠</span>
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form
            className="sb-register__form"
            onSubmit={handleSignup}
            noValidate
          >
            <div className="sb-register__field">
              <label className="sb-register__label" htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                className="sb-register__input"
                type="text"
                placeholder="Jane Doe"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="sb-register__row-2col">
              <div className="sb-register__field">
                <label className="sb-register__label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  className="sb-register__input"
                  type="email"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="sb-register__field">
                <label className="sb-register__label" htmlFor="phone">
                  Phone
                </label>
                <input
                  id="phone"
                  className="sb-register__input"
                  type="tel"
                  placeholder="+91 99999 99999"
                  required
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="sb-register__field">
              <label className="sb-register__label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="sb-register__input"
                type="password"
                placeholder="Min. 6 characters"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className={`sb-register__submit sb-register__submit--${role}`}
              disabled={isLoading}
              aria-busy={isLoading}
              aria-label={
                isLoading
                  ? "Creating account, please wait"
                  : `Sign up as ${roleConfig[role].label}`
              }
            >
              {isLoading ? (
                <>
                  <div className="sb-register__spinner" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                  Creating Account...
                </>
              ) : (
                `→ Sign Up as ${roleConfig[role].label}`
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="sb-register__divider" aria-hidden="true">
            <div className="sb-register__divider-line" />
            <span className="sb-register__divider-text">
              Already registered?
            </span>
            <div className="sb-register__divider-line" />
          </div>

          <p className="sb-register__login">
            Already have an account? <Link to="/login">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
