"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
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

    // State for form inputs
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

            // Success Logic
            // 1. Store Token
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
        <div
            className="min-h-screen w-full flex flex-col items-center justify-center p-4"
            style={{ backgroundColor: "#fcfcfc" }}
        >
            {/* Branding Header */}
            <div className="flex flex-col items-center mb-8 text-center space-y-2">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <div
                        className="h-12 w-12 rounded-lg flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: COLORS.primary }}
                    >
                        <span className="font-bold text-2xl text-white">B</span>
                    </div>
                    <h1 className="text-2xl font-bold text-black tracking-tight" style={{ color: '#000000' }}>
                        Business Smart Suite
                    </h1>
                </div>
                <p className="text-gray-600 text-sm font-medium">
                    ISO 9001 Compliance Management System
                </p>
            </div>

            {/* Login Card */}
            <div
                className="w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8"
                style={{ maxWidth: '450px' }}
            >
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-black mb-2" style={{ color: '#000000' }}>Login</h2>
                    <p className="text-gray-600 text-sm">
                        Enter your credentials to access the portal
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        {/* Username/Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-black font-semibold" style={{ color: '#000000' }}>
                                Username
                            </Label>
                            <Input
                                id="email"
                                placeholder="Enter your username"
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-11 bg-white border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary text-black placeholder:text-gray-400"
                                style={{ color: '#000000' }}
                                required
                            />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-black font-semibold" style={{ color: '#000000' }}>
                                Password
                            </Label>
                            <Input
                                id="password"
                                placeholder="Enter your password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-11 bg-white border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary text-black placeholder:text-gray-400"
                                style={{ color: '#000000' }}
                                required
                            />
                        </div>
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="remember"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            label="Remember me"
                            className="border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:text-white"
                        />
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full h-11 text-base font-bold shadow-md hover:shadow-lg transition-all mt-2"
                        disabled={isLoading}
                        style={{ backgroundColor: COLORS.primary, color: 'white' }}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Authenticating...
                            </>
                        ) : (
                            "Login"
                        )}
                    </Button>

                    {/* Footer Links */}
                    <div className="flex items-center justify-between pt-4 text-sm">
                        <Link
                            href="/forgot-password"
                            className="text-gray-600 hover:text-black transition-colors font-medium"
                        >
                            Forgot password?
                        </Link>
                        <Link
                            href="/support"
                            className="text-gray-600 hover:text-black transition-colors font-medium"
                        >
                            Contact support
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
