
## 1. Project Title and Description

### **PulseCare — Full-Stack Healthcare Management System**

PulseCare is a modern web application built to serve healthcare providers and clinical administrators. The platform provides an integrated solution to:
* **User Authentication & Multi-Tenancy:** Provide secure practitioner registration and login with encrypted credentials and token-based session management.
* **Patient Management:** Enable practitioners to create, view, update, and manage comprehensive patient records (demographics, medical histories, contact details) with strict data ownership.
* **Doctor Directory:** Maintain a centralized, hospital-wide directory of medical specialists across various departments (Cardiology, Neurology, Pediatrics, etc.).
* **Patient-Doctor Assignments:** Seamlessly map and link medical specialists to individual patients, preventing duplicate assignments and enabling coordinated care teams.

---

## 2. Tech Stack

The application leverages a modern, decoupled full-stack architecture:

| Technology | Layer / Role | Purpose in Project |
|---|---|---|
| **React.js** (v18+) | Frontend Library | Component-driven Single Page Application (SPA), state management, dynamic UI rendering |
| **Node.js** (v18+/v20+) | Runtime Environment | High-performance asynchronous JavaScript runtime for the backend server |
| **Express.js** (v4.x) | Backend Web Framework | RESTful API routing, middleware execution, request parsing, and error handling |
| **PostgreSQL** (v14+) | Relational Database | ACID-compliant relational data storage, foreign key integrity, and relational indexing |
| **Sequelize** (v6.x) | Object-Relational Mapper (ORM) | Schema definitions, model associations, migrations/synchronization, parameterized queries |
| **JWT (`jsonwebtoken`)** | Authentication & Security | Stateless, signed JSON Web Tokens for secure Bearer authorization across requests |
| **bcrypt (`bcryptjs`)** | Security & Cryptography | One-way cryptographic password hashing with 10 salt rounds before database persistence |
| **Axios** | HTTP Client | Promise-based client with centralized request interceptors for JWT injection and 401 error interceptors |

---

## 3. Features

### 🔐 User Registration & Login (Authentication)
* **Practitioner Sign-Up:** Create authorized clinical accounts with email and password.
* **Secure Login:** Authenticate with JWT issuance and automatic credential verification.
* **Session Persistence:** Tokens stored securely in `localStorage` with automatic profile verification on page reload.
* **Protected Routes:** Frontend route guards (`ProtectedRoute.jsx`) preventing unauthorized access to internal dashboards.

### 👤 Patient Management (CRUD)
* **Create:** Register new patients with full demographics (Name, Age, Gender, Address, Medical Details).
* **Read:** View an isolated list of patients belonging to the logged-in user, including search and detailed care profile views.
* **Update:** Edit existing patient information with modal forms.
* **Delete:** Remove patient records with confirmation dialogs and cascading removal of mappings.
* **Strict Ownership:** Users can only view, edit, or delete patients they created (`userId` isolation).

### 🩺 Doctor Directory (CRUD)
* **Create:** Add new medical specialists with Name, Specialization, Email, and Phone number.
* **Read:** Hospital-wide doctor directory with real-time text search and department/specialization dropdown filters.
* **Update:** Modify doctor details and contact information.
* **Delete:** Remove doctor records with cascading assignment clean-up.
* **Pre-seeded Specialists:** Includes an idempotent seeder (`seedDoctors.js`) pre-populating 8 clinical specialists.

### 🔗 Patient-Doctor Mapping (Assignments)
* **Care Team Assignment:** Assign doctors to patients from the patient detail modal or dedicated assignments hub.
* **Duplicate Prevention:** Unique composite constraint `(patientId, doctorId)` prevents assigning the same doctor twice to a patient.
* **Patient Care Roster:** View all active doctor assignments for each patient.
* **Safe Unassignment:** One-click unassignment with confirmation dialogs.

### ✅ Input Validation
* **Backend Validation:** Implemented using `express-validator` across all routes.
* **Validation Rules:**
  - Email format verification on registration, login, and doctor creation.
  - Required fields, string trimming, and sanitization.
  - Age must be a positive integer (`1` to `120`).
  - Phone numbers strictly validated to 10 digits.
  - Minimum password length (6+ characters).
