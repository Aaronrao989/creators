"use client";

import * as React from "react";
import { useAuth } from "@/store/auth";

/** Restores the session (calls /api/auth/me) once on app load. Renders nothing. */
export function AuthInit() {
  React.useEffect(() => {
    useAuth.getState().hydrate();
  }, []);
  return null;
}
