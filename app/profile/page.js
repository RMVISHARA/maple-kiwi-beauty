"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Camera,
  Package,
  Lock,
  User as UserIcon,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { useAuth } from "@/context/AuthContext";
import { MAX_IMAGE_UPLOAD_LABEL } from "@/lib/imageLimits";

const STATUS_STYLES = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-sky-100 text-sky-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-100 text-rose-800",
};

function formatMoney(value) {
  return `LKR ${Number(value || 0).toLocaleString("en-LK")}`;
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoaded, updateUser, openAuth } = useAuth();
  const fileInputRef = useRef(null);

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      openAuth("signin");
      router.replace("/");
      return;
    }
    setName(user.name || "");
    setAvatarPreview(user.avatarUrl || null);
  }, [isLoaded, user, openAuth, router]);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("maple_kiwi_token");
    if (!token) {
      setOrdersLoading(false);
      setOrdersError("Sign in again to view your orders.");
      return;
    }

    setOrdersLoading(true);
    fetch("/api/orders?mine=1", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load orders");
        setOrders(Array.isArray(data) ? data : []);
        setOrdersError("");
      })
      .catch((err) => {
        setOrders([]);
        setOrdersError(err.message || "Failed to load orders");
      })
      .finally(() => setOrdersLoading(false));
  }, [user]);

  const authHeaders = () => {
    const token = localStorage.getItem("maple_kiwi_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleAvatarPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setProfileMessage("");
    setProfileError("");
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError("");
    setProfileMessage("");

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: authHeaders(),
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      updateUser({
        ...data.user,
        updatedAt: Date.now(),
      });
      setAvatarFile(null);
      setAvatarPreview(data.user.avatarUrl || avatarPreview);
      setProfileMessage("Profile saved.");
    } catch (err) {
      setProfileError(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordError("");
    setPasswordMessage("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      setSavingPassword(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("Password updated.");
    } catch (err) {
      setPasswordError(err.message || "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-cream text-brand-espresso">
        <Header searchQuery="" setSearchQuery={() => {}} />
        <main className="flex-1 flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-brand-rose" />
        </main>
        <Footer />
        <CartDrawer />
      </div>
    );
  }

  const displayAvatar = avatarPreview
    ? avatarPreview.startsWith("blob:")
      ? avatarPreview
      : `${avatarPreview}?t=${user.updatedAt || ""}`
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream text-brand-espresso">
      <Header searchQuery="" setSearchQuery={() => {}} />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-6 py-10">
        <div className="mb-8">
          <p className="text-xs font-bold tracking-widest uppercase text-brand-rose mb-2">
            Account
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold">My Profile</h1>
          <p className="text-sm text-brand-espresso/65 mt-2">
            Update your details, change your password, and review your orders.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <section className="space-y-6">
            <form
              onSubmit={saveProfile}
              className="border border-brand-border rounded-2xl bg-brand-card/40 p-6 space-y-5"
            >
              <div className="flex items-center gap-2 text-sm font-bold">
                <UserIcon className="w-4 h-4 text-brand-rose" />
                Profile details
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-20 h-20 rounded-full overflow-hidden border border-brand-border bg-brand-rose text-[#FAF7F2] font-bold text-2xl flex items-center justify-center group"
                  aria-label="Change profile picture"
                >
                  {displayAvatar ? (
                    <Image
                      src={displayAvatar}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                      unoptimized
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                  <span className="absolute inset-0 bg-brand-espresso/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-5 h-5 text-white" />
                  </span>
                </button>
                <div>
                  <p className="text-sm font-semibold">{user.email}</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-1 text-xs font-semibold text-brand-rose hover:underline"
                  >
                    Change profile picture
                  </button>
                  <p className="text-[10px] text-brand-espresso/45 mt-1">
                    JPG, PNG, WEBP, GIF or AVIF · max {MAX_IMAGE_UPLOAD_LABEL}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    className="hidden"
                    onChange={handleAvatarPick}
                  />
                </div>
              </div>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-brand-espresso/55">
                  Display name
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-brand-border bg-brand-cream px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-rose"
                  required
                  minLength={2}
                  maxLength={150}
                />
              </label>

              {profileError && (
                <p className="text-sm text-brand-rose">{profileError}</p>
              )}
              {profileMessage && (
                <p className="text-sm text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {profileMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-espresso text-brand-cream hover:text-[#FAF7F2] px-5 py-2.5 text-sm font-semibold hover:bg-brand-rose transition-colors disabled:opacity-60"
              >
                {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                Save profile
              </button>
            </form>

            <form
              onSubmit={savePassword}
              className="border border-brand-border rounded-2xl bg-brand-card/40 p-6 space-y-4"
            >
              <div className="flex items-center gap-2 text-sm font-bold">
                <Lock className="w-4 h-4 text-brand-rose" />
                Change password
              </div>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-brand-espresso/55">
                  Current password
                </span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-brand-border bg-brand-cream px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-rose"
                  required
                  autoComplete="current-password"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-brand-espresso/55">
                  New password
                </span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-brand-border bg-brand-cream px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-rose"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-brand-espresso/55">
                  Confirm new password
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-brand-border bg-brand-cream px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-rose"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </label>

              {passwordError && (
                <p className="text-sm text-brand-rose">{passwordError}</p>
              )}
              {passwordMessage && (
                <p className="text-sm text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {passwordMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-border px-5 py-2.5 text-sm font-semibold hover:bg-brand-espresso/5 transition-colors disabled:opacity-60"
              >
                {savingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                Update password
              </button>
            </form>
          </section>

          <section className="border border-brand-border rounded-2xl bg-brand-card/40 p-6">
            <div className="flex items-center gap-2 text-sm font-bold mb-5">
              <Package className="w-4 h-4 text-brand-rose" />
              Your orders
            </div>

            {ordersLoading ? (
              <div className="flex items-center gap-2 text-sm text-brand-espresso/60 py-8 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading orders…
              </div>
            ) : ordersError ? (
              <p className="text-sm text-brand-rose py-4">{ordersError}</p>
            ) : orders.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-brand-espresso/60 mb-4">
                  You haven&apos;t placed any orders yet.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/#all-products")}
                  className="rounded-full bg-brand-espresso text-brand-cream hover:text-[#FAF7F2] px-5 py-2.5 text-sm font-semibold hover:bg-brand-rose transition-colors"
                >
                  Browse products
                </button>
              </div>
            ) : (
              <ul className="space-y-4">
                {orders.map((order) => (
                  <li
                    key={order.id}
                    className="rounded-xl border border-brand-border/80 bg-brand-cream p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <p className="text-sm font-bold">Order #{order.id}</p>
                        <p className="text-xs text-brand-espresso/55 mt-0.5">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${
                          STATUS_STYLES[order.status] || "bg-brand-espresso/10 text-brand-espresso"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <ul className="space-y-1.5 mb-3">
                      {(order.items || []).map((item) => (
                        <li
                          key={item.id}
                          className="flex justify-between gap-3 text-xs text-brand-espresso/80"
                        >
                          <span className="truncate">
                            {item.product_name}
                            {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                          </span>
                          <span className="shrink-0 font-semibold">
                            {formatMoney(item.line_total)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex justify-between text-sm pt-2 border-t border-brand-border/60">
                      <span className="text-brand-espresso/60">Total</span>
                      <span className="font-bold">{formatMoney(order.total)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}
