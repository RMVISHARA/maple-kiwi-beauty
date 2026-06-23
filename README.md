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
7. **MySQL Database Blueprint**: Includes `db/schema.sql` outlining table creation scripts and initial product seed records for backend setup.
8. **Node API Route**: `app/api/products/route.js` serves mock data out-of-the-box and includes commented templates showing how to query MySQL using the `mysql2/promise` pool.

---

## 📂 Project Structure

```text
maple-kiwi-beauty/
├── app/
│   ├── layout.js              # Layout with Inter/Playfair Display fonts & Cart Provider
│   ├── page.js                # Main page assembling header, hero, collections, products, & footer
│   ├── globals.css            # Tailwind CSS v4 custom theme tokens & custom scrollbars
│   └── api/
│       └── products/
│           └── route.js       # Node API route template with live MySQL query outline
├── components/
│   ├── Header.js              # Navbar with rotating announcements & live search bar
│   ├── Hero.js                # Hero banner with overlay, WhatsApp CTA, & Shop scroll
│   ├── Collections.js         # Canada (active) & New Zealand (coming soon modal) banners
│   ├── ProductGrid.js         # Concerns filters and sorting selectors
│   ├── ProductCard.js         # Product card with price markers, ratings, & quick-add
│   ├── ProductModal.js        # Detailed benefit drawer (including climate notes)
│   └── CartDrawer.js          # Cart slide-over with progress bar & WhatsApp checkout
├── context/
│   └── CartContext.js         # Cart State Context and LocalStorage persistence
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

## 🗄️ Backend MySQL Integration (For Developers)

To connect this frontend to a live MySQL database:
1. Setup a MySQL database instance.
2. Run the SQL commands in `db/schema.sql` to create tables and insert seed data.
3. Install the MySQL driver package in this folder:
   ```bash
   npm install mysql2
   ```
4. Create a `.env.local` file in the root directory and add your credentials:
   ```env
   MYSQL_HOST=localhost
   MYSQL_USER=your_db_username
   MYSQL_PASSWORD=your_db_password
   MYSQL_DATABASE=maple_kiwi_beauty
   ```
5. Open `app/api/products/route.js`, uncomment the live database connection code block, and replace the return statement to serve live database rows.
