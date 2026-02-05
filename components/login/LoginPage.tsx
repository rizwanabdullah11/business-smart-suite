"use client";

import { LoginBranding } from "./LoginBranding";
import { LoginCard } from "./LoginCard";
import { LoginForm } from "./LoginForm";

export function LoginPage() {
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
