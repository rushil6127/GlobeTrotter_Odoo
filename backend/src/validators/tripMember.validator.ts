import { z } from 'zod';

export const inviteMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email({ message: 'Valid email address is required' }),
  role: z.enum(['EDITOR', 'VIEWER'], {
    errorMap: () => ({ message: 'Role must be either EDITOR or VIEWER' }),
  }).default('VIEWER'),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['EDITOR', 'VIEWER'], {
    errorMap: () => ({ message: 'Role must be either EDITOR or VIEWER' }),
  }),
});

export const tripMemberParamSchema = z.object({
  tripId: z.string().trim().min(1, { message: 'Trip ID is required' }),
});

export const memberIdParamSchema = z.object({
  tripId: z.string().trim().min(1, { message: 'Trip ID is required' }),
  memberId: z.string().trim().min(1, { message: 'Member ID is required' }),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type TripMemberParamInput = z.infer<typeof tripMemberParamSchema>;
export type MemberIdParamInput = z.infer<typeof memberIdParamSchema>;
