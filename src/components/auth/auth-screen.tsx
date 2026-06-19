"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Heart, Lock, Mail, User2 } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/auth";
import { cn } from "@/lib/utils";

export function AuthScreen({ initialMode }: { initialMode: "login" | "signup" }) {
  const router = useRouter();
  const [mode, setMode] = React.useState<"login" | "signup">(initialMode);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [show, setShow] = React.useState(false);

  const login = useAuth((s) => s.login);
  const signup = useAuth((s) => s.signup);
  const googleSignin = useAuth((s) => s.googleSignin);
  const error = useAuth((s) => s.error);
  const setError = useAuth((s) => s.setError);

  const redirectAfterAuth = () => {
    const redirect =
      new URLSearchParams(window.location.search).get("redirect") || "/shortlist";
    router.push(redirect);
  };

  React.useEffect(() => setError(null), [mode, setError]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok =
      mode === "login" ? login(email, password) : signup(name, email, password);
    if (ok) redirectAfterAuth();
  };

  const onGoogle = () => {
    if (googleSignin()) redirectAfterAuth();
  };

  const isLogin = mode === "login";

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-grid px-4 py-12">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-accent/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-96 w-96 rounded-full bg-primary/20 blur-[130px] dark:bg-accent/15" />

      <div className="relative w-full max-w-md">
        <div className="glass rounded-3xl p-8 shadow-lift">
          <div className="mb-6 flex flex-col items-center text-center">
            <span className="text-primary dark:text-foreground">
              <Logo />
            </span>
            <h1 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-primary dark:text-foreground">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {isLogin
                ? "Log in to access your saved properties."
                : "Sign up to save shortlists and compare faster."}
            </p>
          </div>

          {/* mode toggle */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-lg py-2 text-sm font-semibold transition-colors",
                  mode === m
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={onGoogle}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-card py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <GoogleIcon className="h-[18px] w-[18px]" />
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">
              or {isLogin ? "log in" : "sign up"} with email
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            {!isLogin && (
              <Field icon={User2} label="Full name">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aman Sharma"
                  autoComplete="name"
                  className="auth-input"
                />
              </Field>
            )}
            <Field icon={Mail} label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="auth-input"
              />
            </Field>
            <Field icon={Lock} label="Password">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="auth-input pr-10"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </Field>

            {error && (
              <p className="rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
                {error}
              </p>
            )}

            <Button type="submit" variant="accent" size="lg" className="w-full">
              <Heart className="h-4 w-4" />
              {isLogin ? "Log in" : "Create account"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {isLogin ? "New to Creators Home? " : "Already have an account? "}
            <button
              onClick={() => setMode(isLogin ? "signup" : "login")}
              className="font-semibold text-accent hover:underline"
            >
              {isLogin ? "Create an account" : "Log in"}
            </button>
          </p>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Demo build · accounts are stored locally in your browser, not on a server.{" "}
          <Link href="/" className="underline-offset-2 hover:underline">
            Back home
          </Link>
        </p>
      </div>

      <style jsx global>{`
        .auth-input {
          height: 2.75rem;
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid hsl(var(--border));
          background: hsl(var(--background));
          padding-left: 2.5rem;
          padding-right: 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .auth-input:focus {
          box-shadow: 0 0 0 2px hsl(var(--accent) / 0.4);
        }
      `}</style>
    </section>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
        {label}
      </span>
      <span className="relative block">
        <Icon className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        {children}
      </span>
    </label>
  );
}
