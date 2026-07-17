"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Tag,
  Star,
  Search,
  Menu,
  X,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  LogOut,
  ExternalLink,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Images,
  CalendarClock,
  AlertTriangle,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { apiGet, apiSend } from "@/lib/adminApi";
import ProductFormModal from "@/components/admin/ProductFormModal";
import { AreaChart, BarList, Donut } from "@/components/admin/Chart";
import { getExpiryStatus, formatDaysLeft, EXPIRY_STATUS, NEAR_EXPIRY_DAYS } from "@/lib/expiry";
import { formatMeasurementLabel } from "@/lib/measurement";

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
const lkr = (n) => `LKR ${Number(n || 0).toLocaleString()}`;

// Total tracked stock across a product's default option + its variants.
// Returns { total, tracked, optionCount } where `tracked` is false when no
// option tracks stock (so the table shows "—").
function stockSummary(p) {
  const values = [];
  if (p.stockQuantity != null) values.push(Number(p.stockQuantity));
  for (const v of p.variants || []) {
    if (v.stockQuantity != null) values.push(Number(v.stockQuantity));
  }
  return {
    tracked: values.length > 0,
    total: values.reduce((a, b) => a + b, 0),
    optionCount: (p.variants?.length || 0) + 1,
  };
}

const STATUS_STYLES = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-700",
};
const STATUS_DOT = {
  PENDING: "#d97706",
  CONFIRMED: "#2563eb",
  SHIPPED: "#7c3aed",
  DELIVERED: "#16a34a",
  CANCELLED: "#dc2626",
};

const EXPIRY_STYLES = {
  [EXPIRY_STATUS.EXPIRED]: "bg-red-100 text-red-700",
  [EXPIRY_STATUS.NEAR]: "bg-amber-100 text-amber-800",
  [EXPIRY_STATUS.OK]: "bg-green-100 text-green-800",
  [EXPIRY_STATUS.NONE]: "bg-brand-espresso/10 text-brand-espresso/60",
};
const EXPIRY_LABEL = {
  [EXPIRY_STATUS.EXPIRED]: "Expired",
  [EXPIRY_STATUS.NEAR]: "Near expiry",
  [EXPIRY_STATUS.OK]: "In date",
  [EXPIRY_STATUS.NONE]: "No date",
};

const formatDate = (value) =>
  value ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";

