import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import {
  getUserFromRequest,
  sanitizeUser,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import {
  validateImageFile,
  optimizeImageForStorage,
  friendlyImageUploadError,
} from "@/lib/imageUpload";

export const dynamic = "force-dynamic";

async function loadSafeUser(id) {
  const rows = await query(
    "SELECT id, name, email, role, created_at, avatar_mime_type FROM users WHERE id = :id",
    { id }
  );
  return rows[0] ? sanitizeUser(rows[0]) : null;
}

// PUT /api/auth/profile — update name, password, and/or avatar
export async function PUT(request) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";
    let name;
    let currentPassword;
    let newPassword;
    let avatarFile = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      name = (formData.get("name") || "").toString().trim();
      currentPassword = (formData.get("currentPassword") || "").toString();
      newPassword = (formData.get("newPassword") || "").toString();
      const file = formData.get("avatar");
      if (file && typeof file.arrayBuffer === "function" && file.size > 0) {
        avatarFile = file;
      }
    } else {
      const body = await request.json();
      name = (body.name || "").toString().trim();
      currentPassword = (body.currentPassword || "").toString();
      newPassword = (body.newPassword || "").toString();
    }

    const rows = await query(
      "SELECT id, name, email, password_hash, role, created_at, avatar_mime_type FROM users WHERE id = :id",
      { id: payload.id }
    );
    if (!rows.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const user = rows[0];

    if (name && name !== user.name) {
      if (name.length < 2) {
        return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
      }
      if (name.length > 150) {
        return NextResponse.json({ error: "Name is too long" }, { status: 400 });
      }
      await query("UPDATE users SET name = :name WHERE id = :id", {
        name,
        id: user.id,
      });
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to set a new password" },
          { status: 400 }
        );
      }
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters" },
          { status: 400 }
        );
      }
      const valid = await verifyPassword(currentPassword, user.password_hash);
      if (!valid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }
      const passwordHash = await hashPassword(newPassword);
      await query("UPDATE users SET password_hash = :hash WHERE id = :id", {
        hash: passwordHash,
        id: user.id,
      });
    }

    if (avatarFile) {
      validateImageFile(avatarFile);
      const raw = Buffer.from(await avatarFile.arrayBuffer());
      const optimized = await optimizeImageForStorage(raw, {
        maxWidth: 512,
        maxHeight: 512,
        maxOutputBytes: 400 * 1024,
        quality: 82,
      });
      await query(
        `UPDATE users
         SET avatar_data = :data, avatar_mime_type = :mimeType
         WHERE id = :id`,
        { data: optimized.data, mimeType: optimized.mimeType, id: user.id }
      );
    }

    const updated = await loadSafeUser(user.id);
    return NextResponse.json({ user: updated, message: "Profile updated" });
  } catch (error) {
    console.error("PUT /api/auth/profile error:", error);
    const status = error.status || 500;
    return NextResponse.json(
      { error: friendlyImageUploadError(error) },
      { status }
    );
  }
}
