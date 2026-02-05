"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { ROUTES } from "@/lib/constants";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: wire to auth
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="border-b border-[#e9ecef] pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-[#1a1d21]">Login</h2>
        <p className="mt-1.5 text-sm text-[#6c757d]">
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

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e9ecef] pt-4 text-sm">
        <Link
          href={ROUTES.forgotPassword}
          className="font-medium text-[#495057] transition-colors hover:text-[#c92a2a] hover:underline"
        >
          Forgot password?
        </Link>
        <Link
          href={ROUTES.contactSupport}
          className="font-medium text-[#495057] transition-colors hover:text-[#c92a2a] hover:underline"
        >
          Contact support
        </Link>
      </div>
    </form>
  );
}
