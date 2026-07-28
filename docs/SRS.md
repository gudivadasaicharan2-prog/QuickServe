# Software Requirements Specification (SRS)

**Project Name:** Restaurant Management System  
**Version:** 1.0  
**Date:** 2026-07-27  
**Authors:** Backend Lead & Frontend Lead  
**Status:** Draft — Planning Phase

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Actors](#3-actors)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [System Modules](#6-system-modules)
7. [Backend Packages](#7-backend-packages)
8. [System Architecture](#8-system-architecture)
9. [Database Tables](#9-database-tables)

---

## 1. Introduction

### 1.1 Purpose
This document defines the complete software requirements for the **Restaurant Management System (RMS)**, a full-stack web application designed to digitize restaurant operations. It serves as the authoritative reference for developers, testers, and stakeholders.

### 1.2 Scope
The system comprises:
- **Customer Website** — A QR-code-accessible web app for customers to browse the menu, place orders, and make service requests.
- **Owner Dashboard** — A secure admin web app for restaurant owners to manage the menu, monitor orders, and handle customer requests.
- **Shared Backend API** — A single RESTful Spring Boot service that powers both frontend applications.

### 1.3 Definitions & Acronyms

| Term | Definition |
|---|---|
| RMS | Restaurant Management System |
| SRS | Software Requirements Specification |
| API | Application Programming Interface |
| JWT | JSON Web Token — used for owner authentication |
| QR Code | Quick Response code — links a physical table to a digital session |
| DTO | Data Transfer Object — model used to transfer data between layers |
| JPA | Java Persistence API |
| CORS | Cross-Origin Resource Sharing |

### 1.4 Technology Stack

| Layer | Technology |
|---|---|
| Backend Language | Java 21 |
| Backend Framework | Spring Boot 3.x |
| Build Tool | Apache Maven |
| ORM | Spring Data JPA / Hibernate |
| Security | Spring Security + JWT |
| Database | MySQL 8.x |
| Frontend Framework | React 18+ |
| Frontend Styling | Tailwind CSS |
| HTTP Client | Axios |
| IDE (Backend) | IntelliJ IDEA |
| IDE (Frontend) | VS Code |
| API Testing | Postman |
| Version Control | Git / GitHub |

---

## 2. Overall Description

### 2.1 Product Perspective
The RMS replaces paper-based ordering and manual waiter interactions with a self-service digital interface. Customers scan a QR code on their restaurant table to access the system. The owner monitors and manages all operations from a separate, authenticated dashboard.

### 2.2 Product Functions (Summary)
- Digital menu browsing
- Cart and order placement with cooking instructions
- Customer service requests (call waiter, request cutlery, tissue, bill)
- Real-time order visibility for the owner
- Full menu and category CRUD for the owner
- Secure owner authentication via JWT

### 2.3 Assumptions and Dependencies
- Each table has a unique QR code encoding its table number.
- The customer does NOT need to create an account.
- Only the owner (one role) logs in to the dashboard.
- The backend runs on a server accessible by both frontends.
- Image uploads are stored on the server filesystem (dev); cloud storage recommended for production.

---

## 3. Actors

| Actor | Type | Description |
|---|---|---|
| **Customer** | Primary External | A restaurant diner who scans the QR code to access the customer website. No login required. |
| **Owner** | Primary External | The restaurant owner who logs into the dashboard to manage the restaurant. |
| **Waiter / Staff** | Secondary | Receives requests via the dashboard (does not interact with the system directly in v1). |
| **System (Backend API)** | Internal | Processes requests, enforces business rules, and persists data. |
| **Database (MySQL)** | Internal | Stores all persistent data including menu, orders, and requests. |

---

## 4. Functional Requirements

### 4.1 Customer Website

#### 4.1.1 QR Code & Table Session
| ID | Requirement |
|---|---|
| FR-C-01 | The system shall identify the customer's table number from the QR code URL parameter. |
| FR-C-02 | The table number shall be persisted in the browser session for the duration of the visit. |
| FR-C-03 | If no valid table number is present in the URL, the system shall display an appropriate error message. |

#### 4.1.2 Menu Browsing
| ID | Requirement |
|---|---|
| FR-C-04 | The system shall display all available menu categories. |
| FR-C-05 | The system shall display all available menu items within a selected category. |
| FR-C-06 | Unavailable menu items shall be visually indicated and non-orderable. |
| FR-C-07 | Each menu item card shall display: name, image, description, and price. |

#### 4.1.3 Item Detail
| ID | Requirement |
|---|---|
| FR-C-08 | The customer shall be able to tap a menu item to view its full detail. |
| FR-C-09 | The detail view shall show: name, image, description, price, and an "Add to Cart" button. |

#### 4.1.4 Cart Management
| ID | Requirement |
|---|---|
| FR-C-10 | The customer shall be able to add items to a cart. |
| FR-C-11 | The customer shall be able to adjust item quantity from the cart. |
| FR-C-12 | The customer shall be able to remove items from the cart. |
| FR-C-13 | The cart shall display a running total price. |
| FR-C-14 | The customer shall be able to add per-item cooking instructions (e.g., "less spicy", "no onions"). |

#### 4.1.5 Order Placement
| ID | Requirement |
|---|---|
| FR-C-15 | The customer shall be able to place an order with all cart items. |
| FR-C-16 | The placed order shall be associated with the customer's table number. |
| FR-C-17 | The order shall include item quantities, cooking instructions, and a timestamp. |
| FR-C-18 | Upon successful order placement, the customer shall see a confirmation message. |
| FR-C-19 | The cart shall be cleared after a successful order is placed. |

#### 4.1.6 Service Requests
| ID | Requirement |
|---|---|
| FR-C-20 | The customer shall be able to send a "Call Waiter" request. |
| FR-C-21 | The customer shall be able to send a "Request Cutlery" request. |
| FR-C-22 | The customer shall be able to send a "Request Tissue" request. |
| FR-C-23 | The customer shall be able to send a "Request Bill" request. |
| FR-C-24 | All service requests shall include the table number and a timestamp. |
| FR-C-25 | The system shall prevent duplicate active requests of the same type for the same table. |

---

### 4.2 Owner Dashboard

#### 4.2.1 Authentication
| ID | Requirement |
|---|---|
| FR-O-01 | The owner shall log in using an email address and password. |
| FR-O-02 | The system shall return a JWT token upon successful authentication. |
| FR-O-03 | All owner dashboard API routes shall require a valid JWT token. |
| FR-O-04 | The system shall reject invalid or expired JWT tokens with HTTP 401. |
| FR-O-05 | The owner shall be able to log out, invalidating the local session token. |

#### 4.2.2 Order Management
| ID | Requirement |
|---|---|
| FR-O-06 | The owner shall be able to view all orders, sorted by most recent first. |
| FR-O-07 | Each order entry shall display: table number, order time, items, quantities, cooking instructions, and order status. |
| FR-O-08 | The owner shall be able to update the status of an order (e.g., Pending → In Progress → Served). |
| FR-O-09 | The owner shall be able to filter orders by status. |

#### 4.2.3 Customer Requests
| ID | Requirement |
|---|---|
| FR-O-10 | The owner shall see all pending customer service requests. |
| FR-O-11 | Each request entry shall show: table number, request type, and timestamp. |
| FR-O-12 | The owner shall be able to mark a request as resolved/handled. |

#### 4.2.4 Menu Management
| ID | Requirement |
|---|---|
| FR-O-13 | The owner shall be able to add a new menu item with: name, description, price, category, image, and availability status. |
| FR-O-14 | The owner shall be able to edit any field of an existing menu item. |
| FR-O-15 | The owner shall be able to delete a menu item. |
| FR-O-16 | The owner shall be able to upload or replace the image of a menu item. |
| FR-O-17 | The owner shall be able to toggle the availability of a menu item (Available / Unavailable). |

#### 4.2.5 Category Management
| ID | Requirement |
|---|---|
| FR-O-18 | The owner shall be able to add a new menu category. |
| FR-O-19 | The owner shall be able to rename an existing category. |
| FR-O-20 | The owner shall be able to delete a category. |
| FR-O-21 | Deleting a category shall warn the owner if menu items are linked to it. |

---

## 5. Non-Functional Requirements

### 5.1 Performance
| ID | Requirement |
|---|---|
| NFR-01 | API responses for menu browsing (read operations) shall complete within **500ms** under normal load. |
| NFR-02 | Order placement shall complete within **1 second** under normal load. |
| NFR-03 | The customer website shall achieve a Lighthouse performance score of ≥ 80. |

### 5.2 Security
| ID | Requirement |
|---|---|
| NFR-04 | All owner API endpoints shall be protected by JWT-based authentication. |
| NFR-05 | Passwords shall be stored using **BCrypt** hashing. |
| NFR-06 | The API shall enforce CORS, allowing only approved frontend origins. |
| NFR-07 | SQL injection shall be prevented via JPA parameterized queries. |
| NFR-08 | Sensitive configuration (DB credentials, JWT secret) shall not be committed to version control. |

### 5.3 Usability
| ID | Requirement |
|---|---|
| NFR-09 | The customer website shall be fully responsive and usable on mobile devices (minimum 360px viewport). |
| NFR-10 | The owner dashboard shall be responsive and usable on tablets and desktops. |
| NFR-11 | Error messages shall be clear, user-friendly, and actionable. |
| NFR-12 | All interactive elements shall have visible feedback states (hover, loading, success, error). |

### 5.4 Reliability & Availability
| ID | Requirement |
|---|---|
| NFR-13 | The backend shall handle unexpected errors gracefully via a global exception handler. |
| NFR-14 | The system shall return meaningful HTTP status codes for all API responses. |

### 5.5 Maintainability
| ID | Requirement |
|---|---|
| NFR-15 | The backend shall follow a layered architecture (Controller → Service → Repository). |
| NFR-16 | All DTOs shall decouple the API contract from internal entity models. |
| NFR-17 | The codebase shall follow consistent naming conventions (camelCase for Java, PascalCase for React components). |
| NFR-18 | API documentation shall be auto-generated via Swagger / SpringDoc OpenAPI. |

### 5.6 Scalability
| ID | Requirement |
|---|---|
| NFR-19 | The backend shall be stateless (no server-side sessions), enabling horizontal scaling. |
| NFR-20 | Image storage shall be designed to be swappable to cloud storage (e.g., AWS S3) without refactoring business logic. |

---

## 6. System Modules

| # | Module | Application | Description |
|---|---|---|---|
| 1 | **Authentication Module** | Owner Dashboard + Backend | Owner login, JWT generation, token validation, logout. |
| 2 | **Menu Module** | Customer + Owner + Backend | Display, add, edit, delete, and manage availability of menu items. |
| 3 | **Category Module** | Customer + Owner + Backend | Group menu items by category; full CRUD for owner. |
| 4 | **Cart Module** | Customer (Frontend only) | Manage cart state, quantities, cooking instructions, and order total. |
| 5 | **Order Module** | Customer + Owner + Backend | Place orders, track status, view orders with all details. |
| 6 | **Service Request Module** | Customer + Owner + Backend | Customer sends requests (waiter/cutlery/tissue/bill); owner views and resolves them. |
| 7 | **Table Module** | Backend | Manage table identifiers; associate QR codes with table numbers. |
| 8 | **Image Upload Module** | Owner + Backend | Upload, store, and serve menu item images. |
| 9 | **Notification / Real-time Module** *(Future)* | Owner Dashboard | Push new order / request alerts to the dashboard in real time. |
| 10 | **QR Code Module** *(Future)* | Backend / Admin | Generate per-table QR codes encoding the table URL. |

---

## 7. Backend Packages

```
com.restaurant
│
├── config          → Security, CORS, OpenAPI/Swagger, application-wide beans
├── controller      → REST API endpoints (@RestController)
├── service         → Business logic (@Service)
├── repository      → Database access via Spring Data JPA (@Repository)
├── model           → JPA entity classes (@Entity)
├── dto
│   ├── request     → Incoming API request payloads
│   └── response    → Outgoing API response payloads
├── exception       → Custom exceptions + @ControllerAdvice global handler
├── security        → JWT provider, filter, UserDetailsService implementation
└── util            → Stateless utility/helper classes (image upload, QR code, etc.)
```

### Package Responsibilities

| Package | Key Responsibilities |
|---|---|
| `config` | `SecurityConfig` (Spring Security chains), `CorsConfig`, `OpenApiConfig` (Swagger UI) |
| `controller` | Input validation, HTTP mapping, delegating to service layer |
| `service` | Business rules, transaction management, mapping entities ↔ DTOs |
| `repository` | JPA CRUD + custom JPQL/native queries |
| `model` | Entity definitions, relationships, constraints |
| `dto.request` | `@Valid` annotated request bodies received from clients |
| `dto.response` | Shaped response objects returned to clients |
| `exception` | `ResourceNotFoundException`, `UnauthorizedException`, `GlobalExceptionHandler` |
| `security` | `JwtTokenProvider`, `JwtAuthenticationFilter`, `UserDetailsServiceImpl` |
| `util` | `ImageUploadUtil`, `QrCodeUtil` — pure helper logic |

---

## 8. System Architecture

### 8.1 Architecture Style
**Layered (N-Tier) REST Architecture** — the industry standard for Spring Boot + React applications.

```
┌─────────────────────────────────────────┐
│           CLIENT LAYER                  │
│  ┌─────────────────┐ ┌───────────────┐  │
│  │ Customer Website│ │ Owner Dashboard│  │
│  │   (React + TW)  │ │  (React + TW) │  │
│  └────────┬────────┘ └──────┬────────┘  │
│           │   HTTP/HTTPS    │            │
└───────────┼─────────────────┼───────────┘
            │                 │
            ▼                 ▼
┌─────────────────────────────────────────┐
│           API GATEWAY LAYER             │
│         Spring Boot REST API            │
│    (CORS Filter → JWT Filter → ...)     │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│           CONTROLLER LAYER              │
│  @RestController — HTTP request mapping │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│            SERVICE LAYER                │
│  @Service — Business logic, validation  │
│             DTO ↔ Entity mapping        │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│          REPOSITORY LAYER               │
│  Spring Data JPA — DB abstraction       │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│           DATA LAYER                    │
│         MySQL 8.x Database              │
└─────────────────────────────────────────┘
```

### 8.2 Key Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| API Style | RESTful JSON API | Industry standard; simple for both frontends to consume |
| Auth Mechanism | JWT (Stateless) | No server session needed; scales horizontally |
| Separation of Concerns | Controller / Service / Repository | Testability, maintainability, single responsibility |
| DTOs vs. Entities | Always use DTOs at API boundary | Prevents over-exposure of DB schema; decouples API contract |
| Image Storage (Dev) | Server filesystem | Simple for local development |
| Image Storage (Prod) | AWS S3 / Cloudinary *(recommended)* | Scalable, CDN-ready |
| Frontend Communication | Axios with interceptors | Centralizes auth header injection and error handling |
| Cross-Origin | Explicit CORS configuration | Required since frontend and backend run on different origins |

### 8.3 Request Flow — Customer Places an Order

```
Customer → [QR Scan] → Customer Website (React)
  → Adds items to Cart (local state)
  → Clicks "Place Order"
  → POST /api/orders  (Axios → backend)
  → CORS Filter passes request
  → JWT Filter: no token required (public route)
  → OrderController.placeOrder()
  → OrderService.createOrder()  → validates table, items
  → OrderRepository.save()  → MySQL
  → Response: OrderResponse (order ID, status)
  → Customer sees confirmation screen
```

### 8.4 Request Flow — Owner Views Orders

```
Owner → Login Page → POST /api/auth/login
  → AuthController → AuthService → BCrypt verify
  → JWT issued → stored in browser localStorage
  → GET /api/orders (Authorization: Bearer <token>)
  → JwtAuthenticationFilter validates token
  → OrderController.getAllOrders()
  → OrderService.getAllOrders()
  → OrderRepository.findAll()
  → Response: List<OrderResponse>
  → Owner Dashboard renders order list
```

---

## 9. Database Tables

> SQL schema, column definitions, and relationships are documented in `DB_SCHEMA.md` (Phase 2).  
> The following are the **table names** and their purpose.

| # | Table Name | Purpose |
|---|---|---|
| 1 | `users` | Stores owner credentials (email, hashed password, role) |
| 2 | `categories` | Menu categories (e.g., Starters, Mains, Drinks, Desserts) |
| 3 | `menu_items` | Individual menu items with name, description, price, image URL, availability |
| 4 | `restaurant_tables` | Physical restaurant tables with their QR-code identifiers |
| 5 | `orders` | Customer orders linked to a table, with status and timestamp |
| 6 | `order_items` | Line items within an order — links order to menu item with quantity and cooking notes |
| 7 | `customer_requests` | Service requests (waiter call, cutlery, tissue, bill) per table with status |

### Key Relationships
- `menu_items` → `categories` (Many-to-One)
- `orders` → `restaurant_tables` (Many-to-One)
- `order_items` → `orders` (Many-to-One)
- `order_items` → `menu_items` (Many-to-One)
- `customer_requests` → `restaurant_tables` (Many-to-One)
