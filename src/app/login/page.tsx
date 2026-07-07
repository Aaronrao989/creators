import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/auth-screen";

export const metadata: Metadata = {
  title: "Log in · Creators Arena",
};

export default function LoginPage() {
  return <AuthScreen initialMode="login" />;
}