function ExpiryBadge({ expiryDate }) {
  const { status, daysLeft } = getExpiryStatus(expiryDate);
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${EXPIRY_STYLES[status]}`}>
      {status === EXPIRY_STATUS.EXPIRED || status === EXPIRY_STATUS.NEAR ? <AlertTriangle className="w-3 h-3" /> : null}
      {EXPIRY_LABEL[status]}
      {status !== EXPIRY_STATUS.NONE ? ` · ${formatDaysLeft(daysLeft)}` : ""}
    </span>
  );
}

const NAV = [
  { id: "home", label: "Home", icon: Home },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "products", label: "Products", icon: Package },
  { id: "customers", label: "Customers", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "discounts", label: "Discounts", icon: Tag },
  { id: "expiry", label: "Expiry", icon: CalendarClock },
  { id: "reviews", label: "Reviews", icon: Star },
];

export default function AdminDashboard() {
  const { user, isLoaded, logout } = useAuth();
  const { theme, toggleTheme, mounted } = useTheme();
  const router = useRouter();
  const isAdmin = user?.role === "admin";

  // Sign out, then leave the admin area so the guard never flashes.
  const handleLogout = () => {
    const name = user?.name || "";
    setConfirmLogout(false);
    setGoodbyeName(name);
    logout();
    setTimeout(() => {
      setGoodbyeName("");
      router.push("/");
    }, 2200);
  };

  const [section, setSection] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [goodbyeName, setGoodbyeName] = useState("");
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [discountTarget, setDiscountTarget] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsData, analyticsData, productsData, ordersData, customersData, reviewsData] = await Promise.all([
        apiGet("/api/admin/stats"),
        apiGet("/api/admin/analytics?days=30"),
        apiGet("/api/products"),
        apiGet("/api/orders"),
        apiGet("/api/admin/customers"),
        apiGet("/api/reviews?all=1"),
      ]);
      setStats(statsData);
      setAnalytics(analyticsData);
      setProducts(productsData);
      setOrders(ordersData);
      setCustomers(customersData);
      setReviews(reviewsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) loadAll();
  }, [isAdmin, loadAll]);

  const navBadges = useMemo(() => {
    const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
    const pendingReviews = reviews.filter((r) => r.status === "PENDING").length;
    const outOfStock = products.filter((p) => {
      const stock = stockSummary(p);
      if (stock.tracked) return stock.total <= 0;
      return p.inStock === false;
    }).length;
    const expiryAttention = products.filter((p) => {
      const { status } = getExpiryStatus(p.expiryDate);
      if (status === EXPIRY_STATUS.EXPIRED || status === EXPIRY_STATUS.NEAR) return true;
      return (p.variants || []).some((v) => {
        const vs = getExpiryStatus(v.expiryDate).status;
        return vs === EXPIRY_STATUS.EXPIRED || vs === EXPIRY_STATUS.NEAR;
      });
    }).length;
    const discountOpportunities = products.filter((p) => {
      if (p.discountPercent) return false;
      const { status } = getExpiryStatus(p.expiryDate);
      return status === EXPIRY_STATUS.EXPIRED || status === EXPIRY_STATUS.NEAR;
    }).length;

    return {
      orders: pendingOrders,
      reviews: pendingReviews,
      products: outOfStock,
      expiry: expiryAttention,
      discounts: discountOpportunities,
    };
  }, [orders, reviews, products]);

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-cream text-brand-espresso/60">Loading…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-cream text-brand-espresso px-6 text-center">
        <XCircle className="w-14 h-14 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Admin access only</h1>
        <p className="text-sm text-brand-espresso/60 max-w-sm mb-6">
          You need to sign in with an administrator account to view this dashboard.
        </p>
        <Link href="/" className="bg-brand-espresso hover:bg-brand-rose text-brand-cream text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to store
        </Link>
      </div>
    );
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this product permanently?")) return;
    try {
      await apiSend(`/api/products/${id}`, "DELETE");
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleStock = async (product) => {
    try {
      await apiSend(`/api/products/${product.id}`, "PUT", { inStock: !product.inStock });
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  const changeOrderStatus = async (orderId, status) => {
    try {
      await apiSend(`/api/orders/${orderId}`, "PUT", { status });
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  const updateReviewStatus = async (reviewId, status) => {
    try {
      // Approving shows the review on the product page. Leaving APPROVED
      // also removes it from the homepage automatically.
      await apiSend(`/api/reviews/${reviewId}`, "PUT", {
        status,
        ...(status !== "APPROVED" ? { isFeatured: false } : {}),
      });
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  const setHomepageReview = async (review, isFeatured) => {
    try {
      await apiSend(`/api/reviews/${review.id}`, "PUT", { isFeatured });
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!confirm("Delete this review permanently?")) return;
    try {
      await apiSend(`/api/reviews/${reviewId}`, "DELETE");
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  const currentLabel = NAV.find((n) => n.id === section)?.label || "Home";
  const formatBadge = (count) => (count > 99 ? "99+" : String(count));

  return (
    <div className="min-h-screen bg-brand-cream text-brand-espresso flex transition-colors duration-300">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-60 bg-brand-card border-r border-brand-border flex flex-col transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-14 flex items-center gap-2 px-4 border-b border-brand-border">
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2 min-w-0 group text-left"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden border border-brand-border bg-brand-card flex items-center justify-center relative shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/images/logo.jpg"
                alt="Maple & Kiwi Beauty Logo"
                fill
                className="object-cover"
                sizes="36px"
              />
            </div>
            <div className="min-w-0 text-left">
              <span className="block font-serif font-bold text-sm leading-tight text-brand-espresso group-hover:text-brand-rose transition-colors truncate">
                Maple &amp; Kiwi
              </span>
              <span className="block text-[9px] tracking-widest text-brand-rose uppercase leading-none font-semibold">
                B E A U T Y
              </span>
            </div>
          </Link>
          <button className="ml-auto lg:hidden text-brand-espresso/60 shrink-0" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ id, label, icon: Icon }) => {
            const badge = navBadges[id] || 0;
            return (
              <button
                key={id}
                onClick={() => {
                  setSection(id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  section === id
                    ? "bg-brand-espresso/10 text-brand-espresso"
                    : "text-brand-espresso/70 hover:bg-brand-espresso/5 hover:text-brand-espresso"
                }`}
              >
                <Icon className={`w-[18px] h-[18px] shrink-0 ${section === id ? "text-brand-rose" : "text-brand-espresso/40"}`} />
                <span className="flex-1 text-left">{label}</span>
                {badge > 0 && (
                  <span
                    className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-red-600 text-white text-[10px] font-bold leading-none flex items-center justify-center shrink-0"
                    aria-label={`${badge} items need attention`}
                  >
                    {formatBadge(badge)}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-brand-border">
          <Link href="/" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-brand-espresso/70 hover:bg-brand-espresso/5">
            <ExternalLink className="w-[18px] h-[18px] text-brand-espresso/40" /> View store
          </Link>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="h-14 bg-brand-card border-b border-brand-border flex items-center gap-3 px-4 sticky top-0 z-20 transition-colors duration-300">
          <button className="lg:hidden text-brand-espresso/70" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-brand-espresso">{currentLabel}</h1>
          <div className="ml-auto flex items-center gap-3">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 text-brand-espresso/70 hover:text-brand-rose transition-all rounded-full hover:bg-brand-espresso/5"
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? (
                  <Moon className="w-[18px] h-[18px]" />
                ) : (
                  <Sun className="w-[18px] h-[18px]" />
                )}
              </button>
            )}
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-xs font-semibold text-brand-espresso">{user.name}</span>
              <span className="text-[10px] text-brand-espresso/50">{user.email}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-brand-rose text-brand-cream text-sm font-bold flex items-center justify-center">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={() => setConfirmLogout(true)}
              title="Sign out"
              className="text-brand-espresso/50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-[1200px] w-full mx-auto">
          {error && <div className="mb-5 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 rounded-xl text-sm">{error}</div>}

          {loading ? (
            <div className="py-24 text-center text-brand-espresso/50">Loading dashboard…</div>
          ) : (
            <>
              {section === "home" && <HomeSection stats={stats} analytics={analytics} onViewOrders={() => setSection("orders")} />}
              {section === "orders" && <OrdersSection orders={orders} onChangeStatus={changeOrderStatus} />}
              {section === "products" && (
                <ProductsSection
                  products={products}
                  onAdd={() => {
                    setEditing(null);
                    setShowForm(true);
                  }}
                  onEdit={(p) => {
                    setEditing(p);
                    setShowForm(true);
                  }}
                  onDelete={handleDelete}
                  onToggleStock={toggleStock}
                />
              )}
              {section === "customers" && <CustomersSection customers={customers} />}
              {section === "analytics" && <AnalyticsSection analytics={analytics} stats={stats} />}
              {section === "expiry" && (
                <ExpirySection
                  products={products}
                  onDiscount={setDiscountTarget}
                  onEdit={(p) => {
                    setEditing(p);
                    setShowForm(true);
                  }}
                  onViewDiscounts={() => setSection("discounts")}
                />
              )}
              {section === "discounts" && <DiscountsSection products={products} onEdit={setDiscountTarget} onReload={loadAll} />}
              {section === "reviews" && (
                <ReviewsSection
                  reviews={reviews}
                  onChangeStatus={updateReviewStatus}
                  onSetHomepage={setHomepageReview}
                  onDelete={deleteReview}
                />
              )}
            </>
          )}
        </main>
      </div>

      {showForm && (
        <ProductFormModal
          product={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            loadAll();
          }}
        />
      )}

      {discountTarget && (
        <DiscountModal
          product={discountTarget}
          onClose={() => setDiscountTarget(null)}
          onSaved={() => {
            setDiscountTarget(null);
            loadAll();
          }}
        />
      )}

      {confirmLogout && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmLogout(false)}
          />
          <div className="relative w-full max-w-sm bg-brand-card border border-brand-border rounded-xl shadow-2xl p-6 text-brand-espresso">
            <h3 className="font-semibold text-lg mb-2">Sign out?</h3>
            <p className="text-sm text-brand-espresso/60 mb-6">
              Are you sure that you want to log out? Your basket will be saved for when you sign back in.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setConfirmLogout(false)}
                className="px-4 py-2.5 text-sm font-semibold rounded-lg border border-brand-border hover:bg-brand-espresso/5 transition-colors"
              >
                No
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2.5 text-sm font-semibold rounded-lg bg-brand-espresso text-brand-cream hover:bg-brand-rose transition-colors"
              >
                Yes, sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {goodbyeName && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-md bg-brand-card border border-brand-border rounded-xl shadow-2xl p-6 md:p-8">
            <div className="py-6 text-center flex flex-col items-center justify-center">
              <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
              <h3 className="font-semibold text-2xl mb-2">Thank you</h3>
              <p className="text-sm text-brand-espresso/60 leading-relaxed max-w-sm">
                We&apos;re sad to see you leave, Thank You &amp; Come again, {goodbyeName}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- shared UI ---------------- */

function Card({ title, action, children, className = "" }) {
  return (
    <div className={`bg-brand-card rounded-xl border border-brand-border shadow-sm transition-colors duration-300 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border/60">
          {title && <h3 className="font-semibold text-brand-espresso text-sm">{title}</h3>}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

function Kpi({ label, value, delta, deltaLabel }) {
  const up = delta >= 0;
  return (
    <div className="bg-brand-card rounded-xl border border-brand-border shadow-sm p-4 transition-colors duration-300">
      <p className="text-xs font-medium text-brand-espresso/60">{label}</p>
      <p className="text-2xl font-bold text-brand-espresso mt-1">{value}</p>
      {delta !== undefined && (
        <p className={`text-xs mt-1.5 flex items-center gap-1 ${up ? "text-green-600" : "text-red-600"}`}>
          {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {Math.abs(delta)}% <span className="text-brand-espresso/50">{deltaLabel}</span>
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[status] || "bg-brand-espresso/10 text-brand-espresso/80"}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_DOT[status] || "#6b7280" }} />
      {status}
    </span>
  );
}

/* ---------------- Home ---------------- */

function HomeSection({ stats, analytics, onViewOrders }) {
  if (!stats || !analytics) return null;

  // Compare last 7 days vs the previous 7 days for a simple trend.
  const series = analytics.series || [];
  const last7 = series.slice(-7).reduce((a, s) => a + s.revenue, 0);
  const prev7 = series.slice(-14, -7).reduce((a, s) => a + s.revenue, 0);
  const delta = prev7 === 0 ? (last7 > 0 ? 100 : 0) : Math.round(((last7 - prev7) / prev7) * 100);

  const chartData = series.map((s) => ({
    label: new Date(s.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    value: s.revenue,
  }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Total sales" value={lkr(analytics.totalRevenue)} delta={delta} deltaLabel="vs prev 7 days" />
        <Kpi label="Orders" value={analytics.totalOrders} />
        <Kpi label="Avg order value" value={lkr(analytics.averageOrderValue)} />
        <Kpi label="Customers" value={stats.totalCustomers} />
      </div>

      <Card title="Sales over the last 30 days">
        <AreaChart data={chartData} formatValue={(v) => lkr(v)} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Recent orders" action={<button onClick={onViewOrders} className="text-xs font-semibold text-brand-rose hover:underline">View all</button>}>
          {stats.recentOrders?.length ? (
            <div className="divide-y divide-brand-border/60 -my-1">
              {stats.recentOrders.map((o) => (
                <div key={o.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-espresso truncate">{o.customer_name}</p>
                    <p className="text-[11px] text-brand-espresso/50">Order #{o.id}</p>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-3">
                    <span className="text-sm font-semibold text-brand-espresso">{lkr(o.total)}</span>
                    <StatusBadge status={o.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-brand-espresso/50">No orders yet.</p>
          )}
        </Card>

        <Card title="Top selling products">
          <BarList
            items={(stats.topProducts || []).map((p) => ({ label: p.product_name, value: Number(p.unitsSold) }))}
            formatValue={(v) => `${v} sold`}
          />
        </Card>
      </div>
    </div>
  );
}

/* ---------------- Orders ---------------- */

function OrdersSection({ orders, onChangeStatus }) {
  const [filter, setFilter] = useState("ALL");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "ALL" && o.status !== filter) return false;
      if (!term) return true;
      return (
        `${o.customer_name || ""} ${o.customer_email || ""} #${o.id} ${o.id}`
          .toLowerCase()
          .includes(term)
      );
    });
  }, [orders, filter, q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {["ALL", ...ORDER_STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                filter === s ? "bg-brand-espresso text-brand-cream" : "bg-brand-card border border-brand-border text-brand-espresso/70 hover:bg-brand-espresso/5"
              }`}
            >
              {s === "ALL" ? "All" : s}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-espresso/50" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search orders"
            className="w-full bg-brand-card border border-brand-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-rose/30"
          />
        </div>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <p className="text-sm text-brand-espresso/50 text-center py-8">No orders in this view.</p>
        ) : (
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-brand-espresso/5 text-brand-espresso/60 text-[11px] uppercase tracking-wide">
                <tr>
                  <th className="text-left font-semibold px-5 py-3">Order</th>
                  <th className="text-left font-semibold px-5 py-3">Date</th>
                  <th className="text-left font-semibold px-5 py-3">Customer</th>
                  <th className="text-left font-semibold px-5 py-3">Items</th>
                  <th className="text-right font-semibold px-5 py-3">Total</th>
                  <th className="text-left font-semibold px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-brand-espresso/5">
                    <td className="px-5 py-3 font-semibold text-brand-espresso">#{o.id}</td>
                    <td className="px-5 py-3 text-brand-espresso/60">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-brand-espresso">{o.customer_name}</p>
                      <p className="text-[11px] text-brand-espresso/50">{o.customer_email || "—"}</p>
                    </td>
                    <td className="px-5 py-3 text-brand-espresso/60">{o.items?.reduce((a, i) => a + i.quantity, 0) || 0}</td>
                    <td className="px-5 py-3 text-right font-semibold text-brand-espresso">{lkr(o.total)}</td>
                    <td className="px-5 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => onChangeStatus(o.id, e.target.value)}
                        className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-rose/40 ${STATUS_STYLES[o.status]}`}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ---------------- Products ---------------- */

function ProductsSection({ products, onAdd, onEdit, onDelete, onToggleStock }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => products.filter((p) => `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(q.toLowerCase())),
    [products, q]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-espresso/50" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products"
            className="w-full bg-brand-card border border-brand-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-rose/30"
          />
        </div>
        <button onClick={onAdd} className="flex items-center gap-1.5 bg-brand-rose hover:bg-brand-rose-hover text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors">
          <Plus className="w-4 h-4" /> Add product
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto -m-5">
          <table className="w-full text-sm min-w-[840px]">
            <thead className="bg-brand-espresso/5 text-brand-espresso/60 text-[11px] uppercase tracking-wide">
              <tr>
                <th className="text-left font-semibold px-5 py-3">Product</th>
                <th className="text-left font-semibold px-5 py-3">Status</th>
                <th className="text-left font-semibold px-5 py-3">Category</th>
                <th className="text-center font-semibold px-5 py-3">Stock</th>
                <th className="text-right font-semibold px-5 py-3">Price</th>
                <th className="text-center font-semibold px-5 py-3">Discount</th>
                <th className="text-right font-semibold px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-brand-espresso/5">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-espresso/10 relative overflow-hidden border border-brand-border shrink-0">
                        <Image src={p.image} alt={p.name} fill className="object-contain p-1" sizes="40px" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-brand-espresso truncate max-w-[220px]">{p.name}</p>
                        <p className="text-[11px] text-brand-espresso/50">
                          {p.brand}
                          {formatMeasurementLabel(p) ? ` · ${formatMeasurementLabel(p)}` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => onToggleStock(p)}
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors ${
                        p.inStock !== false ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                    >
                      {p.inStock !== false ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {p.inStock !== false ? "Active" : "Out of stock"}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-brand-espresso/60">{p.category}</td>
                  <td className="px-5 py-3 text-center">
                    {(() => {
                      const s = stockSummary(p);
                      const hasVariants = (p.variants?.length || 0) > 0;
                      if (!s.tracked) return <span className="text-brand-espresso/30" title="Not tracked">—</span>;
                      return (
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold ${s.total <= 10 ? "text-red-600" : "text-brand-espresso/80"}`}
                          title={hasVariants ? `Total across ${s.optionCount} options` : undefined}
                        >
                          {s.total}
                          {hasVariants && <span className="text-[10px] font-normal text-brand-espresso/50">({s.optionCount})</span>}
                          {p.showStock && <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Visible to customers" />}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-brand-espresso">{lkr(p.price)}</td>
                  <td className="px-5 py-3 text-center">
                    {p.discountPercent ? <span className="text-xs font-bold text-brand-rose">-{p.discountPercent}%</span> : <span className="text-brand-espresso/30">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onEdit(p)} className="p-2 rounded-lg text-brand-espresso/60 hover:text-brand-espresso hover:bg-brand-espresso/10" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(p.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Customers ---------------- */

function CustomersSection({ customers }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((c) => `${c.name || ""} ${c.email || ""}`.toLowerCase().includes(term));
  }, [customers, q]);

  return (
    <div className="space-y-4">
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-espresso/50" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search customers"
          className="w-full bg-brand-card border border-brand-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-rose/30"
        />
      </div>
      <Card>
        {filtered.length === 0 ? (
          <p className="text-sm text-brand-espresso/50 text-center py-8">
            {customers.length === 0 ? "No customers have ordered yet." : "No customers match your search."}
          </p>
        ) : (
        <div className="overflow-x-auto -m-5">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-brand-espresso/5 text-brand-espresso/60 text-[11px] uppercase tracking-wide">
              <tr>
                <th className="text-left font-semibold px-5 py-3">Customer</th>
                <th className="text-left font-semibold px-5 py-3">Email</th>
                <th className="text-center font-semibold px-5 py-3">Orders</th>
                <th className="text-right font-semibold px-5 py-3">Total spent</th>
                <th className="text-right font-semibold px-5 py-3">Last order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {filtered.map((c, i) => (
                <tr key={i} className="hover:bg-brand-espresso/5">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-espresso/15 text-brand-espresso/70 text-xs font-bold flex items-center justify-center">
                        {(c.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-brand-espresso">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-brand-espresso/60">{c.email || "—"}</td>
                  <td className="px-5 py-3 text-center text-brand-espresso/80">{c.orderCount}</td>
                  <td className="px-5 py-3 text-right font-semibold text-brand-espresso">{lkr(c.totalSpent)}</td>
                  <td className="px-5 py-3 text-right text-brand-espresso/60">{c.lastOrder ? new Date(c.lastOrder).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </Card>
    </div>
  );
}

/* ---------------- Analytics ---------------- */

function AnalyticsSection({ analytics, stats }) {
  if (!analytics) return null;
  const ordersData = analytics.series.map((s) => ({
    label: new Date(s.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    value: s.orders,
  }));
  const statusSegments = (analytics.statusBreakdown || []).map((s) => ({
    label: s.status,
    value: s.count,
    color: STATUS_DOT[s.status] || "#6b7280",
  }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Revenue (net)" value={lkr(analytics.totalRevenue)} />
        <Kpi label="Orders" value={analytics.totalOrders} />
        <Kpi label="Avg order value" value={lkr(analytics.averageOrderValue)} />
        <Kpi label="Out of stock" value={stats?.outOfStock ?? 0} />
      </div>

      <Card title="Orders per day (30 days)">
        <AreaChart data={ordersData} color="#2563eb" formatValue={(v) => `${v} orders`} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Orders by status">
          <Donut segments={statusSegments} />
        </Card>
        <Card title="Revenue by category">
          <BarList
            items={(analytics.categoryBreakdown || []).map((c) => ({ label: c.category, value: c.revenue }))}
            formatValue={(v) => lkr(v)}
          />
        </Card>
      </div>
    </div>
  );
}

/* ---------------- Reviews ---------------- */

const REVIEW_STATUS_STYLES = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-700",
};

const REVIEW_HOMEPAGE_STYLES = {
  showing: "bg-green-100 text-green-800",
  hidden: "bg-amber-100 text-amber-800",
};

const REVIEW_STATUSES = ["PENDING", "APPROVED", "REJECTED"];

function ReviewPhotosModal({ review, startIndex = 0, onClose }) {
  const photos = review?.photos || [];
  const [activeIndex, setActiveIndex] = useState(startIndex);

  useEffect(() => {
    setActiveIndex(startIndex);
  }, [review, startIndex]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setActiveIndex((i) => (i > 0 ? i - 1 : photos.length - 1));
      if (e.key === "ArrowRight") setActiveIndex((i) => (i < photos.length - 1 ? i + 1 : 0));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, photos.length]);

  if (!review || photos.length === 0) return null;

  const activePhoto = photos[activeIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="bg-brand-card rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-brand-border/60">
          <div className="min-w-0">
            <h3 className="font-semibold text-brand-espresso truncate">{review.authorName}</h3>
            <p className="text-xs text-brand-espresso/60 truncate">
              {review.productName || `Product #${review.productId}`} · {photos.length} photo{photos.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-brand-espresso/50 hover:text-brand-espresso/80 hover:bg-brand-espresso/10 shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative bg-brand-espresso/5 flex-1 min-h-[280px] flex items-center justify-center">
          <div className="relative w-full max-w-2xl aspect-[4/3] mx-auto">
            <Image
              src={activePhoto}
              alt={`Review photo ${activeIndex + 1}`}
              fill
              className="object-contain p-4"
              sizes="(max-width: 768px) 100vw, 672px"
            />
          </div>
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setActiveIndex((i) => (i > 0 ? i - 1 : photos.length - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-brand-card/90 border border-brand-border text-brand-espresso/80 hover:bg-brand-card shadow-sm"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex((i) => (i < photos.length - 1 ? i + 1 : 0))}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-brand-card/90 border border-brand-border text-brand-espresso/80 hover:bg-brand-card shadow-sm"
                aria-label="Next photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {photos.length > 1 && (
          <div className="px-5 py-4 border-t border-brand-border/60">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {photos.map((src, index) => (
                <button
                  key={`${review.id}-thumb-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border shrink-0 transition-colors ${
                    index === activeIndex ? "border-brand-rose ring-2 ring-brand-rose/30" : "border-brand-border hover:border-brand-border"
                  }`}
                >
                  <Image src={src} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
            <p className="text-[11px] text-brand-espresso/50 mt-2 text-center">
              Photo {activeIndex + 1} of {photos.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewsSection({ reviews, onChangeStatus, onSetHomepage, onDelete }) {
  const [filter, setFilter] = useState("ALL");
  const [q, setQ] = useState("");
  const [photoReview, setPhotoReview] = useState(null);
  const [photoStartIndex, setPhotoStartIndex] = useState(0);

  const openPhotos = (review, index = 0) => {
    setPhotoReview(review);
    setPhotoStartIndex(index);
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return reviews.filter((r) => {
      if (filter !== "ALL" && r.status !== filter) return false;
      if (!term) return true;
      return `${r.authorName} ${r.productName || ""} ${r.body}`.toLowerCase().includes(term);
    });
  }, [reviews, filter, q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {["ALL", ...REVIEW_STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                filter === s ? "bg-brand-espresso text-brand-cream" : "bg-brand-card border border-brand-border text-brand-espresso/70 hover:bg-brand-espresso/5"
              }`}
            >
              {s === "ALL" ? "All" : s}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-espresso/50" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search reviews"
            className="w-full bg-brand-card border border-brand-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-rose/30"
          />
        </div>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <p className="text-sm text-brand-espresso/50 text-center py-8">No reviews in this view.</p>
        ) : (
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm min-w-[860px]">
              <thead className="bg-brand-espresso/5 text-brand-espresso/60 text-[11px] uppercase tracking-wide">
                <tr>
                  <th className="text-left font-semibold px-5 py-3">Customer</th>
                  <th className="text-left font-semibold px-5 py-3">Product</th>
                  <th className="text-left font-semibold px-5 py-3">Review</th>
                  <th className="text-left font-semibold px-5 py-3">Photos</th>
                  <th className="text-center font-semibold px-5 py-3">Rating</th>
                  <th className="text-left font-semibold px-5 py-3">Status</th>
                  <th className="text-center font-semibold px-5 py-3">Homepage</th>
                  <th className="text-right font-semibold px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {filtered.map((r) => {
                  const photos = r.photos || [];
                  return (
                  <tr key={r.id} className="hover:bg-brand-espresso/5">
                    <td className="px-5 py-3">
                      <p className="font-medium text-brand-espresso">{r.authorName}</p>
                      <p className="text-[11px] text-brand-espresso/50">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-brand-espresso/70 max-w-[140px] truncate">{r.productName || `#${r.productId}`}</td>
                    <td className="px-5 py-3 text-brand-espresso/70 max-w-[240px]">
                      <p className="line-clamp-3">{r.body}</p>
                    </td>
                    <td className="px-5 py-3">
                      {photos.length === 0 ? (
                        <span className="text-[11px] text-brand-espresso/30">—</span>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1.5">
                            {photos.map((src, index) => (
                              <button
                                key={`${r.id}-photo-${index}`}
                                type="button"
                                onClick={() => openPhotos(r, index)}
                                className="relative w-10 h-10 rounded-lg overflow-hidden border border-brand-border hover:border-brand-rose/50 hover:ring-2 hover:ring-brand-rose/20 transition-all cursor-pointer"
                                title="View photo"
                              >
                                <Image src={src} alt="" fill className="object-cover" sizes="40px" />
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => openPhotos(r, 0)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-rose hover:underline"
                          >
                            <Images className="w-3.5 h-3.5" />
                            View {photos.length} photo{photos.length !== 1 ? "s" : ""}
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center gap-0.5 text-brand-gold font-semibold">
                        <Star className="w-3.5 h-3.5 fill-current" /> {r.rating}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={r.status}
                        onChange={(e) => onChangeStatus(r.id, e.target.value)}
                        className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-rose/40 ${REVIEW_STATUS_STYLES[r.status] || "bg-brand-espresso/10 text-brand-espresso/80"}`}
                      >
                        {REVIEW_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {r.status === "APPROVED" ? (
                        <select
                          value={r.isFeatured ? "showing" : "hidden"}
                          onChange={(e) => onSetHomepage(r, e.target.value === "showing")}
                          className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-rose/40 ${
                            REVIEW_HOMEPAGE_STYLES[r.isFeatured ? "showing" : "hidden"]
                          }`}
                        >
                          <option value="hidden">HIDDEN</option>
                          <option value="showing">SHOWING</option>
                        </select>
                      ) : (
                        <span className="text-[11px] text-brand-espresso/30">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => onDelete(r.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {photoReview && (
        <ReviewPhotosModal
          review={photoReview}
          startIndex={photoStartIndex}
          onClose={() => setPhotoReview(null)}
        />
      )}
    </div>
  );
}

/* ---------------- Expiry ---------------- */

const EXPIRY_FILTERS = [
  { id: "ALL", label: "All" },
  { id: EXPIRY_STATUS.EXPIRED, label: "Expired" },
  { id: EXPIRY_STATUS.NEAR, label: "Near expiry" },
  { id: EXPIRY_STATUS.OK, label: "In date" },
  { id: EXPIRY_STATUS.NONE, label: "No date" },
];

// Order for sorting: expired first, then near, then in-date, then undated.
const EXPIRY_SORT_RANK = {
  [EXPIRY_STATUS.EXPIRED]: 0,
  [EXPIRY_STATUS.NEAR]: 1,
  [EXPIRY_STATUS.OK]: 2,
  [EXPIRY_STATUS.NONE]: 3,
};

function ExpirySection({ products, onDiscount, onEdit, onViewDiscounts }) {
  const [filter, setFilter] = useState("ALL");
  const [q, setQ] = useState("");

  // Decorate each product with its expiry status once.
  const decorated = useMemo(
    () =>
      products.map((p) => {
        const { status, daysLeft } = getExpiryStatus(p.expiryDate);
        return { ...p, expiryStatus: status, daysLeft };
      }),
    [products]
  );

  const counts = useMemo(() => {
    const c = { expired: 0, near: 0, ok: 0, none: 0 };
    for (const p of decorated) {
      if (p.expiryStatus === EXPIRY_STATUS.EXPIRED) c.expired += 1;
      else if (p.expiryStatus === EXPIRY_STATUS.NEAR) c.near += 1;
      else if (p.expiryStatus === EXPIRY_STATUS.OK) c.ok += 1;
      else c.none += 1;
    }
    return c;
  }, [decorated]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return decorated
      .filter((p) => {
        if (filter !== "ALL" && p.expiryStatus !== filter) return false;
        if (!term) return true;
        return `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(term);
      })
      .sort((a, b) => {
        const rankDiff = EXPIRY_SORT_RANK[a.expiryStatus] - EXPIRY_SORT_RANK[b.expiryStatus];
        if (rankDiff !== 0) return rankDiff;
        if (a.daysLeft === null) return 0;
        return a.daysLeft - b.daysLeft;
      });
  }, [decorated, filter, q]);

  const actionable = counts.expired + counts.near;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Expired" value={counts.expired} />
        <Kpi label={`Near expiry (≤${NEAR_EXPIRY_DAYS}d)`} value={counts.near} />
        <Kpi label="In date" value={counts.ok} />
        <Kpi label="No expiry set" value={counts.none} />
      </div>

      {actionable > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800 flex-1">
            <span className="font-semibold">{actionable} product{actionable !== 1 ? "s" : ""}</span> {actionable === 1 ? "is" : "are"} expired or near expiry.
            Apply a discount to clear this stock faster.
          </p>
          <button
            onClick={onViewDiscounts}
            className="shrink-0 self-start sm:self-auto inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
          >
            <Tag className="w-3.5 h-3.5" /> Go to discounts
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {EXPIRY_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                filter === f.id ? "bg-brand-espresso text-brand-cream" : "bg-brand-card border border-brand-border text-brand-espresso/70 hover:bg-brand-espresso/5"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-espresso/50" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products"
            className="w-full bg-brand-card border border-brand-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-rose/30"
          />
        </div>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <p className="text-sm text-brand-espresso/50 text-center py-8">No products in this view.</p>
        ) : (
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm min-w-[820px]">
              <thead className="bg-brand-espresso/5 text-brand-espresso/60 text-[11px] uppercase tracking-wide">
                <tr>
                  <th className="text-left font-semibold px-5 py-3">Product</th>
                  <th className="text-left font-semibold px-5 py-3">Category</th>
                  <th className="text-left font-semibold px-5 py-3">Expiry date</th>
                  <th className="text-left font-semibold px-5 py-3">Status</th>
                  <th className="text-center font-semibold px-5 py-3">Discount</th>
                  <th className="text-right font-semibold px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-brand-espresso/5">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-espresso/10 relative overflow-hidden border border-brand-border shrink-0">
                          <Image src={p.image} alt={p.name} fill className="object-contain p-1" sizes="40px" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-brand-espresso truncate max-w-[220px]">{p.name}</p>
                          <p className="text-[11px] text-brand-espresso/50">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-brand-espresso/60">{p.category}</td>
                    <td className="px-5 py-3 text-brand-espresso/80">{formatDate(p.expiryDate)}</td>
                    <td className="px-5 py-3"><ExpiryBadge expiryDate={p.expiryDate} /></td>
                    <td className="px-5 py-3 text-center">
                      {p.discountPercent ? <span className="text-xs font-bold text-brand-rose">-{p.discountPercent}%</span> : <span className="text-brand-espresso/30">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {(p.expiryStatus === EXPIRY_STATUS.EXPIRED || p.expiryStatus === EXPIRY_STATUS.NEAR) && (
                          <button
                            onClick={() => onDiscount(p)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-rose hover:underline"
                          >
                            <Tag className="w-3.5 h-3.5" /> {p.discountPercent ? "Edit discount" : "Discount"}
                          </button>
                        )}
                        <button
                          onClick={() => onEdit(p)}
                          className="p-2 rounded-lg text-brand-espresso/60 hover:text-brand-espresso hover:bg-brand-espresso/10"
                          title="Edit expiry date"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ---------------- Discounts ---------------- */

function DiscountsSection({ products, onEdit, onReload }) {
  const onSale = products.filter((p) => p.discountPercent);
  const notOnSale = products.filter((p) => !p.discountPercent);

  // Products that are expired or near expiry — prioritise these for discounting
  // so stock clears before it goes to waste. Soonest to expire shown first.
  const expiringToClear = useMemo(
    () =>
      products
        .map((p) => ({ ...p, ...getExpiryStatus(p.expiryDate) }))
        .filter((p) => p.status === EXPIRY_STATUS.EXPIRED || p.status === EXPIRY_STATUS.NEAR)
        .sort((a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0)),
    [products]
  );

  const removeDiscount = async (p) => {
    try {
      const base = p.originalPrice || p.price;
      await apiSend(`/api/products/${p.id}`, "PUT", { price: base, originalPrice: null, discountPercent: null });
      onReload();
    } catch (err) {
      alert(err.message);
    }
  };

  const Row = ({ p, sale }) => {
    const { status } = getExpiryStatus(p.expiryDate);
    const expiringSoon = status === EXPIRY_STATUS.EXPIRED || status === EXPIRY_STATUS.NEAR;
    return (
    <tr className="hover:bg-brand-espresso/5">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-espresso/10 relative overflow-hidden border border-brand-border shrink-0">
            <Image src={p.image} alt={p.name} fill className="object-contain p-1" sizes="40px" />
          </div>
          <div className="min-w-0">
            <span className="block font-medium text-brand-espresso truncate max-w-[220px]">{p.name}</span>
            {expiringSoon && (
              <span className="mt-1 inline-flex"><ExpiryBadge expiryDate={p.expiryDate} /></span>
            )}
          </div>
        </div>
      </td>
      <td className="px-5 py-3 text-right">
        {sale && p.originalPrice ? <span className="text-brand-espresso/50 line-through mr-1">{lkr(p.originalPrice)}</span> : null}
        <span className="font-semibold text-brand-espresso">{lkr(p.price)}</span>
      </td>
      <td className="px-5 py-3 text-center">
        {sale ? <span className="text-xs font-bold text-brand-rose">-{p.discountPercent}%</span> : <span className="text-brand-espresso/30">—</span>}
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => onEdit(p)} className="text-xs font-semibold text-brand-rose hover:underline">
            {sale ? "Edit" : "Add discount"}
          </button>
          {sale && (
            <button onClick={() => removeDiscount(p)} className="text-xs font-semibold text-brand-espresso/60 hover:text-red-600">
              Remove
            </button>
          )}
        </div>
      </td>
    </tr>
    );
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Products on sale" value={onSale.length} />
        <Kpi label="Full price" value={notOnSale.length} />
        <Kpi label="Near / past expiry" value={expiringToClear.length} />
        <Kpi label="Total products" value={products.length} />
      </div>

      {expiringToClear.length > 0 && (
        <Card
          title={`Clear before expiry (${expiringToClear.length})`}
          action={<span className="text-[11px] text-brand-espresso/50">Discount these to sell faster</span>}
        >
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-amber-50 text-amber-700 text-[11px] uppercase tracking-wide">
                <tr>
                  <th className="text-left font-semibold px-5 py-3">Product</th>
                  <th className="text-left font-semibold px-5 py-3">Expiry</th>
                  <th className="text-right font-semibold px-5 py-3">Price</th>
                  <th className="text-center font-semibold px-5 py-3">Discount</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {expiringToClear.map((p) => (
                  <tr key={p.id} className="hover:bg-amber-50/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-espresso/10 relative overflow-hidden border border-brand-border shrink-0">
                          <Image src={p.image} alt={p.name} fill className="object-contain p-1" sizes="40px" />
                        </div>
                        <span className="font-medium text-brand-espresso truncate max-w-[220px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3"><ExpiryBadge expiryDate={p.expiryDate} /></td>
                    <td className="px-5 py-3 text-right">
                      {p.originalPrice ? <span className="text-brand-espresso/50 line-through mr-1">{lkr(p.originalPrice)}</span> : null}
                      <span className="font-semibold text-brand-espresso">{lkr(p.price)}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {p.discountPercent ? <span className="text-xs font-bold text-brand-rose">-{p.discountPercent}%</span> : <span className="text-brand-espresso/30">—</span>}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => onEdit(p)} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-rose hover:underline">
                        <Tag className="w-3.5 h-3.5" /> {p.discountPercent ? "Edit discount" : "Add discount"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card title={`On sale (${onSale.length})`}>
        {onSale.length === 0 ? (
          <p className="text-sm text-brand-espresso/50 text-center py-4">No active discounts. Add one from the list below.</p>
        ) : (
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-brand-espresso/5 text-brand-espresso/60 text-[11px] uppercase tracking-wide">
                <tr>
                  <th className="text-left font-semibold px-5 py-3">Product</th>
                  <th className="text-right font-semibold px-5 py-3">Price</th>
                  <th className="text-center font-semibold px-5 py-3">Discount</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {onSale.map((p) => <Row key={p.id} p={p} sale />)}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title={`Full price products (${notOnSale.length})`}>
        <div className="overflow-x-auto -m-5">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-brand-espresso/5 text-brand-espresso/60 text-[11px] uppercase tracking-wide">
              <tr>
                <th className="text-left font-semibold px-5 py-3">Product</th>
                <th className="text-right font-semibold px-5 py-3">Price</th>
                <th className="text-center font-semibold px-5 py-3">Discount</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {notOnSale.map((p) => <Row key={p.id} p={p} sale={false} />)}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function DiscountModal({ product, onClose, onSaved }) {
  const base = product.originalPrice || product.price;
  const [percent, setPercent] = useState(product.discountPercent || 10);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const salePrice = Math.round(base * (1 - Number(percent) / 100));

  const save = async () => {
    const pct = Number(percent);
    if (!pct || pct <= 0 || pct >= 100) {
      setError("Enter a discount between 1 and 99%.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await apiSend(`/api/products/${product.id}`, "PUT", {
        price: salePrice,
        originalPrice: base,
        discountPercent: pct,
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-brand-card rounded-xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-brand-espresso">Set discount</h3>
          <button onClick={onClose} className="text-brand-espresso/50 hover:text-brand-espresso/80">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-brand-espresso/60 mb-1 truncate">{product.name}</p>
        <p className="text-xs text-brand-espresso/50 mb-4">Base price: {lkr(base)}</p>

        {error && <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{error}</div>}

        <label className="text-[11px] font-bold uppercase tracking-wide text-brand-espresso/60">Discount %</label>
        <input
          type="number"
          min="1"
          max="99"
          value={percent}
          onChange={(e) => setPercent(e.target.value)}
          className="w-full border border-brand-border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-brand-rose/30"
        />

        <div className="mt-4 bg-brand-espresso/5 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-brand-espresso/60">New sale price</span>
          <span className="text-lg font-bold text-brand-rose">{lkr(salePrice)}</span>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-brand-espresso/70 hover:bg-brand-espresso/10 rounded-lg">Cancel</button>
          <button onClick={save} disabled={saving} className="px-5 py-2 text-sm font-semibold bg-brand-rose hover:bg-brand-rose-hover disabled:opacity-60 text-white rounded-lg">
            {saving ? "Saving…" : "Apply discount"}
          </button>
        </div>
      </div>
    </div>
  );
}
