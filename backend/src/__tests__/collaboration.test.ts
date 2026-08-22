import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  voteActivitySchema,
  createCommentSchema,
  getCommentsQuerySchema,
  suggestActivitySchema,
  tripActivityParamSchema,
  tripParamSchema,
} from '../validators/collaboration.validator.js';

describe('Collaboration Validator Schemas', () => {
  it('should validate voteActivitySchema with UPVOTE, DOWNVOTE, and normalize UP/DOWN', async () => {
    const res1 = await voteActivitySchema.parseAsync({ voteType: 'UPVOTE' });
    assert.strictEqual(res1.voteType, 'UPVOTE');

    const res2 = await voteActivitySchema.parseAsync({ voteType: 'DOWNVOTE' });
    assert.strictEqual(res2.voteType, 'DOWNVOTE');

    const res3 = await voteActivitySchema.parseAsync({ voteType: 'UP' });
    assert.strictEqual(res3.voteType, 'UPVOTE');

    const res4 = await voteActivitySchema.parseAsync({ voteType: 'DOWN' });
    assert.strictEqual(res4.voteType, 'DOWNVOTE');

    const resDefault = await voteActivitySchema.parseAsync({});
    assert.strictEqual(resDefault.voteType, 'UPVOTE');
  });

  it('should reject invalid voteType', async () => {
    await assert.rejects(async () => {
      await voteActivitySchema.parseAsync({ voteType: 'MAYBE' });
    });
  });

  it('should validate createCommentSchema with valid text and optional itineraryItemId', async () => {
    const res = await createCommentSchema.parseAsync({
      text: 'Shall we book the morning slot?',
      itineraryItemId: 'item-123',
    });
    assert.strictEqual(res.text, 'Shall we book the morning slot?');
    assert.strictEqual(res.itineraryItemId, 'item-123');
  });

  it('should reject empty comment text', async () => {
    await assert.rejects(async () => {
      await createCommentSchema.parseAsync({ text: '   ' });
    });
  });

  it('should validate getCommentsQuerySchema', async () => {
    const res = await getCommentsQuerySchema.parseAsync({ itineraryItemId: 'item-123' });
    assert.strictEqual(res.itineraryItemId, 'item-123');
  });

  it('should validate suggestActivitySchema', async () => {
    const res = await suggestActivitySchema.parseAsync({
      notes: 'Recommended by locals',
      dayNumber: 2,
      date: '2026-09-02',
    });
    assert.strictEqual(res.notes, 'Recommended by locals');
    assert.strictEqual(res.dayNumber, 2);
    assert.strictEqual(res.date, '2026-09-02');
  });

  it('should validate tripActivityParamSchema and tripParamSchema', async () => {
    const res1 = await tripActivityParamSchema.parseAsync({
      tripId: 'trip-1',
      activityId: 'act-1',
    });
    assert.strictEqual(res1.tripId, 'trip-1');
    assert.strictEqual(res1.activityId, 'act-1');

    const res2 = await tripParamSchema.parseAsync({ tripId: 'trip-1' });
    assert.strictEqual(res2.tripId, 'trip-1');
  });
});

describe('Vote Score Calculation Logic', () => {
  it('should accurately compute upvotes, downvotes, and net score', () => {
    const votes = [
      { voteType: 'UPVOTE' },
      { voteType: 'UPVOTE' },
      { voteType: 'DOWNVOTE' },
      { voteType: 'UPVOTE' },
    ];

    const upvotes = votes.filter((v) => v.voteType === 'UPVOTE').length;
    const downvotes = votes.filter((v) => v.voteType === 'DOWNVOTE').length;
    const score = upvotes - downvotes;

    assert.strictEqual(upvotes, 3);
    assert.strictEqual(downvotes, 1);
    assert.strictEqual(score, 2);
  });
});
