import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import "./Navbar.css";

export interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  // NEW: Helper function to determine the "Home" route for the logo
  const getHomeRoute = () => {
    if (!isAuthenticated || !user) return "/";
    switch (user.role) {
      case "USER":
      case "CFR":
        return "/user/home";
      case "DRIVER":
        return "/driver/dashboard";
      case "HOSPITAL_ADMIN":
        return "/hospital/dashboard";
      default:
        return "/";
    }
  };

  return (
    <nav className="sb-navbar">
      {/* ── Logo ── */}
      <Link to={getHomeRoute()} className="sb-logo">
        <span className="sb-logo__icon">🚑</span>
        <span className="sb-logo__text">
          Snap<span>Bulance</span>
        </span>
      </Link>

      {/* ── Right Cluster ── */}
      <div className="sb-nav-actions">
        {/* User Badge (shown when authenticated) */}
        {isAuthenticated && user && (
          <div className="sb-user-badge">
            <div className="sb-user-badge__avatar">
              {user.role?.charAt(0) ?? "U"}
            </div>
            <span className="sb-user-badge__role">{user.fullName}</span>
          </div>
        )}

        {/* Nav Links */}
        {!isAuthenticated || !user ? (
          <>
            <Link to="/login" className="sb-nav-link sb-nav-link--login">
              Login
            </Link>
            <Link to="/register" className="sb-nav-link sb-nav-link--register">
              Register
            </Link>
          </>
        ) : user.role === "USER" ? (
          <>
            <Link to="/user/home" className="sb-nav-link">
              Request Ambulance
            </Link>
            <Link to="/user/history" className="sb-nav-link">
              My Rides
            </Link>
            <Link to="/user/profile" className="sb-nav-link">
              Profile
            </Link>
          </>
        ) : user.role === "DRIVER" ? (
          <>
            <Link to="/driver/dashboard" className="sb-nav-link">
              Driver Dashboard
            </Link>
            <Link to="/driver/trips" className="sb-nav-link">
              My Trips
            </Link>
          </>
        ) : user.role === "HOSPITAL_ADMIN" ? (
          <>
            <Link to="/hospital/dashboard" className="sb-nav-link">
              Hospital Dashboard
            </Link>
            <Link to="/hospital/profile" className="sb-nav-link">
              Hospital Profile
            </Link>
          </>
        ) : user.role === "CFR" ? (
          <>
            <Link to="/user/home" className="sb-nav-link">
              Request Ambulance
            </Link>
            <Link to="/user/history" className="sb-nav-link">
              My Rides
            </Link>
            <Link to="/cfr/dashboard" className="sb-nav-link sb-nav-link--cfr">
              ⚡ CFR Duty
            </Link>
            <Link to="/user/profile" className="sb-nav-link">
              Profile
            </Link>
          </>
        ) : null}

        {/* Divider + Logout */}
        {isAuthenticated && (
          <>
            <div className="sb-nav-divider" aria-hidden="true" />
            <button onClick={handleLogout} className="sb-logout-btn">
              <span className="sb-logout-btn__icon">↩</span>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
