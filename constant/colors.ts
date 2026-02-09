export const COLORS = {
    // Primary Brand Colors
    primary: "#2563eb",
    primaryLight: "#3b82f6",
    primaryDark: "#1d4ed8",
    primaryShadow: "rgba(37, 99, 235, 0.25)",

    // Text Colors
    textPrimary: "#1a1d21",
    textSecondary: "#495057",
    textMuted: "#6c757d",
    textWhite: "#ffffff",
    textLight: "#868e96",

    // Border Colors
    border: "#e9ecef",
    borderHover: "#dee2e6",
    borderLight: "#f1f3f5",

    // Background Colors
    bgWhite: "#ffffff",
    bgWhiteTransparent: "rgba(255, 255, 255, 0.95)",
    bgGray: "#f8f9fa",
    bgGrayLight: "#fafbfc",

    // Neutral Colors (for cards and sections)
    neutral900: "#212529",
    neutral800: "#343a40",
    neutral700: "#495057",
    neutral600: "#6c757d",
    neutral500: "#868e96",
    neutral400: "#adb5bd",
    neutral300: "#ced4da",
    neutral200: "#e9ecef",
    neutral100: "#f8f9fa",
    neutral50: "#fafbfc",

    // Blue Colors (for accents)
    blue900: "#1e3a8a",
    blue800: "#1e40af",
    blue700: "#1d4ed8",
    blue600: "#2563eb",
    blue500: "#3b82f6",
    blue400: "#60a5fa",
    blue300: "#93c5fd",
    blue200: "#bfdbfe",
    blue100: "#dbeafe",
    blue50: "#eff6ff",

    // Emerald Colors (for success/accent)
    emerald900: "#064e3b",
    emerald800: "#065f46",
    emerald700: "#047857",
    emerald600: "#059669",
    emerald500: "#10b981",
    emerald400: "#34d399",
    emerald300: "#6ee7b7",
    emerald200: "#a7f3d0",
    emerald100: "#d1fae5",
    emerald50: "#ecfdf5",

    // Orange Colors (for warnings/accent)
    orange900: "#7c2d12",
    orange800: "#9a3412",
    orange700: "#c2410c",
    orange600: "#ea580c",
    orange500: "#f97316",
    orange400: "#fb923c",
    orange300: "#fdba74",
    orange200: "#fed7aa",
    orange100: "#ffedd5",
    orange50: "#fff7ed",

    // Gray Colors (for neutral elements)
    gray900: "#111827",
    gray800: "#1f2937",
    gray700: "#374151",
    gray600: "#4b5563",
    gray500: "#6b7280",
    gray400: "#9ca3af",
    gray300: "#d1d5db",
    gray200: "#e5e7eb",
    gray100: "#f3f4f6",
    gray50: "#f9fafb",

    // Green Colors (for status)
    green600: "#16a34a",
    green500: "#22c55e",
    green400: "#4ade80",
    green300: "#86efac",
    green200: "#bbf7d0",
    green100: "#dcfce7",
    green50: "#f0fdf4",

    // Modal Overlay
    modalOverlay: "rgba(0, 0, 0, 0.5)",

    // Shadows
    shadowSm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    shadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    shadowMd: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    shadowLg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    shadowXl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    loginCardShadow: "0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
    loginCardShadowHover: "0 20px 60px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.06)",
} as const;

// CSS Custom Properties for use in Tailwind classes
export const CSS_VARS = {
    "--login-card-shadow": COLORS.loginCardShadow,
    "--login-card-shadow-hover": COLORS.loginCardShadowHover,
} as const;
