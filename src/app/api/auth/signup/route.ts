import type { NextRequest } from "next/server";
import { authService } from "@/lib/services/auth.service";
import { setSessionCookie } from "@/lib/auth/session";
import { handleError, json, parseJsonBody } from "@/lib/api/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/auth/signup — { name, email, password } → creates account + session. */
export async function POST(req: NextRequest) {
  try {
    const body = (await parseJsonBody(req)) as {
      name?: string;
      email?: string;
      password?: string;
    };
    const user = await authService.signup(
      body.name ?? "",
      body.email ?? "",
      body.password ?? "",
    );
    setSessionCookie(user.id);
    return json(user, 201);
  } catch (err) {
    return handleError(err);
  }
}
