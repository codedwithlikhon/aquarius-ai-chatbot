import assert from 'node:assert/strict';
import test from 'node:test';

import { getDocumentTimestampByIndex } from '@/lib/utils';
import type { Document } from '@/lib/db/schema';

const createDocument = (overrides: Partial<Document> = {}): Document => ({
  id: overrides.id ?? 'document-id',
  createdAt: overrides.createdAt ?? new Date('2024-01-01T00:00:00.000Z'),
  title: overrides.title ?? 'Example document',
  content: overrides.content ?? 'Example content',
  kind: overrides.kind ?? 'text',
  userId: overrides.userId ?? 'user-id',
});

test('returns the document timestamp when the index is in range', () => {
  const firstTimestamp = new Date('2024-01-01T00:00:00.000Z');
  const secondTimestamp = new Date('2024-02-01T00:00:00.000Z');
  const documents: Document[] = [
    createDocument({ id: 'doc-1', createdAt: firstTimestamp }),
    createDocument({ id: 'doc-2', createdAt: secondTimestamp }),
  ];

  const result = getDocumentTimestampByIndex(documents, 1);

  assert.strictEqual(result, secondTimestamp);
});

test('returns a fallback timestamp when the index is out of range', () => {
  const documents: Document[] = [
    createDocument({ id: 'doc-1', createdAt: new Date('2024-01-01T00:00:00.000Z') }),
  ];

  const before = Date.now();
  const result = getDocumentTimestampByIndex(documents, -1);
  const after = Date.now();

  assert.ok(result.getTime() >= before && result.getTime() <= after);
});

