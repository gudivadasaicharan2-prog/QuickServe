# 🍽️ Restaurant Management System

> A full-stack, QR-code-driven restaurant management system featuring a customer-facing ordering website and an owner administration dashboard — powered by Spring Boot and React.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup (Customer)](#frontend-setup-customer)
  - [Frontend Setup (Owner)](#frontend-setup-owner)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Database](#database)
- [Team](#team)
- [License](#license)

---

## Overview

The **Restaurant Management System (RMS)** is a real-world full-stack application that digitizes restaurant operations. Customers scan a QR code on their table to browse the menu, add items to a cart, and place orders — all without a waiter. The restaurant owner manages everything from a secure, real-time dashboard.

---

## Features

### 🪑 Customer Website
- Scan QR code → instantly access the digital menu
- Browse menu by category
- View item details (name, image, description, price)
- Add items to cart with custom cooking instructions
- Place orders linked to the table number
- Request services: call waiter, request cutlery, tissue, or bill

### 🖥️ Owner Dashboard
- Secure login with JWT authentication
- View all incoming orders with table number, time, items, and cooking notes
- Update order status (Pending → In Progress → Served)
- Manage customer service requests
- Full menu management: add, edit, delete items; change image, price, availability
- Full category management: add, rename, delete categories

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Backend Language | Java | 21 |
| Backend Framework | Spring Boot | 3.x |
| Build Tool | Maven | 3.9+ |
| ORM | Spring Data JPA + Hibernate | - |
| Security | Spring Security + JWT | - |
| Database | MySQL | 8.x |
| Frontend Framework | React | 18+ |
| Frontend Styling | Tailwind CSS | 3.x |
| HTTP Client | Axios | - |

---

## Project Structure

```
restaurant-system/
├── backend/              # Spring Boot REST API
├── frontend-customer/    # React — Customer Website
├── frontend-owner/       # React — Owner Dashboard
├── docs/                 # Project documentation
└── README.md
```

> See [`docs/FOLDER_STRUCTURE.md`](docs/FOLDER_STRUCTURE.md) for the full detailed structure.

---

## Getting Started

### Prerequisites

Make sure the following are installed on your machine:

- [ ] Java 21 (JDK)
- [ ] Maven 3.9+
- [ ] MySQL 8.x (running locally or via Docker)
- [ ] Node.js 20+ and npm
- [ ] Git

---

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-org>/restaurant-system.git
   cd restaurant-system/backend
   ```

2. **Configure the database**
   - Create a MySQL database: `CREATE DATABASE restaurant_db;`
   - Copy `application-dev.properties.example` → `application-dev.properties`
   - Fill in your DB credentials and JWT secret (see [Environment Variables](#environment-variables))

3. **Run the application**
   ```bash
   mvn spring-boot:run
   ```
   The API will be available at: `http://localhost:8080`

---

### Frontend Setup (Customer)

```bash
cd restaurant-system/frontend-customer
npm install
npm run dev
```
Available at: `http://localhost:5173`

---

### Frontend Setup (Owner)

```bash
cd restaurant-system/frontend-owner
npm install
npm run dev
```
Available at: `http://localhost:5174`

---

## Environment Variables

Create `backend/src/main/resources/application-dev.properties` with the following (do **not** commit this file):

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/restaurant_db
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD
spring.jpa.hibernate.ddl-auto=update

# JWT
jwt.secret=YOUR_SUPER_SECRET_KEY_MIN_256_BITS
jwt.expiration=86400000

# File Upload
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB
```

> ⚠️ Never commit credentials to version control. Add `application-dev.properties` to `.gitignore`.

---

## API Documentation

Once the backend is running, the interactive Swagger UI is available at:

```
http://localhost:8080/swagger-ui/index.html
```

The raw OpenAPI spec is at:
```
http://localhost:8080/v3/api-docs
```

> Full endpoint reference: [`docs/API_DESIGN.md`](docs/API_DESIGN.md) *(Phase 2)*

---

## Database

The system uses **MySQL 8.x** with the following core tables:

| Table | Description |
|---|---|
| `users` | Owner credentials |
| `categories` | Menu categories |
| `menu_items` | Menu item records |
| `restaurant_tables` | Physical table records |
| `orders` | Customer orders |
| `order_items` | Items within each order |
| `customer_requests` | Service requests per table |

> Full schema with column definitions and relationships: [`docs/DB_SCHEMA.md`](docs/DB_SCHEMA.md) *(Phase 2)*

---

## Team

| Role | Name |
|---|---|
| Backend Lead & Architect | *Your Name* |
| Frontend Lead | *Teammate's Name* |

---

## License

This project is licensed under the MIT License. See [`LICENSE`](LICENSE) for details.
