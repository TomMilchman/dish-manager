# Dish Manager

A full-stack web application for managing dishes and their ingredients.  
Users can register, log in (via email/username and password), create and edit dishes, assign ingredients with quantities and units, and view an aggregated summary of ingredients across selected dishes.

**Live demo:** [Dish Manager](https://dish-manager-liart.vercel.app) _(Note: the backend may take up to a minute to spin up after inactivity.)_

---

## Features

-User authentication (email/password) with JWT-based access control.
-Protected routes for managing dishes and ingredients.
-CRUD operations for both dishes and ingredients.
-Dynamic aggregation of selected dishes’ ingredients and total costs.
-Responsive React frontend with modals for adding, editing, and deleting dishes.
-Admin-only actions.

---

## Getting Started (Local Setup)

### Prerequisites

-Node.js
-MongoDB (local or remote instance)
-npm

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/TomMilchman/dish-manager.git
    cd dish-manager
    ```

2. **Install dependencies for both server and client:**

    ```bash
    cd server && npm install
    cd ../client && npm install
    ```

3. **Set up .env files for client and server (an .env.example is provided for both)**

4. **Run the project:**

    -Server:

    ```bash
    cd server && npm run dev
    ```

    -Client:

    ```bash
    cd client && npm start
    ```

5. **The app should now be available at `http://localhost:3000`**

### Running With Docker (optional)

Dockerfiles and a docker-compose.yml are provided.
To spin up both services, run:

```bash
docker compose up
```

Make sure your .env files are configured first.

---

### Environment Variables

Set up two `.env` files — one for the **client** (React) and one for the **server** (Node.js). Use the `.env.example` files for reference.

#### Client (`client/.env`)

-**REACT_APP_API_URL** (default: `http://localhost:5000`)  
 The base URL for API requests from the React app.  
 Must start with `REACT_APP_` for Create React App to expose it.

#### Server (`server/.env`)

-**NODE_ENV** (`development` | `production`)  
 Specifies the environment.

-**MONGO_URI** _(required)_  
 Connection string for your MongoDB instance.

-**JWT_SECRET** _(required)_  
 Secret key used for signing/verifying access tokens. Should be a long, random string.

-**REFRESH_SECRET** _(required)_  
Secret key for refresh tokens. Should be different from `JWT_SECRET`.

-**HOST** (default: `http://localhost`)  
Base host URL where the server runs.

-**PORT** (default: `5000`)  
Port the server listens on.

-**CLIENT_URL** (default: `http://localhost:3000`)  
The frontend URL allowed by CORS.

-**ENABLE_FILE_LOGGING** (`true` | `false`)  
 Whether to log to files in addition to console.

-**LOG_DIR**  
 Directory to store logs (only used if file logging is enabled).

-**SMTP_HOST** (default: `smtp.gmail.com`)  
Host for the SMTP server (for email).

-**SMTP_PORT** (default: `465`)  
Port for the SMTP server.

-**SMTP_SECURE** (`true` | `false`)  
Use TLS/SSL for SMTP. Typically `true` for port `465`, `false` for `587`.

-**SMTP_USER** _(required)_  
Email address used to send emails.

-**SMTP_PASS** _(required)_  
App password for SMTP authentication.

---

## Project Structure

```plaintext
dish-manager/
├── server/
│   ├── src/
|   |   ├── config/          # Server setup (DB and SMTP)
|   |   ├── constants/       # Contains the definitions of ingredient tags and color maps for dish cards on the frontend
│   │   ├── controllers/     # Route logic (auth, dishes, ingredients)
│   │   ├── models/          # Mongoose models (User, Dish, Ingredient)
│   │   ├── routes/          # Express routes
│   │   ├── middleware/      # JWT auth, error handling
│   │   ├── schemas/         # Joi input validation schemas
│   │   └── services/        # Mail and authentication services
│   │   └── utils/           # Misc helpers
│   ├── server.js            # App entry point
|   ├── package-lock.json
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── api/             # Server communication endpoints
│   │   ├── components/      # UI components (Dish cards, Modals, etc.)
│   │   ├── pages/           # Dashboard, Auth pages
│   │   ├── store/           # Zustand state management
│   │   ├── hooks/           # React Query hooks
│   │   └── utils/           # Misc helpers
│   ├── public/
|   ├── package-lock.json
│   └── package.json
│
└── README.md
```

---

## Assumptions and Decisions

1. **Authentication:**
   -JWTs used for access control (stored in memory or HTTP-only cookie).
   -Passwords hashed with bcrypt.
2. **Frontend State Management:**
   -Zustand for local UI state (selected dishes, modals).
   -React Query for server state (fetching and caching data).
3. **Database:**
   -MongoDB via Mongoose.
4. **Styling:**
   -Plain CSS (no frameworks).
   -Optimized for responsive design.
5. **Ingredient Aggregation:**
   -Aggregated costs and totals calculated on the frontend for simplicity.
6. **Admin Actions:**
   -Frontend: admins can view/edit/delete all user dishes and manage ingredients.
   -Backend: admin-only routes enforced via middleware.
