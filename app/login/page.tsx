"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { COLORS } from "@/constant/colors";

// API Config
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

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

            if (data.token) {
                localStorage.setItem("token", data.token);
                // Also store user info if needed
                if (data.user) {
                    localStorage.setItem("user", JSON.stringify(data.user));
                }

                // simple cookie setting for middleware compatibility if needed
                document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Strict`;
            }

            toast({
                title: "Welcome back!",
                description: "Successfully logged in.",
                variant: "default",
            });

            // 2. Redirect
            router.push("/dashboard");

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full flex">
            {/* Left Side - Visuals (Complex Design) */}
            <div
                className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 text-white"
                style={{
                    background: `linear-gradient(135deg, ${COLORS.primary} 0%, #1e3a8a 100%)`
                }}
            >
                <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-20" />

                {/* Branding */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                            <span className="font-bold text-xl">B</span>
                        </div>
                        <span className="text-2xl font-bold tracking-tight">Business Smart Suite</span>
                    </div>
                </div>

                {/* Testimonial / Copy */}
                <div className="relative z-10 space-y-6 max-w-lg">
                    <blockquote className="text-lg font-medium leading-relaxed">
                        "This platform has completely transformed how we manage our ISO compliance and operational workflows. It's robust, intuitive, and secure."
                    </blockquote>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-semibold">Enterprise Ready</p>
                            <p className="text-sm text-white/70">ISO 9001 Compliant Security</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-sm text-white/50">
                    © 2024 Business Smart Suite. All rights reserved.
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50/50">
                <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">

                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Sign in to your account</h2>
                        <p className="text-gray-500">
                            Enter your email below to access your dashboard
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-3 text-gray-400">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <Input
                                        id="email"
                                        placeholder="name@example.com"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm font-medium hover:underline text-primary"
                                        style={{ color: COLORS.primary }}
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <div className="absolute left-3 top-3 text-gray-400">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <Input
                                        id="password"
                                        placeholder="••••••••"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                label="Remember me for 30 days"
                                className="border-gray-300"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 text-base shadow-lg hover:shadow-xl transition-all"
                            disabled={isLoading}
                            style={{ backgroundColor: COLORS.primary, color: 'white' }}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button className="w-full h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700">
                            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="github" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><path fill="currentColor" d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 2.8 5.1 2.5.4 5.4-1.1 5.9-2.5 1.5-2.2-1.1-5.1-4.3-5.4-3.7-.5-5.3 1-4.4 2.8zm-13.2-31c-3.3-3.3-8.5.7-9.4 4.8-.8 3.3 1.2 5.3 4.7 5.4 4.2.2 9.5-2.4 9.1-5.9-.6-3.2-2.1-4.7-4.4-4.3z"></path></svg>
                            GitHub
                        </Button>
                        <Button className="w-full h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700">
                            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                            Google
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
