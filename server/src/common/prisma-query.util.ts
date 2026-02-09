export type SortDirection = 'asc' | 'desc';

export type SortInput<TField extends string> = {
  field: TField;
  direction?: SortDirection;
};

export type SearchInput<TField extends string> = {
  term: string;
  fields?: readonly TField[];
};

export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export const clampLimit = (limit?: number) => {
  if (limit === undefined || limit === null || Number.isNaN(limit))
    return DEFAULT_LIMIT;
  return Math.min(Math.max(limit, 1), MAX_LIMIT);
};

/**
 * Type representing a Prisma where condition that supports AND/OR.
 * Using 'unknown' is safe here as it requires type guards before usage, unlike 'any'.
 */
export type GenericPrismaWhere = {
  AND?: GenericPrismaWhere | GenericPrismaWhere[];
  OR?: GenericPrismaWhere[];
  NOT?: GenericPrismaWhere | GenericPrismaWhere[];
  [key: string]: unknown;
};

/**
 * Applies search conditions to a Prisma where object.
 */
export const applySearch = <
  TWhere extends GenericPrismaWhere,
  TField extends string,
>(
  where: TWhere,
  search: SearchInput<TField> | undefined,
  searchableFields: readonly TField[],
): TWhere => {
  if (!search?.term) return where;

  const fields = search.fields?.length ? search.fields : searchableFields;

  const currentAnd = where.AND;
  const andConditions: GenericPrismaWhere[] = Array.isArray(currentAnd)
    ? [...currentAnd]
    : currentAnd
      ? [currentAnd]
      : [];

  andConditions.push({
    OR: fields.map((field) => ({
      [field]: { contains: search.term, mode: 'insensitive' },
    })),
  });

  return { ...where, AND: andConditions };
};

/**
 * Builds a Prisma orderBy object from a SortInput.
 * Returns Partial<TOrderBy> to be safer, or compatible object.
 */
export const buildOrderBy = <
  TField extends string,
  TOrderBy extends Record<string, unknown>,
>(
  sort: SortInput<TField> | undefined,
  fallback: TOrderBy,
): TOrderBy => {
  if (!sort) return fallback;
  const { field, direction = 'asc' } = sort;
  // We use a safe assertion here because we know the structure fits the Prisma requirement
  // even if TypeScript cannot infer usage of the generic TOrderBy perfectly for the specific field key.
  return { [field]: direction } as unknown as TOrderBy;
};
