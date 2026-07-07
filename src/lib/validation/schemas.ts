import { z } from "zod";

/** Query params for listing properties (all optional). */
export const propertyFiltersSchema = z.object({
  query: z.string().trim().min(1).optional(),
  city: z.string().optional(),
  kind: z.string().optional(),
  builder: z.string().optional(),
  possession: z.string().optional(),
  maxPriceLakh: z.coerce.number().positive().optional(),
});
export type PropertyFiltersInput = z.infer<typeof propertyFiltersSchema>;

/** Property ids are stored as UUIDs but treated as opaque strings by the API. */
const idList = z
  .array(z.string().min(1))
  .min(2, "Select at least 2 properties to compare")
  .max(4, "You can compare up to 4 properties");

export const compareSchema = z.object({ ids: idList });

export const createReviewSchema = z.object({
  authorName: z.string().trim().min(1).max(120),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(2000),
  userId: z.string().uuid().optional(),
});
export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const createSavedComparisonSchema = z.object({
  userId: z.string().uuid(),
  propertyIds: idList,
  name: z.string().trim().max(120).optional(),
});
export type CreateSavedComparisonInput = z.infer<
  typeof createSavedComparisonSchema
>;

export const deleteSavedComparisonSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
});
