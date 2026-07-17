# Cosmetics Website: Maple & Kiwi Beauty

A premium, mobile-responsive e-commerce frontend for **Maple & Kiwi Beauty**, importing authentic skincare and wellness products from Canada and New Zealand to Sri Lanka. Built using **Next.js**, with structured preparations for **Node.js** and **MySQL** database integration.

---

## 🌟 Key Features

1. **Premium & Responsive Design**: Custom warm ivory and espresso color palette with smooth hover scales, card transition effects, and dynamic slide-over drawers for desktop, tablet, and mobile displays.
2. **Category Concerns Filter & Search**: Real-time product search with horizontal concerns filters (*All, Anti-Aging, Brightening, Acne & Oil Control, Hydration, Sun Protection*) and dropdown sorting (*Featured, Price: Low-High, Price: High-Low, Rating*).
3. **`[i]` Benefit & Climate Compatibility Modal**: Clicking the information button displays a detailed drawer containing skin benefits checklists, target customer focus, and a **Sri Lanka Climate Compatibility** report detailing how the lightweight formula behaves in tropical weather.
4. **Shopping Cart Context**: React State context with client-side persistence in `localStorage`.
5. **Free Shipping Progress Tracker**: Automatically calculates cart subtotal and shows a progress bar indicating how close the customer is to the **LKR 5,000 Free Shipping threshold**.
6. **WhatsApp Checkout Integration**: Automatically compiles cart contents, quantities, unit prices, shipping tier, and grand total into a pre-written WhatsApp message. Tapping "Order via WhatsApp" launches WhatsApp directly, allowing customers to checkout in one click.
7. **MySQL Database (XAMPP)**: A full relational schema in `db/schema.sql` (products, benefits, users, orders, order items) plus seed data, ready to import into phpMyAdmin/MySQL.
8. **Full Node Backend**: REST API routes for products (CRUD), authentication (register/login with hashed passwords + JWT), and orders (transaction-safe creation). Built on a shared `mysql2/promise` connection pool with a static fallback so the storefront still renders if the database is offline.

---

## 📂 Project Structure

```text
maple-kiwi-beauty/
├── app/
│   ├── layout.js              # Layout with Inter/Playfair Display fonts & Cart Provider
│   ├── page.js                # Main page assembling header, hero, collections, products, & footer
│   ├── globals.css            # Tailwind CSS v4 custom theme tokens & custom scrollbars
│   └── api/
│       ├── products/
│       │   ├── route.js       # GET list / POST create products
│       │   └── [id]/route.js  # GET / PUT / DELETE a single product
│       ├── auth/
│       │   ├── register/route.js  # POST create account
│       │   ├── login/route.js     # POST sign in (returns JWT)
│       │   └── me/route.js        # GET current user from Bearer token
│       └── orders/
│           ├── route.js       # GET list / POST create order
│           └── [id]/route.js  # GET a single order
├── lib/
│   ├── db.js                  # mysql2 connection pool + transaction helper
│   ├── auth.js                # bcrypt hashing + JWT sign/verify helpers
│   ├── products.js            # Product data access + static fallback
│   └── orders.js              # Order creation/query logic
├── components/
│   ├── Header.js              # Navbar with rotating announcements & live search bar
│   ├── Hero.js                # Hero banner with overlay, WhatsApp CTA, & Shop scroll
│   ├── Collections.js         # Canada (active) & New Zealand (coming soon modal) banners
│   ├── ProductGrid.js         # Concerns filters and sorting selectors
│   ├── ProductCard.js         # Product card with price markers, ratings, & quick-add
│   ├── ProductModal.js        # Detailed benefit drawer (including climate notes)
│   └── CartDrawer.js          # Cart slide-over with progress bar & WhatsApp checkout
├── context/
│   ├── CartContext.js         # Cart State Context and LocalStorage persistence
│   └── AuthContext.js         # Auth state; calls the auth API and stores the JWT
├── db/
│   └── schema.sql             # SQL database script (tables, seed data)
├── public/
│   └── images/                # Brand logo and high-resolution product images
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### Installation
1. Clone your repository (or navigate to this folder):
   ```bash
   cd maple-kiwi-beauty
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```

### Running Locally
Start the development server:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to see the live app!

---

## 🗄️ Backend & MySQL (XAMPP) Setup

The backend is **fully implemented**. Follow these steps to run it against a local XAMPP MySQL database.

### 1. Start MySQL in XAMPP
Open the **XAMPP Control Panel** and start the **MySQL** module (Apache is not required). MySQL listens on `localhost:3306` by default with user `root` and an empty password.

### 2. Import the schema
Open **phpMyAdmin** at [http://localhost/phpmyadmin](http://localhost/phpmyadmin), then either:
- Use the **Import** tab and select `db/schema.sql`, **or**
- Run it from the terminal:
  ```bash
  /Applications/XAMPP/xamppfiles/bin/mysql -u root < db/schema.sql
  ```
This creates the `maple_kiwi_beauty` database with the `products`, `product_benefits`, `users`, `orders`, and `order_items` tables and seeds the 5 starter products.

### 3. Configure environment variables
The `.env.local` file is already set up for default XAMPP credentials. Adjust if your setup differs:
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=maple_kiwi_beauty
JWT_SECRET=change_this_to_a_long_random_string
```

