"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ensureVisitorId, rememberDisplayName } from "@/lib/identity";
import { isAdmin, startAdminSession, endAdminSession } from "@/lib/admin";
import { getApp } from "@/lib/config";
import { isCategory, isStatus, parseLabels } from "@/lib/types";

export type FormState = { error?: string } | undefined;

/** Every page renders from the same few tables, so refresh the whole tree. */
function revalidateAll() {
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------------
// Public actions
// ---------------------------------------------------------------------------

export async function createPost(_prev: FormState, formData: FormData): Promise<FormState> {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const appId = String(formData.get("appId") ?? "");
  const authorName = String(formData.get("authorName") ?? "").trim() || "Anonymous";

  if (title.length < 4) return { error: "Give your post a short, descriptive title (at least 4 characters)." };
  if (title.length > 120) return { error: "Keep the title under 120 characters — details go in the description." };
  if (body.length < 10) return { error: "Add a few more details so the team can understand the request." };
  if (body.length > 5000) return { error: "Description is too long (max 5,000 characters)." };
  if (!isCategory(category)) return { error: "Pick a category for your post." };

  const voterId = await ensureVisitorId();
  await rememberDisplayName(authorName);

  // Authors automatically upvote their own post.
  const post = await prisma.post.create({
    data: {
      title,
      body,
      category,
      appId: getApp(appId)?.id ?? null,
      authorName: authorName.slice(0, 50),
      authorId: voterId,
      voteCount: 1,
      votes: { create: { voterId } },
    },
  });

  revalidateAll();
  redirect(`/posts/${post.id}`);
}

export async function toggleVote(postId: string): Promise<{ voted: boolean; count: number } | { error: string }> {
  const voterId = await ensureVisitorId();
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) return { error: "This post no longer exists." };

  const existing = await prisma.vote.findUnique({
    where: { postId_voterId: { postId, voterId } },
  });

  const updated = existing
    ? await prisma.post.update({
        where: { id: postId },
        data: { voteCount: { decrement: 1 }, votes: { delete: { id: existing.id } } },
        select: { voteCount: true },
      })
    : await prisma.post.update({
        where: { id: postId },
        data: { voteCount: { increment: 1 }, votes: { create: { voterId } } },
        select: { voteCount: true },
      });

  revalidateAll();
  return { voted: !existing, count: updated.voteCount };
}

export async function addComment(postId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const body = String(formData.get("body") ?? "").trim();
  const authorName = String(formData.get("authorName") ?? "").trim() || "Anonymous";

  if (!body) return { error: "Write a comment first." };
  if (body.length > 3000) return { error: "Comment is too long (max 3,000 characters)." };

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) return { error: "This post no longer exists." };

  const authorId = await ensureVisitorId();
  await rememberDisplayName(authorName);
  const admin = await isAdmin();

  await prisma.comment.create({
    data: {
      postId,
      body,
      authorName: authorName.slice(0, 50),
      authorId,
      isTeam: admin,
    },
  });

  revalidateAll();
  return undefined;
}

// ---------------------------------------------------------------------------
// Admin session
// ---------------------------------------------------------------------------

export async function loginAdmin(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  const ok = await startAdminSession(password);
  if (!ok) return { error: "Incorrect password." };
  revalidateAll();
  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  await endAdminSession();
  revalidateAll();
  redirect("/");
}

async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Not authorized");
}

// ---------------------------------------------------------------------------
// Admin: post triage
// ---------------------------------------------------------------------------

export async function setPostStatus(postId: string, status: string): Promise<void> {
  await requireAdmin();
  if (!isStatus(status)) throw new Error("Unknown status");
  await prisma.post.update({
    where: { id: postId },
    data: { status, shippedAt: status === "SHIPPED" ? new Date() : null },
  });
  revalidateAll();
}

export async function togglePinned(postId: string): Promise<void> {
  await requireAdmin();
  const post = await prisma.post.findUniqueOrThrow({ where: { id: postId }, select: { pinned: true } });
  await prisma.post.update({ where: { id: postId }, data: { pinned: !post.pinned } });
  revalidateAll();
}

export async function setOfficialResponse(postId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const response = String(formData.get("response") ?? "").trim();
  await prisma.post.update({
    where: { id: postId },
    data: { officialResponse: response || null },
  });
  revalidateAll();
  return undefined;
}

export async function deletePost(postId: string): Promise<void> {
  await requireAdmin();
  await prisma.post.delete({ where: { id: postId } });
  revalidateAll();
  redirect("/");
}

export async function deleteComment(commentId: string): Promise<void> {
  await requireAdmin();
  await prisma.comment.delete({ where: { id: commentId } });
  revalidateAll();
}

// ---------------------------------------------------------------------------
// Admin: changelog
// ---------------------------------------------------------------------------

export async function saveChangelogEntry(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const labels = parseLabels(formData.getAll("labels").map(String).join(","));
  const appId = getApp(String(formData.get("appId") ?? ""))?.id ?? null;
  const published = formData.get("published") === "on";
  const publishedAtRaw = String(formData.get("publishedAt") ?? "");
  const publishedAt = publishedAtRaw ? new Date(publishedAtRaw) : new Date();

  if (title.length < 3) return { error: "Give the entry a title." };
  if (body.length < 10) return { error: "Write a few details about what changed." };
  if (labels.length === 0) return { error: "Pick at least one label (New / Improved / Fixed)." };
  if (isNaN(publishedAt.getTime())) return { error: "Invalid publish date." };

  const data = { title, body, labels: labels.join(","), appId, published, publishedAt };
  if (id) {
    await prisma.changelogEntry.update({ where: { id }, data });
  } else {
    await prisma.changelogEntry.create({ data });
  }

  revalidateAll();
  redirect("/admin/changelog");
}

export async function deleteChangelogEntry(id: string): Promise<void> {
  await requireAdmin();
  await prisma.changelogEntry.delete({ where: { id } });
  revalidateAll();
  redirect("/admin/changelog");
}
