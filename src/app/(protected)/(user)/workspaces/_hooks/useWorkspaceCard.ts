"use client";

import { bulkRemoveMembersAction } from "@/actions/(user)/workspaces/bulk-remove-members";
import { deleteWorkspaceAction } from "@/actions/(user)/workspaces/delete-workspace";
import {
  getWorkspaceMembersAction,
  MemberSummary,
} from "@/actions/(user)/workspaces/get-workspace-members";
import { WorkspaceSummary } from "@/actions/(user)/workspaces/get-workspaces";
import { leaveWorkspaceAction } from "@/actions/(user)/workspaces/leave-workspace";
import { removeMemberAction } from "@/actions/(user)/workspaces/remove-member";
import { appToast } from "@/utils/app-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useWorkspaceCard(workspace: WorkspaceSummary) {
  const router = useRouter();

  const [expanded, setExpanded] = useState(false);
  const [members, setMembers] = useState<MemberSummary[] | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<MemberSummary | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkRemoving, setBulkRemoving] = useState(false);
  const [bulkRemoveOpen, setBulkRemoveOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const loadingMembers = expanded && members === null;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMembers(null);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIds(new Set());
  }, [workspace.role, workspace.id]);

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

  async function confirmRemoveMember() {
    if (!removeTarget) return;
    const userId = removeTarget.userId;

    setRemoving(userId);
    const result = await removeMemberAction(workspace.id, userId);
    setRemoving(null);

    if (!result.success) {
      appToast.error(result.error);
      return;
    }

    appToast.success("Membro removido");
    setMembers((prev) => (prev ?? []).filter((m) => m.userId !== userId));
    setRemoveTarget(null);
  }

  function toggleSelect(userId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  async function confirmBulkRemove() {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);

    setBulkRemoving(true);
    const result = await bulkRemoveMembersAction(workspace.id, ids);
    setBulkRemoving(false);

    if (!result.success) {
      appToast.error(result.error);
      return;
    }

    appToast.success(
      `${result.removed} ${result.removed === 1 ? "membro removido" : "membros removidos"}`,
    );
    setMembers((prev) => (prev ?? []).filter((m) => !selectedIds.has(m.userId)));
    setSelectedIds(new Set());
    setBulkRemoveOpen(false);
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
    removing,
    removeTarget,
    setRemoveTarget,
    selectedIds,
    toggleSelect,
    bulkRemoving,
    bulkRemoveOpen,
    setBulkRemoveOpen,
    confirmBulkRemove,
    deleting,
    leaving,
    renameOpen,
    setRenameOpen,
    deleteOpen,
    setDeleteOpen,
    leaveOpen,
    setLeaveOpen,
    confirmRemoveMember,
    handleDelete,
    handleLeave,
  };
}
