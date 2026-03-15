import * as React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";
import { api } from "../../../utils/api";
import "./UserProfile.css";

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
      const response = await api.get("/users/profile");
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
    navigate("/login", { replace: true });
  };

  if (!profileData) {
    return (
      <div className="sb-profile__loading">
        <div className="sb-profile__loading-inner">
          <div className="sb-profile__loading-spinner" aria-hidden="true" />
          <span className="sb-profile__loading-text">Loading Profile</span>
        </div>
      </div>
    );
  }

  return (
    <div className="sb-profile">
      <div className="sb-profile__card">
        {/* ── Hero Header ── */}
        <div className="sb-profile__hero">
          <div className="sb-profile__hero-left">
            {/* Avatar */}
            <div className="sb-profile__avatar">
              <div className="sb-profile__avatar-ring" aria-hidden="true">
                👤
              </div>
              <span className="sb-profile__avatar-status" aria-label="Online" />
            </div>

            {/* Identity */}
            <div className="sb-profile__hero-info">
              <h1 className="sb-profile__name">{profileData.fullName}</h1>
              <span className="sb-profile__role-pill">
                ⚡ {profileData.role}
              </span>
            </div>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchProfile}
            disabled={isRefreshing}
            className={`sb-refresh-btn${isRefreshing ? " sb-refresh-btn--spinning" : ""}`}
            aria-label={
              isRefreshing ? "Syncing profile data" : "Refresh profile"
            }
          >
            <em className="sb-refresh-btn__icon" aria-hidden="true">
              ↻
            </em>
            {isRefreshing ? "Syncing..." : "Refresh"}
          </button>
        </div>

        {/* ── Contact Info Panel ── */}
        <div className="sb-profile__panel">
          <div className="sb-profile__panel-header">
            <span className="sb-profile__panel-icon" aria-hidden="true">
              📋
            </span>
            <h3 className="sb-profile__panel-title">Contact Info</h3>
          </div>
          <div className="sb-profile__panel-body">
            <div className="sb-profile__row">
              <span className="sb-profile__row-label">Email</span>
              <span className="sb-profile__row-value">{profileData.email}</span>
            </div>
            <div className="sb-profile__row">
              <span className="sb-profile__row-label">Phone</span>
              <span className="sb-profile__row-value">{profileData.phone}</span>
            </div>
          </div>
        </div>

        {/* ── Medical ID Panel ── */}
        <div className="sb-profile__panel sb-profile__panel--medical">
          <div className="sb-profile__panel-header">
            <span className="sb-profile__panel-icon" aria-hidden="true">
              🏥
            </span>
            <h3 className="sb-profile__panel-title">Medical ID</h3>
          </div>
          <div className="sb-profile__panel-body">
            <div className="sb-profile__row">
              <span className="sb-profile__row-label">Blood Type</span>
              {profileData.bloodType ? (
                <span className="sb-blood-badge">{profileData.bloodType}</span>
              ) : (
                <span className="sb-profile__row-value sb-profile__row-value--empty">
                  Not specified
                </span>
              )}
            </div>
            <div className="sb-profile__row">
              <span className="sb-profile__row-label">Allergies</span>
              <span
                className={`sb-profile__row-value${!profileData.allergies ? " sb-profile__row-value--empty" : ""}`}
              >
                {profileData.allergies || "None listed"}
              </span>
            </div>
            <div className="sb-profile__row">
              <span className="sb-profile__row-label">Emergency Contact</span>
              <span
                className={`sb-profile__row-value${!profileData.emergencyContact ? " sb-profile__row-value--empty" : ""}`}
              >
                {profileData.emergencyContact || "Not specified"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="sb-profile__actions">
          <Link to="/user/profile/edit">
            <button className="sb-profile__btn sb-profile__btn--edit">
              ✏️ Edit Profile
            </button>
          </Link>
          <button
            onClick={handleLogout}
            className="sb-profile__btn sb-profile__btn--logout"
          >
            ↩ Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
