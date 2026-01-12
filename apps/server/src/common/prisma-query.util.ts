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
  if (!limit || Number.isNaN(limit)) return DEFAULT_LIMIT;
  return Math.min(Math.max(limit, 1), MAX_LIMIT);
};



export const applySearch = <TWhere extends { AND?: any }, TField extends string>(
  where: TWhere,
  search: SearchInput<TField> | undefined,
  searchableFields: readonly TField[],
): TWhere => {
  if (!search?.term) return where;

  const fields = search.fields?.length ? search.fields : searchableFields;

  const currentAnd = where.AND;
  const andConditions: any[] = Array.isArray(currentAnd)
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

export const buildOrderBy = <TField extends string>(
  sort: SortInput<TField> | undefined,
  fallback: Record<string, SortDirection>,
) => {
  if (!sort) return fallback;
  const { field, direction = 'asc' } = sort;
  return { [field]: direction } as Record<string, SortDirection>;
};
