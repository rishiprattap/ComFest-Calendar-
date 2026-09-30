"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Menu, X, Calendar, User, Home, Clock } from "lucide-react";
import AddCalendarButton from "@/components/AddCalendarButton";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/schedule", label: "Full Schedule", icon: Calendar },
    { href: "/my-events", label: "My Events", icon: User },
    { href: "/day-1", label: "Day 1", icon: Clock },
    { href: "/day-2", label: "Day 2", icon: Clock },
    { href: "/day-3", label: "Day 3", icon: Clock },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="navbar" id="site-navigation" aria-label="Main Navigation">
      <div className="container nav-inner">
        {/* Brand Logo */}
        <Link
          href="/"
          className="nav-brand"
          id="nav-brand-logo"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="brand-badge">JCC</span>
          <span className="brand-text">COMFEST&apos;26</span>
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="nav-links" id="main-nav-links">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <li
                key={link.href}
                className={`nav-item ${active ? "active" : ""}`}
              >
                <Link href={link.href} id={`nav-link-${link.label.toLowerCase().replace(/\s+/g, "")}`}>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop Action Buttons */}
        <div className="nav-cta">
          <AddCalendarButton
            label="Add to Calendar"
            className="btn-primary btn-sm"
            id="nav-cta-add-calendar"
          />
          <Link
            href="/admin"
            className="btn-secondary btn-sm"
            id="nav-admin-link"
            title="Admin Portal"
            style={{ minHeight: "40px" }}
          >
            <Shield size={14} /> Admin
          </Link>
        </div>

        {/* Mobile Actions: My Events + Hamburger Menu Toggle */}
        <div className="mobile-nav-controls">
          <Link
            href="/my-events"
            className="btn-secondary btn-sm"
            id="btn-mobile-quick-my-events"
            style={{
              padding: "6px 10px",
              fontSize: "0.82rem",
              minHeight: "44px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <User size={14} style={{ color: "var(--accent-cyan)" }} /> My Events
          </Link>

          <button
            type="button"
            className="mobile-menu-toggle"
            id="btn-mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            style={{
              minWidth: "44px",
              minHeight: "44px",
              padding: "8px",
              background: "rgba(0, 240, 255, 0.08)",
              border: "1px solid var(--border-glow)",
              borderRadius: "var(--radius-sm)",
              color: "var(--accent-cyan)",
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer"
          id="mobile-nav-drawer"
          style={{
            background: "rgba(4, 9, 26, 0.98)",
            borderBottom: "1px solid var(--border-glow)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.8)",
            padding: "1rem 1.25rem 1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              marginBottom: "1rem",
            }}
          >
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    minHeight: "44px",
                    color: active ? "#ffffff" : "var(--text-muted)",
                    background: active
                      ? "rgba(0, 240, 255, 0.15)"
                      : "transparent",
                    border: active
                      ? "1px solid rgba(0, 240, 255, 0.3)"
                      : "1px solid transparent",
                    fontWeight: active ? 700 : 500,
                    fontSize: "0.95rem",
                  }}
                  id={`drawer-link-${link.label.toLowerCase().replace(/\s+/g, "")}`}
                >
                  <Icon
                    size={18}
                    style={{
                      color: active ? "var(--accent-cyan)" : "var(--text-dim)",
                    }}
                  />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              paddingTop: "0.75rem",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <AddCalendarButton
              label="📅 ADD COMFEST'26 CALENDAR"
              className="btn-primary"
              id="mobile-drawer-add-calendar"
              style={{
                width: "100%",
                minHeight: "46px",
                justifyContent: "center",
                fontWeight: 800,
              }}
            />

            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-secondary"
              id="mobile-drawer-admin"
              style={{
                width: "100%",
                minHeight: "44px",
                justifyContent: "center",
                color: "var(--text-muted)",
                fontSize: "0.9rem",
              }}
            >
              <Shield size={16} /> Coordinator / Admin Portal
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
