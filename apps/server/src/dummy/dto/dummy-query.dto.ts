import type { DummyModel } from '@/generated/prisma/client';

export type DummyScalarField = keyof Pick<
  DummyModel,
  'id' | 'name' | 'description' | 'createdAt' | 'updatedAt'
>;

export type DummySearchField = Extract<
  DummyScalarField,
  'name' | 'description'
>;
