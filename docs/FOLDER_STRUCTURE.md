# Project Folder Structure

```
restaurant-system/
│
├── backend/                            # Spring Boot Application (Maven)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/
│   │   │   │       └── restaurant/
│   │   │   │           ├── RestaurantApplication.java
│   │   │   │           │
│   │   │   │           ├── config/                    # App-wide configuration
│   │   │   │           │   ├── SecurityConfig.java
│   │   │   │           │   ├── CorsConfig.java
│   │   │   │           │   └── OpenApiConfig.java
│   │   │   │           │
│   │   │   │           ├── controller/                # REST Controllers (API layer)
│   │   │   │           │   ├── AuthController.java
│   │   │   │           │   ├── MenuController.java
│   │   │   │           │   ├── CategoryController.java
│   │   │   │           │   ├── OrderController.java
│   │   │   │           │   ├── OrderItemController.java
│   │   │   │           │   ├── TableController.java
│   │   │   │           │   └── RequestController.java
│   │   │   │           │
│   │   │   │           ├── service/                   # Business logic layer
│   │   │   │           │   ├── AuthService.java
│   │   │   │           │   ├── MenuService.java
│   │   │   │           │   ├── CategoryService.java
│   │   │   │           │   ├── OrderService.java
│   │   │   │           │   ├── OrderItemService.java
│   │   │   │           │   ├── TableService.java
│   │   │   │           │   └── RequestService.java
│   │   │   │           │
│   │   │   │           ├── repository/                # Spring Data JPA Repositories
│   │   │   │           │   ├── UserRepository.java
│   │   │   │           │   ├── MenuItemRepository.java
│   │   │   │           │   ├── CategoryRepository.java
│   │   │   │           │   ├── OrderRepository.java
│   │   │   │           │   ├── OrderItemRepository.java
│   │   │   │           │   ├── TableRepository.java
│   │   │   │           │   └── CustomerRequestRepository.java
│   │   │   │           │
│   │   │   │           ├── model/                     # JPA Entity classes
│   │   │   │           │   ├── User.java
│   │   │   │           │   ├── MenuItem.java
│   │   │   │           │   ├── Category.java
│   │   │   │           │   ├── Order.java
│   │   │   │           │   ├── OrderItem.java
│   │   │   │           │   ├── RestaurantTable.java
│   │   │   │           │   └── CustomerRequest.java
│   │   │   │           │
│   │   │   │           ├── dto/                       # Data Transfer Objects
│   │   │   │           │   ├── request/
│   │   │   │           │   │   ├── LoginRequest.java
│   │   │   │           │   │   ├── MenuItemRequest.java
│   │   │   │           │   │   ├── CategoryRequest.java
│   │   │   │           │   │   ├── OrderRequest.java
│   │   │   │           │   │   └── CustomerRequestDto.java
│   │   │   │           │   └── response/
│   │   │   │           │       ├── AuthResponse.java
│   │   │   │           │       ├── MenuItemResponse.java
│   │   │   │           │       ├── CategoryResponse.java
│   │   │   │           │       ├── OrderResponse.java
│   │   │   │           │       └── ApiResponse.java
│   │   │   │           │
│   │   │   │           ├── exception/                 # Custom exceptions & global handler
│   │   │   │           │   ├── ResourceNotFoundException.java
│   │   │   │           │   ├── UnauthorizedException.java
│   │   │   │           │   └── GlobalExceptionHandler.java
│   │   │   │           │
│   │   │   │           ├── security/                  # JWT & Spring Security utilities
│   │   │   │           │   ├── JwtTokenProvider.java
│   │   │   │           │   ├── JwtAuthenticationFilter.java
│   │   │   │           │   └── UserDetailsServiceImpl.java
│   │   │   │           │
│   │   │   │           └── util/                      # Utility / helper classes
│   │   │   │               ├── ImageUploadUtil.java
│   │   │   │               └── QrCodeUtil.java
│   │   │   │
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       ├── application-dev.properties
│   │   │       ├── application-prod.properties
│   │   │       └── static/
│   │   │           └── uploads/                       # Uploaded menu item images
│   │   │
│   │   └── test/
│   │       └── java/
│   │           └── com/
│   │               └── restaurant/
│   │                   ├── controller/
│   │                   ├── service/
│   │                   └── repository/
│   │
│   └── pom.xml
│
├── frontend-customer/                  # React App — Customer-facing website
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── assets/                    # Images, icons, fonts
│   │   ├── components/                # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── MenuItem.jsx
│   │   │   ├── CartDrawer.jsx
│   │   │   ├── RequestPanel.jsx
│   │   │   └── OrderSummary.jsx
│   │   ├── pages/                     # Route-level pages
│   │   │   ├── MenuPage.jsx
│   │   │   ├── ItemDetailPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   └── OrderConfirmationPage.jsx
│   │   ├── services/                  # Axios API calls
│   │   │   ├── menuService.js
│   │   │   ├── orderService.js
│   │   │   └── requestService.js
│   │   ├── store/                     # State management (Context API or Redux)
│   │   │   ├── CartContext.jsx
│   │   │   └── TableContext.jsx
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── utils/                     # Helper functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── frontend-owner/                    # React App — Owner Dashboard
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── OrderCard.jsx
│   │   │   ├── MenuItemForm.jsx
│   │   │   ├── CategoryForm.jsx
│   │   │   └── RequestBadge.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── OrdersPage.jsx
│   │   │   ├── MenuPage.jsx
│   │   │   ├── CategoriesPage.jsx
│   │   │   └── RequestsPage.jsx
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── menuService.js
│   │   │   ├── orderService.js
│   │   │   ├── categoryService.js
│   │   │   └── requestService.js
│   │   ├── store/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── utils/
│   │   │   └── axiosInstance.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── docs/                              # All project documentation
│   ├── SRS.md
│   ├── FOLDER_STRUCTURE.md
│   ├── API_DESIGN.md                  # (Phase 2 — API endpoint reference)
│   ├── DB_SCHEMA.md                   # (Phase 2 — Full ERD & SQL)
│   └── diagrams/
│       ├── use-case-diagram.png
│       ├── er-diagram.png
│       └── architecture-diagram.png
│
├── .gitignore
└── README.md
```

---

## Notes

- `backend/` and both `frontend-*` directories are **independent projects** with their own Git-tracked dependencies.
- The two frontend apps share **no code** but can share a common Axios base URL pointed at the single backend.
- `docs/` is the single source of truth for all documentation.
- Uploaded images (menu item photos) are stored under `backend/src/main/resources/static/uploads/` during development; an S3/cloud storage bucket is recommended for production.
