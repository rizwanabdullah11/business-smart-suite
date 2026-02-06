/**
 * Color constants for Business Smart Suite
 * All colors used throughout the application
 */

export const COLORS = {
    // Primary Brand Colors
    primary: "#c92a2a",
    primaryLight: "#e03131",
    primaryShadow: "rgba(201, 42, 42, 0.25)",

    // Text Colors
    textPrimary: "#1a1d21",
    textSecondary: "#495057",
    textMuted: "#6c757d",

    // Border Colors
    border: "#e9ecef",
    borderHover: "#dee2e6",

    // Background Colors
    bgWhite: "#ffffff",
    bgWhiteTransparent: "rgba(255, 255, 255, 0.95)",

    // Shadows (CSS variables)
    loginCardShadow: "0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
    loginCardShadowHover: "0 20px 60px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.06)",
} as const;

// CSS Custom Properties for use in Tailwind classes
export const CSS_VARS = {
    "--login-card-shadow": COLORS.loginCardShadow,
    "--login-card-shadow-hover": COLORS.loginCardShadowHover,
} as const;
