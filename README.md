
## 📋 Overview

**Online Store** is a full-featured e-commerce platform for selling digital products (guides, templates, courses) and services (migration consulting, education advisory, travel assistance). Built with modern web technologies, it provides a seamless experience for customers and administrators.

**Live Demo:** 

---

## ✨ Features

### 👤 Customers
- **Authentication** – Sign up, login, logout
- **Product Catalog** – Browse products with categories and featured items
- **Shopping Cart** – Add/remove items, update quantities (guest + logged-in)
- **Favourites** – Save products for later
- **Order History** – View past orders with status tracking
- **Digital Downloads** – Download purchased files with usage quotas
- **Quick View** – Preview products without leaving the page

### 👑 Admin
- **Dashboard** – Overview of orders, revenue, and activity
- **Product Management** – Add, edit, delete products
- **Order Management** – View orders, update status
- **Document Management** – Grant download refills
- **User Management** – Promote users to admin

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **State** | React Context, TanStack Query |
| **Backend** | Supabase (PostgreSQL + Auth) |
| **Payments** | Paystack |
| **Email** | Resend |
| **Hosting** | Vercel |

---

## 📊 Database Schema

| Table | Purpose |
| :--- | :--- |
| `profiles` | User profiles |
| `products` | Product catalog |
| `cart_items` | Shopping cart |
| `favourites` | Wishlist |
| `paystack_orders` | Order records |
| `documents` | Digital downloads |
| `user_roles` | Admin roles |

All tables have Row Level Security (RLS) enabled.

