import { propertyRepository } from "@/lib/repositories/property.repository";
import { NotFoundError } from "@/lib/errors";
import type { PropertyFilters } from "@/lib/data-source";
import type { Property } from "@/lib/types";

/**
 * Property business logic. Routes/components call the service; the service calls
 * the repository. No Prisma usage here, no business logic in routes.
 */
export const propertyService = {
  list(filters?: PropertyFilters): Promise<Property[]> {
    return propertyRepository.findMany(filters);
  },

  getByIds(ids: string[]): Promise<Property[]> {
    return propertyRepository.findByIds(ids);
  },

  async getByIdOrThrow(id: string): Promise<Property> {
    const property = await propertyRepository.findById(id);
    if (!property) throw new NotFoundError(`Property ${id} not found`);
    return property;
  },

  getById(id: string): Promise<Property | null> {
    return propertyRepository.findById(id);
  },

  getSimilar(excludeIds: string[], take = 3): Promise<Property[]> {
    return propertyRepository.findExcluding(excludeIds, take);
  },

  builderNames(): Promise<string[]> {
    return propertyRepository.distinctBuilderNames();
  },
};