### 4. Install dependencies & run
```bash
npm install
npm run dev
```
Products are now served from MySQL. If MySQL is unreachable, `/api/products` automatically serves built-in fallback data so the page still loads.

---

## 🔌 API Reference

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `GET` | `/api/products` | List all products with benefits |
| `POST` | `/api/products` | Create a product (`name, brand, category, subtitle, price, image, targetCustomers` required; optional `benefits[]`) |
| `GET` | `/api/products/:id` | Get a single product |
| `PUT` | `/api/products/:id` | Update a product (partial fields allowed) |
| `DELETE` | `/api/products/:id` | Delete a product |
| `POST` | `/api/auth/register` | Create account `{ name, email, password }` → returns `{ user, token }` |
| `POST` | `/api/auth/login` | Sign in `{ email, password }` → returns `{ user, token }` |
| `GET` | `/api/auth/me` | Current user (send `Authorization: Bearer <token>`) |
| `GET` | `/api/orders` | List all orders with items |
| `POST` | `/api/orders` | Create an order `{ customer, items[], paymentMethod }`; totals are computed server-side |
| `GET` | `/api/orders/:id` | Get a single order |

Write endpoints (`POST/PUT/DELETE /api/products`, `GET/PUT /api/orders…`, and all `/api/admin/*`) require a valid **admin** Bearer token and return `403` otherwise.

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `GET` | `/api/admin/stats` | Dashboard metrics: income, order/product/customer counts, recent orders, top sellers |
| `GET` | `/api/admin/customers` | Customers aggregated from orders (order count + total spent) |
| `PUT` | `/api/orders/:id` | Update order `status` (PENDING → CONFIRMED → SHIPPED → DELIVERED / CANCELLED) |
| `POST` | `/api/upload` | Upload a product image (multipart `file`); saved to `public/images/products/` and returns its path |

**Security notes:** passwords are hashed with `bcryptjs`, sessions use signed JWTs that carry the user role, admin-only routes are guarded by `requireAdmin()`, all queries are parameterized (no SQL injection), and product/order writes run inside transactions.

---

## 🛠️ Admin Dashboard

The store includes a full admin dashboard at **`/admin`**.

**Default admin login** (seeded by `db/schema.sql`):
- **Email:** `admin@maplekiwibeauty.lk`
- **Password:** `Admin@123`

Sign in through the normal Sign-In modal with these credentials — admins are automatically redirected to the dashboard (also reachable from the user menu). It uses a **Shopify-style layout**: a left sidebar, top bar, KPI tiles, and charts.

- **Home** — KPI tiles (total sales, orders, average order value, customers), a 30-day **sales chart**, recent orders, and top-selling products.
- **Orders** — filter by status; table of every order with customer, item count, total, and an inline status selector (PENDING → CONFIRMED → SHIPPED → DELIVERED / CANCELLED).
- **Products** — searchable table; add products (with benefits, pricing, and an **image uploaded from your computer**), edit, delete, and toggle **Active / Out of stock** (out-of-stock items show a badge and disable "Add to cart" on the storefront).
- **Customers** — everyone who has ordered, with order count, total spent, and last order date.
- **Analytics** — orders-per-day chart, an orders-by-status donut, and revenue-by-category breakdown.
- **Discounts** — see products on sale vs. full price, apply a discount % (auto-calculates the sale price and keeps the original), or remove a discount.

> Change the seeded admin password after first login in a real deployment, and set a strong `JWT_SECRET` in `.env.local`.
