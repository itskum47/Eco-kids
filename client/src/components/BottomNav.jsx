import React from "react";
import { Link } from "react-router-dom";

export default function BottomNav() {
    return (
        <div style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            height: "60px",
            backgroundColor: "var(--t1)",
            borderTop: "1px solid #eaeaea",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.05)"
        }}>
            <Link to="/" style={{ textDecoration: "none", color: "#333", fontWeight: "bold" }}>Home</Link>
            <Link to="/leaderboards" style={{ textDecoration: "none", color: "#333", fontWeight: "bold" }}>Leaderboard</Link>
            <Link to="/submit" style={{ textDecoration: "none", color: "#333", fontWeight: "bold" }}>Submit</Link>
            <Link to="/profile" style={{ textDecoration: "none", color: "#333", fontWeight: "bold" }}>Profile</Link>
        </div>
    );
}
