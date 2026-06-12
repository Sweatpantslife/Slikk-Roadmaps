"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  endSession,
  getCurrentUser,
  getDummyPasswordHash,
  hashPassword,
  isValidEmail,
  MIN_PASSWORD_LENGTH,
  requireAdmin,
  requireUser,
  safeNextPath,
  startSession,
  verifyPassword,
} from "@/lib/auth";
import { getApp, SITE } from "@/lib/config";
import { isCategory, isStatus, parseLabels, STATUS_META } from "@/lib/types";

export type FormState = { error?: string } | undefined;

/** Every page renders from the same few tables, so refresh the whole tree. */
function revalidateAll() {
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

export async function registerUser(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? ""));

  if (name.length < 2) return { error: "Tell us your name (at least 2 characters)." };
  if (name.length > 50) return { error: "Keep your name under 50 characters." };
  if (!isValidEmail(email)) return { error: "That doesn't look like a valid email address." };
  if (password.length < MIN_PASSWORD_LENGTH)
    return { error: `Use a password of at least ${MIN_PASSWORD_LENGTH} characters.` };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists — sign in instead." };

  const user = await prisma.user.create({
    data: { name, email, passwordHash: hashPassword(password) },
  });
  await startSession(user.id);
  revalidateAll();
  redirect(next);
}

export async function loginUser(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? ""));

  const user = await prisma.user.findUnique({ where: { email } });
  // Verify against a dummy hash for unknown emails so response timing
  // doesn't reveal which addresses are registered.
  const valid = verifyPassword(password, user?.passwordHash ?? getDummyPasswordHash());
  if (!user || !valid) {
    return { error: "Incorrect email or password." };
  }

  await startSession(user.id);
  revalidateAll();
  redirect(next);
}

export async function logout(): Promise<void> {
  await endSession();
  revalidateAll();
  redirect("/");
}

// ---------------------------------------------------------------------------
// Subscriptions & notifications
// ---------------------------------------------------------------------------

async function subscribe(postId: string, userId: string) {
  await prisma.subscription.upsert({
    where: { postId_userId: { postId, userId } },
    update: {},
    create: { postId, userId },
  });
}

/** Notify everyone subscribed to a post, except the actor who caused it. */
async function notifySubscribers(
  postId: string,
  type: "STATUS_CHANGE" | "OFFICIAL_RESPONSE" | "NEW_COMMENT",
  message: string,
  exceptUserId?: string,
) {
  const subs = await prisma.subscription.findMany({
    where: { postId, ...(exceptUserId ? { userId: { not: exceptUserId } } : {}) },
    select: { userId: true },
  });
  if (subs.length === 0) return;
  await prisma.notification.createMany({
    data: subs.map((s) => ({ userId: s.userId, postId, type, message })),
  });
}

export async function toggleSubscription(postId: string): Promise<{ subscribed: boolean } | { error: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "UNAUTHENTICATED" };

  const existing = await prisma.subscription.findUnique({
    where: { postId_userId: { postId, userId: user.id } },
  });
  if (existing) {
    await prisma.subscription.delete({ where: { id: existing.id } });
  } else {
    await subscribe(postId, user.id);
  }
  revalidateAll();
  return { subscribed: !existing };
}

export async function markAllNotificationsRead(): Promise<void> {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidateAll();
}

// ---------------------------------------------------------------------------
// Posts, votes, comments (signed-in users only)
// ---------------------------------------------------------------------------

export async function createPost(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to post feedback." };

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const appId = String(formData.get("appId") ?? "");

  if (title.length < 4) return { error: "Give your post a short, descriptive title (at least 4 characters)." };
  if (title.length > 120) return { error: "Keep the title under 120 characters — details go in the description." };
  if (body.length < 10) return { error: "Add a few more details so the team can understand the request." };
  if (body.length > 5000) return { error: "Description is too long (max 5,000 characters)." };
  if (!isCategory(category)) return { error: "Pick a category for your post." };

  // Authors automatically upvote and subscribe to their own post.
  const post = await prisma.post.create({
    data: {
      title,
      body,
      category,
      appId: getApp(appId)?.id ?? null,
      authorId: user.id,
      voteCount: 1,
      votes: { create: { userId: user.id } },
      subscriptions: { create: { userId: user.id } },
    },
  });

  revalidateAll();
  redirect(`/posts/${post.id}`);
}

export async function toggleVote(postId: string): Promise<{ voted: boolean; count: number } | { error: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "UNAUTHENTICATED" };

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) return { error: "This post no longer exists." };

  const existing = await prisma.vote.findUnique({
    where: { postId_userId: { postId, userId: user.id } },
  });

  const updated = existing
    ? await prisma.post.update({
        where: { id: postId },
        data: { voteCount: { decrement: 1 }, votes: { delete: { id: existing.id } } },
        select: { voteCount: true },
      })
    : await prisma.post.update({
        where: { id: postId },
        data: { voteCount: { increment: 1 }, votes: { create: { userId: user.id } } },
        select: { voteCount: true },
      });

  // Voters follow the posts they care about.
  if (!existing) await subscribe(postId, user.id);

  revalidateAll();
  return { voted: !existing, count: updated.voteCount };
}

export async function addComment(postId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to comment." };

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Write a comment first." };
  if (body.length > 3000) return { error: "Comment is too long (max 3,000 characters)." };

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true, title: true } });
  if (!post) return { error: "This post no longer exists." };

  await prisma.comment.create({
    data: { postId, body, authorId: user.id, isTeam: user.isAdmin },
  });
  await subscribe(postId, user.id);
  await notifySubscribers(
    postId,
    "NEW_COMMENT",
    `${user.isAdmin ? `${user.name} (${SITE.name} team)` : user.name} commented on “${post.title}”`,
    user.id,
  );

  revalidateAll();
  return undefined;
}

// ---------------------------------------------------------------------------
// Admin: post triage
// ---------------------------------------------------------------------------

export async function setPostStatus(postId: string, status: string): Promise<void> {
  const admin = await requireAdmin();
  if (!isStatus(status)) throw new Error("Unknown status");
  const post = await prisma.post.update({
    where: { id: postId },
    data: { status, shippedAt: status === "SHIPPED" ? new Date() : null },
    select: { title: true },
  });
  await notifySubscribers(
    postId,
    "STATUS_CHANGE",
    `“${post.title}” moved to ${STATUS_META[status].label}`,
    admin.id,
  );
  revalidateAll();
}

export async function togglePinned(postId: string): Promise<void> {
  await requireAdmin();
  const post = await prisma.post.findUniqueOrThrow({ where: { id: postId }, select: { pinned: true } });
  await prisma.post.update({ where: { id: postId }, data: { pinned: !post.pinned } });
  revalidateAll();
}

export async function setOfficialResponse(postId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const response = String(formData.get("response") ?? "").trim();
  const post = await prisma.post.update({
    where: { id: postId },
    data: { officialResponse: response || null },
    select: { title: true },
  });
  if (response) {
    await notifySubscribers(
      postId,
      "OFFICIAL_RESPONSE",
      `The ${SITE.name} team responded to “${post.title}”`,
      admin.id,
    );
  }
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
