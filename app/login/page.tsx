"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    Loader2,
    ShieldCheck,
    BarChart3,
    FileText,
    Eye,
    EyeOff,
    Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { COLORS } from "@/constant/colors"

// API Config
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export default function LoginPage() {
    const router = useRouter()
    const { toast } = useToast()

    // State for form inputs
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
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            // Success Logic
            if (data.token) {
                localStorage.setItem("token", data.token);
                if (data.user) {
                    localStorage.setItem("user", JSON.stringify(data.user));
                }
                document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Strict`;
            }

            toast({
                title: "Welcome back!",
                description: "Successfully logged in.",
                variant: "default",
            });

            router.push("/dashboard");

        } catch (error: any) {
            toast({
                title: "Login Failed",
                description: error.message || "Please check your credentials",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen w-full">
            {/* Left Panel - Branding & Features */}
            <div
                className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${COLORS.indigo600} 0%, ${COLORS.purple600} 50%, ${COLORS.pink600} 100%)`
                }}
            >
                {/* Background Pattern Overlay */}
                <div className="absolute inset-0 bg-black opacity-10 pattern-grid-lg"></div>

                {/* Header Branding */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <span className="font-bold text-xl text-white">B</span>
                    </div>
                    <span className="text-2xl font-bold text-white tracking-tight">Business Smart</span>
                </div>

                {/* Main Content */}
                <div className="relative z-10 w-full max-w-lg">
                    <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                        Welcome to <br /> Business Smart
                    </h1>
                    <p className="text-lg text-white/80 mb-12 leading-relaxed">
                        Your complete solution for ISO 9001 compliance, risk management, and operational excellence.
                    </p>

                    {/* Feature Cards */}
                    <div className="space-y-4">
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-start gap-4 transition-transform hover:-translate-y-1 duration-300">
                            <div className="p-3 bg-white/20 rounded-lg">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">Compliance Management</h3>
                                <p className="text-white/70 text-sm">Streamline your ISO documentation and audits effortlessly.</p>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-start gap-4 transition-transform hover:-translate-y-1 duration-300">
                            <div className="p-3 bg-white/20 rounded-lg">
                                <ShieldCheck className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">Secure & Reliable</h3>
                                <p className="text-white/70 text-sm">Enterprise-grade security for your sensitive business data.</p>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-start gap-4 transition-transform hover:-translate-y-1 duration-300">
                            <div className="p-3 bg-white/20 rounded-lg">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">Real-time Analytics</h3>
                                <p className="text-white/70 text-sm">Make data-driven decisions with live insights and reports.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Stats */}
                <div className="relative z-10 flex items-center gap-12 pt-8 border-t border-white/20">
                    <div>
                        <h4 className="text-3xl font-bold text-white">100%</h4>
                        <p className="text-white/60 text-sm font-medium uppercase tracking-wider">Compliance</p>
                    </div>
                    <div>
                        <h4 className="text-3xl font-bold text-white">24/7</h4>
                        <p className="text-white/60 text-sm font-medium uppercase tracking-wider">Support</p>
                    </div>
                    <div>
                        <h4 className="text-3xl font-bold text-white">99%</h4>
                        <p className="text-white/60 text-sm font-medium uppercase tracking-wider">Uptime</p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-[440px] space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="text-center space-y-2">
                        <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                            <span className="text-2xl">✨</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
                        <p className="text-gray-500">Sign in to access your admin dashboard</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <Label htmlFor="email" className="font-bold text-gray-900">Email Address <span className="text-red-500">*</span></Label>
                                <Input
                                    id="email"
                                    placeholder="mail@example.com"
                                    className="h-12 bg-white border-gray-200 focus:border-indigo-500 focus:ring-indigo-100 transition-all placeholder:text-gray-400 rounded-lg text-black"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-4">
                                <Label htmlFor="password" className="font-bold text-gray-900">Password <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        className="h-12 bg-white border-gray-200 focus:border-indigo-500 focus:ring-indigo-100 transition-all pr-10 placeholder:text-gray-400 rounded-lg text-black"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remember"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <Label htmlFor="remember" className="text-sm font-medium text-gray-600 cursor-pointer">Remember me</Label>
                            </div>
                            <Link href="/forgot-password" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-bold shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all duration-300"
                            style={{
                                background: `linear-gradient(to right, ${COLORS.indigo600}, ${COLORS.purple600})`
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>

                    <div className="pt-6 border-t border-gray-100 text-center space-y-4">
                        <p className="text-xs text-gray-400">
                            © 2026 Business Smart Suite. All rights reserved.
                        </p>
                        <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Secure Login</span>
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 24/7 Support</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
