import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/auth-screen";

export const metadata: Metadata = {
  title: "Log in · Creators Home",
};

export default function LoginPage() {
  return <AuthScreen initialMode="login" />;
}
