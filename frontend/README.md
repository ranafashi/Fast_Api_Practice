# BRANDIAYA — Frontend

React + Vite + TypeScript storefront for the FastAPI + MongoDB backend in this repo.

## Tech stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | React 19 + Vite | Fast DX, simple SPA that mirrors your REST API |
| Routing | React Router 7 | Public / customer / admin route trees |
| State | Zustand | Lightweight auth + cart stores (no Redux boilerplate) |
| HTTP | Axios | Interceptors for JWT, form login, and 401 handling |
| Charts | Recharts | Admin bar charts for `/get_user_count` and `/get_avg_age` |
| Toasts | react-hot-toast | Consistent API error/success feedback |

## Quick start

```bash
# Terminal 1 — backend (from Project root)
uvicorn main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:5173  
API base URL is set in `.env` as `VITE_API_BASE_URL=http://127.0.0.1:8000`.

CORS for the Vite origin is enabled in `main.py`.

## Architecture blueprint

```
frontend/src
├── api/                 # Thin Axios wrappers per domain
│   ├── client.ts        # Instance + JWT + login form encoding + 401 hook
│   ├── auth.ts          # /add_user, /login, /me
│   ├── products.ts      # product CRUD + category filters
│   ├── cart.ts          # protected cart endpoints
│   └── admin.ts         # users + analytics aggregations
├── store/
│   ├── authStore.ts     # token, user, hydrate, login/logout
│   └── cartStore.ts     # items, total, drawer open state
├── components/
│   ├── layout/          # Navbar, AppLayout
│   ├── auth/            # ProtectedRoute, AdminRoute
│   ├── catalog/         # ProductCard
│   └── cart/            # CartDrawer
├── pages/
│   ├── CatalogPage      # Public catalog
│   ├── LoginPage / SignupPage
│   ├── CartPage / ProfilePage   # Customer (JWT)
│   └── admin/*          # Dashboard, Products, Users, Analytics
├── types/               # Mirrors backend Pydantic models
└── utils/errors.ts      # Maps 400/401/403/404/422 detail strings
```

### Layout tree

```
Public
├── /              Catalog (GET /products)
├── /login         OAuth2 form login
└── /signup        POST /add_user

Customer (Bearer token)
├── /cart          Cart page + drawer (GET/POST/PUT/DELETE /cart*)
└── /profile       GET /me

Admin (role === "admin")
└── /admin
    ├── /              Overview tiles
    ├── /products      POST/PUT/DELETE /product*
    ├── /users         GET/DELETE users
    └── /analytics     Charts for city aggregations
```

## Authentication handler

1. **Login** (`POST /login`) sends `application/x-www-form-urlencoded` with:
   - `username` = user email
   - `password` = password  
   Matching FastAPI `OAuth2PasswordRequestForm`.
2. Token is stored in `localStorage` as `access_token`.
3. Request interceptor attaches `Authorization: Bearer <token>` on every call.
4. Response interceptor on **401** clears the token and resets auth state (session expired / invalid credentials).

## API error handling

| Status | Backend examples | UI behavior |
| --- | --- | --- |
| 400 | Not enough stock, Product already exists, Duplicate ids, User already exists | Toast with friendly mapped message |
| 401 | Invalid credentials, Invalid token | Clear session + prompt to sign in |
| 403 | Admin access requires | Redirect away from admin routes |
| 404 | User not found, Item not in cart, empty product list | Toast / empty states |
| 422 | Pydantic validation | Show validation detail |

## Cart notes (backend-compatible)

- Cart line items use `product_id` (as stored by `cart_functions`), not the Pydantic `CartItem.id` field name.
- `AddToCart` sends `{ product_id, product_name, quantity }`.
- Quantity updates use `PUT` only when `quantity > 0`. Removal uses `DELETE /cart/items/{product_id}` because `UpdateQuantity` validates `quantity > 0`.

## Admin analytics

- `/get_user_count` → `{ _id: city, UsersCount }` → bar chart (users per city)
- `/get_avg_age` → `{ _id: city, AvgUserAge }` → bar chart (average age)
- `/get_users_cities` → table of name / age / city

## Product images

- Optional `image_url` on each product
- `GET /product_image?id=1` — returns stored/resolved photo URL
- Name-based Openverse resolution (with LoremFlickr fallback)
- Catalog, cart, and admin table render these images

## Orders / checkout

- `POST /orders/checkout` — place order from cart (stock deduction + email notify for customers)
- `GET /orders` — list current user's orders
- `GET /orders/{order_id}` — order detail
- Frontend: Cart **Place order**, nav **Orders**, `/orders` and `/orders/:orderId`

## Creating an admin user

Sign-up defaults to `role: "customer"`. Promote a user in MongoDB:

```js
db.Users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

Then sign in again to access `/admin`.
