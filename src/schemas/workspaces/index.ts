import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(50, "Nome muito longo"),
});

export const inviteToWorkspaceSchema = z.object({
  workspaceId: z.string().uuid("Workspace inválido"),
  email: z.string().email("Email inválido"),
});

export const respondToInviteSchema = z.object({
  inviteId: z.string().uuid("Convite inválido"),
  response: z.enum(["accepted", "declined"]),
});

export const switchWorkspaceSchema = z.object({
  workspaceId: z.string().uuid("Workspace inválido"),
});

export const renameWorkspaceSchema = z.object({
  workspaceId: z.string().uuid("Workspace inválido"),
  name: z.string().min(1, "Nome é obrigatório").max(50, "Nome muito longo"),
});

export const workspaceIdSchema = z.string().uuid("Workspace inválido");
export const userIdSchema = z.string().uuid("Usuário inválido");