* **Graceful Feedback:** Clear, human-readable 400 Bad Request error messages returned to the client.

### 🛡️ Authorization & Security
* **JWT Bearer Middleware:** `auth.js` middleware validates token signatures, expiration, and extracts authenticated user context.
* **Strict Data Isolation:** Multi-tenant protection ensuring User A cannot read, modify, or delete User B's patient data or doctor assignments.
* **Password Hashing:** Passwords hashed with `bcryptjs` before storage; raw passwords never logged or saved.

---

## 4. Project Structure

PulseCare is structured cleanly into dedicated `frontend/` and `backend/` directories:

```
whatbytes-heathcareproject/
│
├── backend/                             # Express.js REST API Server
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                    # Database Configuration: PostgreSQL connection via Sequelize
│   │   │
│   │   ├── models/                      # Database Models (Sequelize ORM)
│   │   │   ├── User.js                  # User model (Practitioners, authentication)
│   │   │   ├── Patient.js               # Patient model (Owned by User via userId FK)
│   │   │   ├── Doctor.js                # Doctor model (Hospital directory)
│   │   │   ├── PatientDoctorMapping.js  # Mapping join table (patientId FK, doctorId FK)
│   │   │   └── index.js                 # Model associations (1:M, M:N relationships)
│   │   │
│   │   ├── routes/                      # API Route Definitions
│   │   │   ├── authRoutes.js            # Authentication routes (/api/auth/register, /login, /me)
│   │   │   ├── patientRoutes.js         # Patient routes (/api/patients)
│   │   │   ├── doctorRoutes.js          # Doctor routes (/api/doctors)
│   │   │   └── mappingRoutes.js         # Mapping routes (/api/mappings)
│   │   │
│   │   ├── controllers/                 # Business Logic & Database Queries
│   │   │   ├── authController.js        # Register, login, profile retrieval
│   │   │   ├── patientController.js     # Patient CRUD with strict userId ownership
│   │   │   ├── doctorController.js      # Doctor CRUD & directory handling
│   │   │   └── mappingController.js     # Patient-Doctor assignment logic
│   │   │
│   │   ├── middleware/                  # Custom Express Middlewares
│   │   │   ├── auth.js                  # JWT verification & req.user injection
│   │   │   ├── validate.js              # express-validator result formatter
│   │   │   └── errorHandler.js          # Centralized error & 404 handler
│   │   │
│   │   ├── seeders/
│   │   │   └── seedDoctors.js           # Database seeder for sample doctors & demo user
│   │   │
│   │   ├── app.js                       # Express app configuration, CORS & route binding
│   │   └── server.js                    # Server bootstrap, DB sync, & port listener
│   │
│   ├── test_api.js                      # 25-point automated backend test suite
│   ├── .env                             # Environment variables (port, db credentials, jwt secret)
│   ├── .env.example                     # Sample template for environment variables
│   └── package.json                     # Backend dependencies & run scripts
│
├── frontend/                            # React.js Single Page Application (Vite)
│   ├── src/
│   │   ├── components/                  # Reusable UI Components
│   │   │   ├── Navbar.jsx               # Top header with user profile & logout
│   │   │   ├── Sidebar.jsx              # Navigation menu
│   │   │   ├── ProtectedRoute.jsx       # Route guard checking authentication state
│   │   │   ├── Modal.jsx                # Accessible modal dialog container
│   │   │   ├── ConfirmDialog.jsx        # Deletion confirmation modal
│   │   │   ├── Alert.jsx                # Dismissible feedback alerts
│   │   │   ├── StatCard.jsx             # KPI statistic summary cards
│   │   │   └── DoctorBadge.jsx          # Color-coded medical specialization pills
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # React Context for global auth state & actions
│   │   │
│   │   ├── services/                    # API Service Layer (Axios)
│   │   │   ├── api.js                   # Central Axios instance with JWT interceptor
│   │   │   ├── authService.js           # Auth endpoint calls (login, register, getProfile)
│   │   │   ├── patientService.js        # Patient CRUD endpoint calls
│   │   │   ├── doctorService.js         # Doctor CRUD endpoint calls
│   │   │   └── mappingService.js        # Mapping assignment endpoint calls
│   │   │
│   │   ├── pages/                       # Application Views / Screens
│   │   │   ├── Login.jsx                # Sign in page
│   │   │   ├── Register.jsx             # Practitioner registration page
│   │   │   ├── Dashboard.jsx            # Executive KPI overview & quick actions
│   │   │   ├── PatientsList.jsx         # Patient roster with search & CRUD modals
│   │   │   ├── PatientDetail.jsx        # Patient care profile & assigned doctors
│   │   │   ├── DoctorsList.jsx          # Doctor directory with filters & CRUD modals
│   │   │   └── MappingsList.jsx         # Assignment hub for managing patient-doctor links
│   │   │
│   │   ├── App.jsx                      # React Router configuration
│   │   ├── main.jsx                     # Application entry point
│   │   └── index.css                    # Design system styles & responsive utilities
│   │
│   ├── index.html                       # HTML5 entry template
│   ├── vite.config.js                   # Vite bundler config with /api proxy
│   └── package.json                     # Frontend dependencies & scripts
│
├── postman/                             # API Testing Documentation
│   ├── Healthcare_Management_System.postman_collection.json # Exported Postman collection
│   └── README.md                        # Postman guide
│
└── README.md                            # Main project documentation
```

