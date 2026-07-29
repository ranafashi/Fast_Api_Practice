# E-Commerce API

A FastAPI backend for an e-commerce platform. It manages products, users, authentication, shopping carts, and orders, backed by MongoDB.

## Features

- 🛍️ **Product management** — create, list, and manage products with categories, pricing, stock, and images
- 👤 **User accounts** — registration with addresses and role support (`customer` by default)
- 🔐 **Authentication** — JWT-based auth (PyJWT) with Argon2 password hashing
- 🛒 **Shopping cart** — add items, update quantities, and manage per-user carts
- 📦 **Orders** — place orders with line items, totals, and status tracking
- 📧 **Email** — SMTP-based email notifications
- 🌐 **CORS** — configured for a Vite frontend 

## Tech Stack

- **Framework:** FastAPI 0.139
- **Database:** MongoDB (PyMongo)
- **Auth:** PyJWT + Argon2 (argon2-cffi)
- **Config:** Pydantic Settings (`.env`)
- **Server:** Uvicorn
- **Deployment:** Procfile included

## Project Structure

```
.
├── core/
│   ├── email_utils.py   # SMTP email helpers
│   └── security.py      # JWT, password hashing, auth logic
├── files/               # File-handling logic
├── frontend/            # Frontend (Vite)
├── log/                 # Logging
├── routers/             # API routes: products, users, carts, orders
├── uploads/             # Uploaded files
├── config.py            # Settings loaded from .env
├── db_config.py         # MongoDB client and collections
├── main.py              # App entry point, CORS, router registration
├── models.py            # Pydantic data models
├── Procfile             # Deployment process file
└── requirements.txt     # Python dependencies
```

### Database Collections

The app uses four MongoDB collections: `Products`, `Users`, `Carts`, and `Orders`. Unique indexes are created on product `id` and user `email` at startup.

## Getting Started

### Prerequisites

- Python 3.10+
- A MongoDB connection string (e.g. MongoDB Atlas)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/ranafashi/Fast_Api_Practice.git
   cd Fast_Api_Practice
   ```

2. Create and activate a virtual environment
   ```bash
   python -m venv venv
   source venv/bin/activate      # On Windows: venv\Scripts\activate
   ```

3. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file (see below), then start the server
   ```bash
   uvicorn main:app --reload
   ```

The API runs at `http://127.0.0.1:8000`, with interactive docs at `http://127.0.0.1:8000/docs`.

## Environment Variables

Create a `.env` file in the project root:

```env
mongodb_url=<your-mongodb-connection-string>
database_name=<your-database-name>

SECRET_KEY=<your-jwt-secret-key>
ALGORITHM=HS256
EXP_TIME=<token-expiry-in-minutes>

SMTP_HOST=<smtp-host>
SMTP_PORT=<smtp-port>
SMTP_USER=<smtp-username>
SMTP_PASSWORD=<smtp-password>
NOTIFY_EMAIL=<notification-recipient-email>

# Optional: comma-separated list of allowed frontend origins
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

> ⚠️ Never commit your `.env` file. Make sure it's listed in `.gitignore`.

## API Endpoints

| Area      | Router               |
|-----------|----------------------|
| Products  | `product_router`     |
| Users     | `user_routers`       |
| Carts     | `cart_router`        |
| Orders    | `order_router`       |

A welcome message is served at the root path `/`. Full, always-up-to-date endpoint documentation is auto-generated:

- **Swagger UI:** `/docs`
- **ReDoc:** `/redoc`

## Deployment

A `Procfile` is included for platforms like Railway, Render, or Heroku. Set all environment variables in your host's dashboard before deploying, and add your deployed frontend URL to `ALLOWED_ORIGINS`.

## License

<Add a license, e.g. MIT — or remove this section.>
