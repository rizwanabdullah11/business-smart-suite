"use client"

import { useState } from "react"
import Link from "next/link"
import {
    Loader2,
    ShieldCheck,
    BarChart3,
    FileText,
    Eye,
    EyeOff,
    Users,
    CheckCircle2,
    ArrowRight,
    Lock,
    Mail,
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Checkbox } from "@/components/ui/Checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

const API_URL = "/api"

const features = [
    {
        icon: FileText,
        title: "Compliance Management",
        desc: "Streamline ISO documentation and audits effortlessly.",
    },
    {
        icon: ShieldCheck,
        title: "Enterprise Security",
        desc: "Bank-grade protection for your sensitive business data.",
    },
    {
        icon: BarChart3,
        title: "Real-time Analytics",
        desc: "Make data-driven decisions with live insights and reports.",
    },
]

const stats = [
    { value: "500+", label: "Companies" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Support" },
]

export default function LoginPage() {
    const { toast } = useToast()
    const { refreshUser } = useAuth()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email: email.trim(), password }),
            })

            const data = await response.json()

            if (!response.ok) throw new Error(data.message || "Login failed")

            if (data.token) {
                localStorage.removeItem("token")
                localStorage.removeItem("user")
                localStorage.setItem("token", data.token)
                if (data.user) localStorage.setItem("user", JSON.stringify(data.user))

                window.dispatchEvent(new Event("auth-change"))
                await refreshUser()

                toast({
                    title: "Welcome back!",
                    description: "Successfully logged in.",
                    variant: "default",
                })

                window.location.assign("/dashboard")
            }
        } catch (error: any) {
            toast({
                title: "Login Failed",
                description: error.message || "Please check your credentials",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen w-full">

            {/* ── LEFT PANEL ── */}
            <div
                className="hidden lg:flex w-[52%] flex-col justify-between p-12 relative overflow-hidden"
                style={{ background: "linear-gradient(145deg, #1a0533 0%, #2d0f4e 40%, #341746 100%)" }}
            >
                {/* Decorative orbs */}
                <div
                    className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none"
                    style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }}
                />
                <div
                    className="absolute -bottom-40 -right-24 w-[420px] h-[420px] rounded-full opacity-15 blur-3xl pointer-events-none"
                    style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }}
                />
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl pointer-events-none"
                    style={{ background: "radial-gradient(circle, #e879f9 0%, transparent 70%)" }}
                />

                {/* Subtle dot grid */}
                <svg
                    className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1.5" fill="white" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dots)" />
                </svg>

                {/* Brand */}
                <div className="relative z-10 flex items-center gap-3">
                    <div
                        className="h-11 w-11 rounded-xl flex items-center justify-center shadow-lg"
                        style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
                    >
                        <span className="font-black text-xl text-white">B</span>
                    </div>
                    <div>
                        <span className="text-xl font-bold text-white tracking-tight leading-none block">
                            Business Smart
                        </span>
                        <span className="text-[11px] font-medium tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.45)" }}>
                            Suite
                        </span>
                    </div>
                </div>

                {/* Hero text */}
                <div className="relative z-10 w-full max-w-lg">
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-8"
                        style={{ background: "rgba(168,85,247,0.2)", color: "#d8b4fe", border: "1px solid rgba(168,85,247,0.3)" }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse inline-block" />
                        ISO 9001 Compliance Platform
                    </div>

                    <h1 className="text-5xl font-black text-white mb-5 leading-[1.1] tracking-tight">
                        Manage Your <br />
                        <span
                            className="bg-clip-text text-transparent"
                            style={{ backgroundImage: "linear-gradient(90deg, #c084fc 0%, #e879f9 100%)" }}
                        >
                            Business Excellence
                        </span>
                    </h1>
                    <p className="text-base leading-relaxed mb-10" style={{ color: "rgba(255,255,255,0.6)" }}>
                        The all-in-one platform for compliance management, risk tracking, audits, and operational intelligence.
                    </p>

                    {/* Feature cards */}
                    <div className="space-y-3">
                        {features.map(({ icon: Icon, title, desc }) => (
                            <div
                                key={title}
                                className="flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
                                style={{
                                    background: "rgba(255,255,255,0.05)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    backdropFilter: "blur(8px)",
                                }}
                            >
                                <div
                                    className="p-2.5 rounded-xl shrink-0"
                                    style={{ background: "rgba(168,85,247,0.25)" }}
                                >
                                    <Icon className="w-5 h-5" style={{ color: "#d8b4fe" }} />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold text-sm leading-tight">{title}</h3>
                                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{desc}</p>
                                </div>
                                <CheckCircle2 className="w-4 h-4 shrink-0 ml-auto mt-0.5" style={{ color: "#a855f7" }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats row */}
                <div className="relative z-10 flex items-center gap-0 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    {stats.map((s, i) => (
                        <div key={s.label} className="flex-1 text-center relative">
                            {i > 0 && (
                                <div
                                    className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-px"
                                    style={{ background: "rgba(255,255,255,0.12)" }}
                                />
                            )}
                            <div className="text-3xl font-black text-white">{s.value}</div>
                            <div className="text-[11px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div
                className="flex-1 flex items-center justify-center p-8 relative"
                style={{ background: "#f8f7fc" }}
            >
                {/* Subtle background orb */}
                <div
                    className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
                    style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }}
                />

                <div className="relative z-10 w-full max-w-[420px]">

                    {/* Mobile brand header */}
                    <div className="flex lg:hidden items-center justify-center gap-2 mb-10">
                        <div
                            className="h-9 w-9 rounded-xl flex items-center justify-center shadow"
                            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
                        >
                            <span className="font-black text-white text-base">B</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">Business Smart Suite</span>
                    </div>

                    {/* Card */}
                    <div
                        className="rounded-3xl p-8 shadow-xl"
                        style={{
                            background: "#ffffff",
                            boxShadow: "0 20px 60px rgba(124,58,237,0.08), 0 4px 20px rgba(0,0,0,0.06)"
                        }}
                    >
                        {/* Icon + heading */}
                        <div className="text-center mb-8">
                            <div
                                className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md"
                                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
                            >
                                <Lock className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Welcome back</h2>
                            <p className="text-sm text-gray-500 mt-1">Sign in to your Business Smart account</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            {/* Email */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5" style={{ color: "#7c3aed" }} />
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-purple-400 focus:ring-purple-100 placeholder:text-gray-400 text-gray-900 transition-all text-sm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5" style={{ color: "#7c3aed" }} />
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-purple-400 focus:ring-purple-100 placeholder:text-gray-400 text-gray-900 transition-all pr-12 text-sm"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                    >
                                        {showPassword
                                            ? <EyeOff className="w-4.5 h-4.5" />
                                            : <Eye className="w-4.5 h-4.5" />
                                        }
                                    </button>
                                </div>
                            </div>

                            {/* Remember me + Forgot */}
                            <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="remember"
                                        checked={rememberMe}
                                        onCheckedChange={(checked) => setRememberMe(!!checked)}
                                        className="border-gray-300"
                                    />
                                    <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer select-none">
                                        Remember me
                                    </Label>
                                </div>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm font-semibold hover:underline transition-colors"
                                    style={{ color: "#7c3aed" }}
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="w-full h-12 text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-purple-300 mt-2"
                                style={{
                                    background: isLoading
                                        ? "#9ca3af"
                                        : "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                                    color: "#fff",
                                }}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Trust badges */}
                        <div className="mt-6 pt-5" style={{ borderTop: "1px solid #f3f4f6" }}>
                            <div className="flex items-center justify-center gap-5 text-xs text-gray-400">
                                <span className="flex items-center gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5" style={{ color: "#a855f7" }} />
                                    SSL Secured
                                </span>
                                <span className="w-px h-3 bg-gray-200" />
                                <span className="flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5" style={{ color: "#a855f7" }} />
                                    256-bit Encryption
                                </span>
                                <span className="w-px h-3 bg-gray-200" />
                                <span className="flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5" style={{ color: "#a855f7" }} />
                                    24/7 Support
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer note */}
                    <p className="text-center text-xs text-gray-400 mt-6">
                        © {new Date().getFullYear()} Business Smart Suite. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    )
}