---

## 5. Working Flow of Project and How Data Travels

### 🔄 End-to-End Architecture & Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT BROWSER (Vite + React)                        │
│                                                                                  │
│   React UI Components  ──►  React Context (Auth)  ──►  Axios Service Layer       │
│   (Pages / Modals)                                     (Attaches Bearer JWT)     │
└───────────────────────────────────────┬──────────────────────────────────────────┘
                                        │ HTTP / JSON Request
                                        ▼ (via Vite Proxy /api -> :5000)
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             BACKEND (Node.js + Express)                          │
│                                                                                  │
│  1. Express Routing: Matches path (/api/patients, /api/doctors, /api/mappings)  │
│  2. Middleware:                                                                  │
│     ├── CORS & Body Parser (Express JSON)                                        │
│     ├── auth.js: Verifies JWT token via jwt.verify(), attaches req.user          │
│     └── validate.js: Checks express-validator rules (age, email, required)       │
│  3. Controller: Executes business logic & enforces user ownership (req.user.id)  │
│  4. Sequelize ORM: Translates queries to SQL & checks relational constraints     │
└───────────────────────────────────────┬──────────────────────────────────────────┘
                                        │ Parameterized SQL Queries
                                        ▼ (Port 5432)
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             POSTGRESQL DATABASE                                  │
│                                                                                  │
│   [users] ──(1:N)──► [patients] ──(1:N)──► [patient_doctor_mappings] ◄──(N:1)─── │
│                                                                      [doctors]   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 📋 Step-by-Step Data Lifecycle

1. **User Authentication Flow:**
   - User inputs email and password on the React login screen.
   - Axios sends `POST /api/auth/login` to the Express backend.
   - Controller checks if user exists in the `users` table via Sequelize.
   - `bcrypt.compare()` compares the plain password against the stored bcrypt hash.
   - Upon match, a signed JWT token containing `{ id: user.id }` is generated with `jsonwebtoken` and returned.
   - Frontend stores the token in `localStorage` and updates `AuthContext` state.

2. **Authenticated Request & Middleware Processing:**
   - For every subsequent API call (e.g., creating a patient or assigning a doctor), the Axios request interceptor (`api.js`) automatically attaches `Authorization: Bearer <token>`.
   - The Express request reaches the `auth.js` middleware:
     - Extracts the token from the `Authorization` header.
     - Decodes and verifies the signature using `JWT_SECRET`.
     - Queries the database to verify the user exists and attaches the user record to `req.user`.
   - The request passes to the `validate.js` middleware which validates payload fields (e.g., age must be positive, phone must be 10 digits).

