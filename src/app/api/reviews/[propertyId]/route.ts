import type { NextRequest } from "next/server";
import { reviewService } from "@/lib/services/review.service";
import { createReviewSchema } from "@/lib/validation/schemas";
import { handleError, json, parseJsonBody } from "@/lib/api/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/reviews/:propertyId — reviews + average rating for a property. */
export async function GET(
  _req: NextRequest,
  { params }: { params: { propertyId: string } },
) {
  try {
    return json(await reviewService.listForProperty(params.propertyId));
  } catch (err) {
    return handleError(err);
  }
}

/** POST /api/reviews/:propertyId — add a review. */
export async function POST(
  req: NextRequest,
  { params }: { params: { propertyId: string } },
) {
  try {
    const body = createReviewSchema.parse(await parseJsonBody(req));
    const review = await reviewService.create(params.propertyId, body);
    return json(review, 201);
  } catch (err) {
    return handleError(err);
  }
}
