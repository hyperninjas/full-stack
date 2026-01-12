import type { DummyModel } from '@/generated/client';

export type DummyScalarField = keyof Pick<
  DummyModel,
  'id' | 'name' | 'description' | 'createdAt' | 'updatedAt'
>;

export type DummySearchField = Extract<
  DummyScalarField,
  'name' | 'description'
>;