3. **Controller Execution & Strict Ownership Checks:**
   - **For Patients:** When `getAllPatients` or `createPatient` runs, `req.user.id` is explicitly injected into queries (`where: { userId: req.user.id }`). This ensures users cannot see or mutate another practitioner's patients.
   - **For Doctors:** When `getAllDoctors` runs, the shared hospital doctor catalog is queried and returned.
   - **For Assignments:** When `assignDoctorToPatient` runs:
     1. It verifies the target `patientId` belongs to `req.user.id`.
     2. It verifies the `doctorId` exists.
     3. It queries `PatientDoctorMapping` to ensure the pair is not already mapped.
     4. It creates the mapping record in the join table.

4. **Database Execution via Sequelize:**
   - Sequelize generates parameterized, SQL-injection safe queries to PostgreSQL.
   - Foreign key constraints maintain relational integrity:
     - `patients.userId` references `users.id` (CASCADE on delete).
     - `patient_doctor_mappings.patientId` references `patients.id` (CASCADE on delete).
     - `patient_doctor_mappings.doctorId` references `doctors.id` (CASCADE on delete).

5. **Response & UI Render:**
   - The controller sends back a standardized JSON response `{ success: true, data: ... }`.
   - React receives the response, updates component state via `useState` or `useEffect`, and triggers a re-render.
   - If an expired token is encountered, the Axios response interceptor catches the `401 Unauthorized`, clears local storage, and redirects the user to `/login?expired=true`.

---

## ⚙️ Environment Variables

### Backend Configuration (`backend/.env`)

| Variable | Description | Default / Example Value |
|---|---|---|
| `PORT` | Backend HTTP listening port | `5000` |
| `NODE_ENV` | Application environment (`development` / `production`) | `development` |
| `DB_HOST` | PostgreSQL host address | `127.0.0.1` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | PostgreSQL database name | `healthcare_db` |
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `postgres` |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens | `super_secret_healthcare_jwt_key_2026_whatbytes` |
| `JWT_EXPIRES_IN` | JWT token validity lifespan | `24h` |
| `CLIENT_URL` | Allowed frontend URL for CORS | `http://localhost:5173` |

### Frontend Configuration (`frontend/.env.example`)

| Variable | Description | Default Value |
|---|---|---|
| `VITE_API_BASE_URL` | Base API URL prefix | `/api` |

---

## 🚀 Installation and Setup Instructions

### Prerequisites
* **Node.js** (v18.x or v20.x+)
* **npm** (v9.x or v10.x+)
* **PostgreSQL** (v14+) running locally on port `5432`

---

### Step 1: Database Setup

1. Open PostgreSQL command line (`psql`) or pgAdmin:
   ```bash
   psql -U postgres
   ```
2. Create the project database:
   ```sql
   CREATE DATABASE healthcare_db;
   ```

---

### Step 2: Backend Setup

1. Open a terminal and navigate to `backend`:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up `.env` (copy from `.env.example` if needed and update database credentials):
   ```bash
   cp .env.example .env
   ```
4. Run the database seeder:
   ```bash
   npm run seed
   ```
   *This automatically creates all database tables via Sequelize and seeds 8 initial specialist doctor records.*
5. Start the backend development server:
   ```bash
   npm run dev
   # Server will start on http://localhost:5000
   ```

---

### Step 3: Run Automated Backend Tests

