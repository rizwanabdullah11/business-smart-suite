"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { APP, ROUTES } from "@/lib/constants";
import { COLORS } from "@/constant/colors";
import { cn } from "@/lib/utils";

// LoginBranding – logo + "Business Smart Suite" + "ISO 9001 Compliance Management System"
function LoginBranding() {
    return (
        <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center justify-center gap-4">
                <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-white"
                    style={{
                        backgroundColor: COLORS.primary,
                    }}
                    aria-hidden
                >
                    <span className="text-2xl font-bold tracking-tight">B</span>
                </div>
                <div className="text-left">
                    <h1
                        className="text-xl font-bold tracking-tight"
                        style={{ color: COLORS.primary }}
                    >
                        {APP.name}
                    </h1>
                    <p
                        className="mt-0.5 text-sm tracking-wide"
                        style={{ color: COLORS.textSecondary }}
                    >
                        {APP.tagline}
                    </p>
                </div>
            </div>
        </div>
    );
}

interface LoginCardProps {
    children: React.ReactNode;
    className?: string;
}

function LoginCard({ children, className }: LoginCardProps) {
    return (
        <div
            className={cn(
                "relative w-full max-w-md overflow-hidden rounded-2xl",
                "transition-shadow duration-300",
                className
            )}
            style={{
                backgroundColor: COLORS.bgWhite,
                boxShadow: COLORS.loginCardShadow,
                padding: "2rem",
            }}
        >
            <div className="relative">{children}</div>
        </div>
    );
}

function LoginForm() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            router.push(ROUTES.dashboard);
        }, 500);
    }

    const inputStyle = {
        backgroundColor: COLORS.bgGrayLight,
        border: `1px solid ${COLORS.border}`,
        borderRadius: "0.375rem",
        color: COLORS.textPrimary,
    };
    const placeholderStyle = { color: COLORS.textMuted };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div
                className="pb-5"
                style={{ borderBottom: `1px solid ${COLORS.border}` }}
            >
                <h2
                    className="text-xl font-bold tracking-tight"
                    style={{ color: COLORS.textPrimary }}
                >
                    Login
                </h2>
                <p
                    className="mt-1.5 text-sm"
                    style={{ color: COLORS.textMuted }}
                >
                    Enter your credentials to access the portal
                </p>
            </div>

            <div className="flex flex-col gap-2">
                <label
                    className="text-sm font-medium"
                    style={{ color: COLORS.textPrimary }}
                >
                    Username
                </label>
                <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    autoComplete="username"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    style={inputStyle}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label
                    className="text-sm font-medium"
                    style={{ color: COLORS.textPrimary }}
                >
                    Password
                </label>
                <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    style={inputStyle}
                />
            </div>

            <Checkbox
                label="Remember me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
            />

            <Button
                type="submit"
                fullWidth
                disabled={isLoading}
                className="w-full rounded-md py-2.5 text-sm font-semibold text-white"
                style={{
                    backgroundColor: COLORS.primary,
                    boxShadow: COLORS.shadowSm,
                }}
            >
                {isLoading ? "Logging in..." : "Login"}
            </Button>

            <div
                className="flex flex-wrap items-center justify-between gap-2 pt-4 text-sm"
                style={{ borderTop: `1px solid ${COLORS.border}` }}
            >
                <Link
                    href={ROUTES.forgotPassword}
                    className="font-medium transition-colors hover:underline"
                    style={{ color: COLORS.textSecondary }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = COLORS.primary;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = COLORS.textSecondary;
                    }}
                >
                    Forgot password?
                </Link>
                <Link
                    href={ROUTES.contactSupport}
                    className="font-medium transition-colors hover:underline"
                    style={{ color: COLORS.textSecondary }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = COLORS.primary;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = COLORS.textSecondary;
                    }}
                >
                    Contact support
                </Link>
            </div>
        </form>
    );
}

export default function LoginPage() {
    return (
        <div
            className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12"
            style={{ backgroundColor: COLORS.bgGray }}
        >
            <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-10">
                <LoginBranding />
                <LoginCard>
                    <LoginForm />
                </LoginCard>
            </div>
        </div>
    );
}
