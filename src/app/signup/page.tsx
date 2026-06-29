import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/auth-screen";

export const metadata: Metadata = {
  title: "Sign up · Creators Arena",
};

export default function SignupPage() {
  return <AuthScreen initialMode="signup" />;
}