With the backend running, execute the comprehensive 25-point integration test suite in another terminal:
```bash
cd backend
node test_api.js
```
Expected output:
```
--- STARTING COMPREHENSIVE BACKEND API TEST SUITE ---
[PASS] GET /api/health returns 200 OK
[PASS] POST /api/auth/register succeeds with token
[PASS] POST /api/auth/register prevents duplicate email
[PASS] POST /api/auth/login succeeds with valid credentials
[PASS] POST /api/auth/login rejects incorrect password
[PASS] GET /api/patients without token returns 401
[PASS] POST /api/patients creates patient
[PASS] POST /api/patients fails validation for invalid inputs
[PASS] GET /api/patients returns user 1 patient
[PASS] GET /api/patients enforces isolation: User 2 cannot see User 1 patient
[PASS] GET /api/patients/:id returns 404 for unauthorized access by another user
[PASS] PUT /api/patients/:id updates patient record
[PASS] GET /api/doctors returns available doctors list
[PASS] POST /api/doctors creates new doctor record
[PASS] PUT /api/doctors/:id updates doctor record
[PASS] POST /api/mappings prevents assigning doctor to another user’s patient
[PASS] POST /api/mappings assigns doctor to patient
[PASS] POST /api/mappings prevents duplicate doctor-patient assignment
[PASS] POST /api/mappings assigns second doctor to patient
[PASS] GET /api/mappings retrieves authenticated user’s patient mappings
[PASS] GET /api/mappings/:patientId retrieves doctors assigned to patient
[PASS] DELETE /api/mappings/:id prevents unauthorized user from deleting assignment
[PASS] DELETE /api/mappings/:id removes assignment successfully
[PASS] DELETE /api/doctors/:id removes doctor successfully
[PASS] DELETE /api/patients/:id removes patient successfully
=============================================
TEST RESULTS: 25 PASSED | 0 FAILED
=============================================
```

---

### Step 4: Frontend Setup

1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your web browser at **`http://localhost:5173`**.

---

## 📡 REST API Reference

All protected endpoints require the HTTP header:
`Authorization: Bearer <your_jwt_token>`

### 1. Authentication APIs
* `POST /api/auth/register/` — Register a new practitioner account
* `POST /api/auth/login/` — Authenticate and receive a JWT token
* `GET /api/auth/me/` — Retrieve the authenticated practitioner's profile *(Protected)*

### 2. Patient Management APIs *(Protected)*
* `POST /api/patients/` — Create a new patient record (auto-linked to `req.user.id`)
* `GET /api/patients/` — List all patients belonging to the authenticated user
* `GET /api/patients/:id/` — Get full patient details and assigned doctors
* `PUT /api/patients/:id/` — Update patient details (strict ownership check)
* `DELETE /api/patients/:id/` — Delete patient and cascade mappings

### 3. Doctor Management APIs *(Protected)*
* `POST /api/doctors/` — Add a new doctor to the hospital directory
* `GET /api/doctors/` — Retrieve all available hospital doctors
* `GET /api/doctors/:id/` — Retrieve specific doctor details
* `PUT /api/doctors/:id/` — Update doctor details
* `DELETE /api/doctors/:id/` — Delete doctor from directory

### 4. Patient-Doctor Mapping APIs *(Protected)*
* `POST /api/mappings/` — Assign a doctor to a patient (validates patient ownership & prevents duplicates)
* `GET /api/mappings/` — List all active assignments for the authenticated user's patients
* `GET /api/mappings/:patientId/` — List all doctors assigned to a specific patient
* `DELETE /api/mappings/:id/` — Unassign a doctor from a patient (verifies patient ownership)

---

## 🧪 Postman Collection

A complete, pre-configured collection is included in:
`postman/Healthcare_Management_System.postman_collection.json`

* Automatically captures and sets the JWT `{{authToken}}` on register or login.
* Automatically captures `{{patientId}}`, `{{doctorId}}`, and `{{mappingId}}` across sequential test requests.
* Detailed guide available in [postman/README.md](postman/README.md).

---

## 🔒 Security Practices Implemented

1. **Password Hashing:** Passwords hashed with `bcryptjs` using a work factor of 10.
2. **Environment Variable Protection:** Secrets (`JWT_SECRET`, DB credentials) kept in `.env` and excluded via `.gitignore`.
3. **Parameterized Queries:** All database interactions utilize Sequelize ORM parameterized queries to prevent SQL injection.
4. **Tenant Isolation:** Every patient and assignment query enforces user ownership checks (`where: { userId: req.user.id }`).
5. **Input Validation:** Input sanitization and format validation with `express-validator` across all endpoints.
6. **Graceful Session Expiry:** Axios response interceptor redirects to `/login?expired=true` upon 401 Unauthorized responses.
=======
