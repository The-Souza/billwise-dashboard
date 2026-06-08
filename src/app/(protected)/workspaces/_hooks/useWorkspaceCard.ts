"use client";

import { deleteWorkspaceAction } from "@/actions/(user)/workspaces/delete-workspace";
import { getWorkspaceMembersAction, MemberSummary } from "@/actions/(user)/workspaces/get-workspace-members";
import { inviteToWorkspaceAction } from "@/actions/(user)/workspaces/invite-to-workspace";
import { leaveWorkspaceAction } from "@/actions/(user)/workspaces/leave-workspace";
import { removeMemberAction } from "@/actions/(user)/workspaces/remove-member";
import { WorkspaceSummary } from "@/actions/(user)/workspaces/get-workspaces";
import { appToast } from "@/utils/app-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useWorkspaceCard(workspace: WorkspaceSummary) {
  const router = useRouter();

  const [expanded, setExpanded] = useState(false);
  const [members, setMembers] = useState<MemberSummary[] | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const loadingMembers = expanded && members === null;

  useEffect(() => {
    if (!expanded || members !== null) return;

    let cancelled = false;
    getWorkspaceMembersAction(workspace.id).then((result) => {
      if (cancelled) return;
      setMembers(result.success ? result.data : []);
    });
    return () => {
      cancelled = true;
    };
  }, [expanded, workspace.id, members]);

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    const result = await inviteToWorkspaceAction({
      workspaceId: workspace.id,
      email: inviteEmail.trim(),
    });
    setInviting(false);

    if (!result.success) {
      appToast.error(result.error);
      return;
    }

    appToast.success("Convite enviado com sucesso");
    setInviteEmail("");
  }

  async function handleRemoveMember(userId: string) {
    setRemoving(userId);
    const result = await removeMemberAction(workspace.id, userId);
    setRemoving(null);

    if (!result.success) {
      appToast.error(result.error);
      return;
    }

    appToast.success("Membro removido");
    setMembers((prev) => (prev ?? []).filter((m) => m.userId !== userId));
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteWorkspaceAction(workspace.id);
    setDeleting(false);

    if (!result.success) {
      appToast.error(result.error);
      return;
    }

    appToast.success("Workspace deletado");
    setDeleteOpen(false);
    router.refresh();
  }

  async function handleLeave() {
    setLeaving(true);
    const result = await leaveWorkspaceAction(workspace.id);
    setLeaving(false);

    if (!result.success) {
      appToast.error(result.error);
      return;
    }

    appToast.success("Você saiu do workspace");
    setLeaveOpen(false);
    router.refresh();
  }

  return {
    expanded,
    setExpanded,
    members,
    loadingMembers,
    inviteEmail,
    setInviteEmail,
    inviting,
    removing,
    deleting,
    leaving,
    renameOpen,
    setRenameOpen,
    deleteOpen,
    setDeleteOpen,
    leaveOpen,
    setLeaveOpen,
    handleInvite,
    handleRemoveMember,
    handleDelete,
    handleLeave,
  };
}
