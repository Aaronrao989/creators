import type { NextRequest } from "next/server";
import { savedComparisonService } from "@/lib/services/saved-comparison.service";
import {
  createSavedComparisonSchema,
  deleteSavedComparisonSchema,
} from "@/lib/validation/schemas";
import { UnauthorizedError } from "@/lib/errors";
import { handleError, json } from "@/lib/api/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/saved-comparisons?userId=<uuid> — a user's saved comparisons. */
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) throw new UnauthorizedError("userId is required");
    return json(await savedComparisonService.listForUser(userId));
  } catch (err) {
    return handleError(err);
  }
}

/** POST /api/saved-comparisons — { userId, propertyIds[], name? }. */
export async function POST(req: NextRequest) {
  try {
    const { userId, propertyIds, name } = createSavedComparisonSchema.parse(
      await req.json(),
    );
    const saved = await savedComparisonService.create(userId, propertyIds, name);
    return json(saved, 201);
  } catch (err) {
    return handleError(err);
  }
}

/** DELETE /api/saved-comparisons — { id, userId } (owner-scoped). */
export async function DELETE(req: NextRequest) {
  try {
    const { id, userId } = deleteSavedComparisonSchema.parse(await req.json());
    await savedComparisonService.delete(id, userId);
    return json({ id, deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
