"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { APP, ROUTES } from "@/lib/constants";
import { COLORS } from "@/constant/colors";
import { cn } from "@/lib/utils";

// LoginBranding Component
function LoginBranding() {
    return (
        <div className="flex flex-col items-center gap-2 text-center opacity-0 animate-fade-in-up">
            <div className="flex items-center justify-center gap-4">
                <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-white shadow-lg transition-transform duration-300 hover:scale-105"
                    style={{
                        backgroundColor: COLORS.primary,
                        boxShadow: `0 10px 25px ${COLORS.primaryShadow}`,
                    }}
                    aria-hidden
                >
                    <span className="text-2xl font-bold tracking-tight">B</span>
                </div>
                <div className="text-left">
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: COLORS.textPrimary }}>
                        <span style={{ color: COLORS.primary }}>{APP.namePrimary}</span>{" "}
                        <span style={{ color: COLORS.textSecondary }}>{APP.nameSuffix}</span>
                    </h1>
                    <p className="mt-0.5 text-sm font-medium tracking-wide" style={{ color: COLORS.textMuted }}>
                        {APP.tagline}
                    </p>
                </div>
            </div>
        </div>
    );
}

// LoginCard Component
interface LoginCardProps {
    children: React.ReactNode;
    className?: string;
}

function LoginCard({ children, className }: LoginCardProps) {
    return (
        <div
            className={cn(
                "relative w-full max-w-md overflow-hidden rounded-2xl backdrop-blur-sm",
                "transition-all duration-300",
                "opacity-0 animate-fade-in-up",
                className
            )}
            style={{
                border: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.bgWhiteTransparent,
                padding: "2rem",
                boxShadow: COLORS.loginCardShadow,
                animationDelay: "0.1s",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = COLORS.loginCardShadowHover;
                e.currentTarget.style.borderColor = COLORS.borderHover;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = COLORS.loginCardShadow;
                e.currentTarget.style.borderColor = COLORS.border;
            }}
        >
            <div className="relative">{children}</div>
        </div>
    );
}

// LoginForm Component
function LoginForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        // TODO: wire to auth
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="pb-5" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: COLORS.textPrimary }}>
                    Login
                </h2>
                <p className="mt-1.5 text-sm" style={{ color: COLORS.textMuted }}>
                    Enter your credentials to access the portal
                </p>
            </div>

            <Input
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
            />

            <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
            />

            <Checkbox
                label="Remember me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
            />

            <Button type="submit" fullWidth>
                Login
            </Button>

            <div
                className="flex flex-wrap items-center justify-between gap-2 pt-4 text-sm"
                style={{ borderTop: `1px solid ${COLORS.border}` }}
            >
                <Link
                    href={ROUTES.forgotPassword}
                    className="font-medium transition-colors hover:underline"
                    style={{ color: COLORS.textSecondary }}
                    onMouseEnter={(e) => e.currentTarget.style.color = COLORS.primary}
                    onMouseLeave={(e) => e.currentTarget.style.color = COLORS.textSecondary}
                >
                    Forgot password?
                </Link>
                <Link
                    href={ROUTES.contactSupport}
                    className="font-medium transition-colors hover:underline"
                    style={{ color: COLORS.textSecondary }}
                    onMouseEnter={(e) => e.currentTarget.style.color = COLORS.primary}
                    onMouseLeave={(e) => e.currentTarget.style.color = COLORS.textSecondary}
                >
                    Contact support
                </Link>
            </div>
        </form>
    );
}

// Main Login Page Component (Default Export)
export default function LoginPage() {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
            <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-12">
                <LoginBranding />
                <LoginCard>
                    <LoginForm />
                </LoginCard>
            </div>
        </div>
    );
}
