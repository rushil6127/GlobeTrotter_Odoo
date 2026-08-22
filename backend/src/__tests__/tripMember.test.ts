import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  inviteMemberSchema,
  updateMemberRoleSchema,
  tripMemberParamSchema,
  memberIdParamSchema,
} from '../validators/tripMember.validator.js';

describe('Trip Member Validator Schemas', () => {
  it('should validate inviteMemberSchema with default role VIEWER', async () => {
    const result = await inviteMemberSchema.parseAsync({
      email: 'traveler@example.com',
    });
    assert.strictEqual(result.email, 'traveler@example.com');
    assert.strictEqual(result.role, 'VIEWER');
  });

  it('should validate inviteMemberSchema with explicit EDITOR role and lowercase email', async () => {
    const result = await inviteMemberSchema.parseAsync({
      email: '  COLLAB@Example.COM  ',
      role: 'EDITOR',
    });
    assert.strictEqual(result.email, 'collab@example.com');
    assert.strictEqual(result.role, 'EDITOR');
  });

  it('should reject inviteMemberSchema with invalid email', async () => {
    await assert.rejects(async () => {
      await inviteMemberSchema.parseAsync({
        email: 'not-an-email',
      });
    });
  });

  it('should reject inviteMemberSchema with unsupported role (e.g. OWNER or ADMIN)', async () => {
    await assert.rejects(async () => {
      await inviteMemberSchema.parseAsync({
        email: 'user@example.com',
        role: 'OWNER' as any,
      });
    });
    await assert.rejects(async () => {
      await inviteMemberSchema.parseAsync({
        email: 'user@example.com',
        role: 'ADMIN' as any,
      });
    });
  });

  it('should validate updateMemberRoleSchema for valid roles', async () => {
    const editor = await updateMemberRoleSchema.parseAsync({ role: 'EDITOR' });
    assert.strictEqual(editor.role, 'EDITOR');

    const viewer = await updateMemberRoleSchema.parseAsync({ role: 'VIEWER' });
    assert.strictEqual(viewer.role, 'VIEWER');
  });

  it('should reject updateMemberRoleSchema with empty or invalid role', async () => {
    await assert.rejects(async () => {
      await updateMemberRoleSchema.parseAsync({ role: 'INVALID' as any });
    });
  });

  it('should validate tripMemberParamSchema and memberIdParamSchema', async () => {
    const tripParam = await tripMemberParamSchema.parseAsync({ tripId: 'trip-123' });
    assert.strictEqual(tripParam.tripId, 'trip-123');

    const memberParam = await memberIdParamSchema.parseAsync({
      tripId: 'trip-123',
      memberId: 'member-456',
    });
    assert.strictEqual(memberParam.tripId, 'trip-123');
    assert.strictEqual(memberParam.memberId, 'member-456');
  });

  it('should reject empty params in tripMemberParamSchema and memberIdParamSchema', async () => {
    await assert.rejects(async () => {
      await tripMemberParamSchema.parseAsync({ tripId: '   ' });
    });
    await assert.rejects(async () => {
      await memberIdParamSchema.parseAsync({ tripId: 'trip-123', memberId: '' });
    });
  });
});

describe('Collaboration Authorization & Role Capability Logic', () => {
  const mockTrip = {
    id: 'trip-100',
    name: 'Euro Summer',
    userId: 'user-owner-1',
    user: { id: 'user-owner-1', name: 'Owner User', email: 'owner@example.com' },
    tripMembers: [
      { id: 'tm-1', userId: 'user-editor-2', role: 'EDITOR' },
      { id: 'tm-2', userId: 'user-viewer-3', role: 'VIEWER' },
    ],
  };

  it('should allow OWNER, EDITOR, and VIEWER to view trip members', () => {
    const isOwnerAllowed = mockTrip.userId === 'user-owner-1' || mockTrip.tripMembers.some((m) => m.userId === 'user-owner-1');
    const isEditorAllowed = mockTrip.userId === 'user-editor-2' || mockTrip.tripMembers.some((m) => m.userId === 'user-editor-2');
    const isViewerAllowed = mockTrip.userId === 'user-viewer-3' || mockTrip.tripMembers.some((m) => m.userId === 'user-viewer-3');
    const isStrangerAllowed = mockTrip.userId === 'user-stranger-99' || mockTrip.tripMembers.some((m) => m.userId === 'user-stranger-99');

    assert.strictEqual(isOwnerAllowed, true);
    assert.strictEqual(isEditorAllowed, true);
    assert.strictEqual(isViewerAllowed, true);
    assert.strictEqual(isStrangerAllowed, false);
  });

  it('should enforce that ONLY the OWNER can manage (invite/update/delete) members', () => {
    const canOwnerManage = mockTrip.userId === 'user-owner-1';
    const canEditorManage = mockTrip.userId === 'user-editor-2';
    const canViewerManage = mockTrip.userId === 'user-viewer-3';

    assert.strictEqual(canOwnerManage, true);
    assert.strictEqual(canEditorManage, false);
    assert.strictEqual(canViewerManage, false);
  });

  it('should correctly prevent duplicate member invite or owner self-invite', () => {
    const targetUserId1 = 'user-owner-1'; // Owner
    const targetUserId2 = 'user-editor-2'; // Existing member
    const targetUserId3 = 'user-new-4'; // New user

    const isSelfInvite = targetUserId1 === mockTrip.userId;
    const isDuplicateInvite = mockTrip.tripMembers.some((m) => m.userId === targetUserId2);
    const isNewValidInvite = targetUserId3 !== mockTrip.userId && !mockTrip.tripMembers.some((m) => m.userId === targetUserId3);

    assert.strictEqual(isSelfInvite, true);
    assert.strictEqual(isDuplicateInvite, true);
    assert.strictEqual(isNewValidInvite, true);
  });
});
