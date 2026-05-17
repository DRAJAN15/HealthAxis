# 🏥 HealthAxis - A centralize market place for the health services 

A full-stack production-ready **MERN** application with JWT auth, role-based access control, Razorpay payments, email/SMS notifications, and an analytics dashboard.

---

## 📁 Project Structure

```
healthAxis
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # Register, login, getMe
│   │   ├── doctorController.js      # Doctor CRUD + slot management
│   │   ├── patientController.js     # Patient CRUD + profiles
│   │   ├── appointmentController.js # Book, list, update status
│   │   ├── medicalRecordController.js
│   │   ├── paymentController.js     # Razorpay create order + verify
│   │   └── analyticsController.js   # MongoDB aggregation pipelines
│   ├── middleware/
│   │   ├── auth.js                  # JWT protect + authorize
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/
│   │   ├── User.js                  # Base user (admin/doctor/patient)
│   │   ├── DoctorProfile.js         # Specialization, fees, availability
│   │   ├── PatientProfile.js        # Medical history, emergency contact
│   │   ├── Appointment.js           # Bookings with double-booking prevention
│   │   ├── MedicalRecord.js         # Diagnosis, prescriptions, vitals
│   │   └── Payment.js               # Razorpay payment records
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── medicalRecordRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── analyticsRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   ├── email.js                 # Nodemailer + email templates
│   │   ├── sms.js                   # Twilio SMS
│   │   ├── scheduler.js             # node-cron reminder jobs
│   │   └── seeder.js                # Sample data seeder
│   ├── server.js                    # Entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── common/
    │   │       ├── index.js          # StatCard, Modal, Table, Badge, etc.
    │   │       └── DashboardLayout.js
    │   ├── context/
    │   │   └── AuthContext.js        # Global auth state
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── LoginPage.js
    │   │   │   └── RegisterPage.js
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.js
    │   │   │   ├── ManageDoctors.js
    │   │   │   ├── ManagePatients.js
    │   │   │   ├── AdminAppointments.js
    │   │   │   └── AnalyticsDashboard.js
    │   │   ├── doctor/
    │   │   │   ├── DoctorDashboard.js
    │   │   │   ├── DoctorAppointments.js
    │   │   │   ├── DoctorPatients.js
    │   │   │   ├── AddMedicalRecord.js
    │   │   │   └── DoctorProfile.js
    │   │   └── patient/
    │   │       ├── PatientDashboard.js
    │   │       ├── FindDoctors.js
    │   │       ├── BookAppointment.js
    │   │       ├── MyAppointments.js
    │   │       ├── MyMedicalRecords.js
    │   │       ├── PaymentPage.js
    │   │       └── PatientProfile.js
    │   ├── services/
    │   │   └── api.js                # Axios instance + all API calls
    │   ├── App.js                    # Routes + role-based protection
    │   ├── index.js
    │   └── index.css                 # Tailwind + custom classes
    ├── package.json
    └── tailwind.config.js
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd hospital-management-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your actual values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/hospital_management
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRE=30d

# Gmail (create App Password in Google Account settings)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM=HMS <your_email@gmail.com>

# Twilio (get from twilio.com console)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Razorpay (get from razorpay.com dashboard)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

FRONTEND_URL=http://localhost:3000
```

### 3. Seed the Database (optional)

```bash
cd backend
npm run seed
```

This creates demo accounts:

| Role    | Email                  | Password     |
|---------|------------------------|--------------|
| Admin   | admin@hospital.com     | Admin@123    |
| Doctor  | arjun@hospital.com     | Doctor@123   |
| Doctor  | priya@hospital.com     | Doctor@123   |
| Patient | ravi@example.com       | Patient@123  |
| Patient | anjali@example.com     | Patient@123  |

### 4. Run the Application

**Terminal 1 – Backend:**
```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
```

**Terminal 2 – Frontend:**
```bash
cd frontend
npm start
# App opens at http://localhost:3000
```

---

## 🔌 API Documentation

Base URL: `http://localhost:5000/api`

### Authentication

| Method | Endpoint                    | Access  | Description           |
|--------|-----------------------------|---------|-----------------------|
| POST   | `/auth/register`            | Public  | Register patient       |
| POST   | `/auth/login`               | Public  | Login                 |
| GET    | `/auth/me`                  | Private | Get current user      |
| PUT    | `/auth/update-password`     | Private | Change password       |

### Doctors

| Method | Endpoint                    | Access        | Description              |
|--------|-----------------------------|---------------|--------------------------|
| GET    | `/doctors`                  | Public        | List all doctors          |
| GET    | `/doctors/:id`              | Public        | Get doctor details        |
| GET    | `/doctors/:id/slots?date=`  | Patient       | Get available time slots  |
| POST   | `/doctors`                  | Admin         | Create doctor             |
| PUT    | `/doctors/:id`              | Admin, Doctor | Update doctor             |
| DELETE | `/doctors/:id`              | Admin         | Deactivate doctor         |

### Patients

| Method | Endpoint          | Access              | Description         |
|--------|-------------------|---------------------|---------------------|
| GET    | `/patients`       | Admin, Doctor       | List all patients   |
| GET    | `/patients/me`    | Patient             | Get own profile     |
| GET    | `/patients/:id`   | Admin, Doctor, self | Get patient         |
| PUT    | `/patients/:id`   | Admin, Patient      | Update patient      |

### Appointments

| Method | Endpoint                       | Access         | Description             |
|--------|--------------------------------|----------------|-------------------------|
| POST   | `/appointments`                | Patient        | Book appointment         |
| GET    | `/appointments`                | All            | List (role-filtered)     |
| GET    | `/appointments/:id`            | All            | Get single appointment   |
| PUT    | `/appointments/:id/status`     | Doctor, Admin  | Confirm/reject/complete  |
| PUT    | `/appointments/:id/cancel`     | Patient        | Cancel appointment       |

**Status values:** `pending` → `confirmed` / `rejected` → `completed` / `cancelled` / `no_show`

### Medical Records

| Method | Endpoint       | Access         | Description              |
|--------|----------------|----------------|--------------------------|
| POST   | `/records`     | Doctor         | Create medical record    |
| GET    | `/records`     | All            | List (role-filtered)     |
| GET    | `/records/:id` | All            | Get single record        |
| PUT    | `/records/:id` | Doctor (own)   | Update record            |

### Payments (Razorpay)

| Method | Endpoint                 | Access   | Description               |
|--------|--------------------------|----------|---------------------------|
| POST   | `/payments/create-order` | Patient  | Create Razorpay order     |
| POST   | `/payments/verify`       | Patient  | Verify payment signature  |
| GET    | `/payments`              | All      | Payment history           |
| GET    | `/payments/:id`          | All      | Single payment            |

### Analytics

| Method | Endpoint               | Access   | Description                     |
|--------|------------------------|----------|---------------------------------|
| GET    | `/analytics/dashboard` | Admin    | Overview, revenue, workload     |
| GET    | `/analytics/doctor`    | Doctor   | Doctor-specific analytics       |
| GET    | `/analytics/patient`   | Patient  | Patient-specific analytics      |

---

## 🔑 Key Features Explained

### Double Booking Prevention
The `Appointment` model has a compound unique index on `{doctor, appointmentDate, timeSlot.startTime}` with a partial filter excluding cancelled/rejected appointments. This prevents race conditions at the database level.

### JWT Authentication Flow
1. Client sends credentials → server returns JWT
2. JWT stored in `localStorage` as `hms_token`
3. Axios interceptor attaches `Authorization: Bearer <token>` to every request
4. 401 responses automatically redirect to `/login`

### Razorpay Payment Flow
1. Patient clicks "Pay" → backend creates Razorpay order → returns `orderId + keyId`
2. Frontend opens Razorpay checkout modal
3. On success, Razorpay calls `handler` with `{razorpay_order_id, razorpay_payment_id, razorpay_signature}`
4. Frontend sends signature to backend for HMAC-SHA256 verification
5. On verified → appointment marked `isPaid: true`

### Appointment Reminders (Cron)
- Runs **every 5 minutes** via `node-cron`
- Finds confirmed appointments starting in 55–60 minutes with reminders not yet sent
- Fires email (Nodemailer) + SMS (Twilio) simultaneously
- Marks `reminderSent.email = true` to prevent duplicate sends

### Role-Based Access Control
```
Admin:   Full access to everything
Doctor:  Own appointments, own patients, own records, own profile
Patient: Own appointments, own records, own profile, book appointments
```

---

## 🧪 Running Without External Services

The app degrades gracefully:
- **No email config** → email functions silently fail (logged to console)
- **No Twilio config** → SMS functions silently skip
- **No Razorpay config** → Payment page loads but checkout will fail; use test keys from [Razorpay Dashboard](https://dashboard.razorpay.com)

For local testing without payments, patients can use **"Pay Later"** option.

---

## 🛠️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, React Router 6, Tailwind CSS |
| Charts     | Chart.js + react-chartjs-2        |
| HTTP       | Axios with interceptors           |
| Backend    | Node.js, Express.js               |
| Database   | MongoDB, Mongoose ODM             |
| Auth       | JWT, bcryptjs                     |
| Email      | Nodemailer (SMTP/Gmail)           |
| SMS        | Twilio                            |
| Payments   | Razorpay                          |
| Scheduling | node-cron                         |
| Validation | express-validator                 |

---

## 📝 Environment Variables Reference

| Variable                  | Required | Description                          |
|---------------------------|----------|--------------------------------------|
| `PORT`                    | Yes      | Backend port (default: 5000)         |
| `MONGO_URI`               | Yes      | MongoDB connection string            |
| `JWT_SECRET`              | Yes      | JWT signing secret (min 32 chars)    |
| `JWT_EXPIRE`              | No       | Token expiry (default: 30d)          |
| `EMAIL_HOST`              | No       | SMTP host                            |
| `EMAIL_PORT`              | No       | SMTP port                            |
| `EMAIL_USER`              | No       | SMTP username                        |
| `EMAIL_PASS`              | No       | SMTP password / App password         |
| `EMAIL_FROM`              | No       | From address for emails              |
| `TWILIO_ACCOUNT_SID`      | No       | Twilio Account SID                   |
| `TWILIO_AUTH_TOKEN`       | No       | Twilio Auth Token                    |
| `TWILIO_PHONE_NUMBER`     | No       | Twilio sender phone number           |
| `RAZORPAY_KEY_ID`         | No       | Razorpay Key ID                      |
| `RAZORPAY_KEY_SECRET`     | No       | Razorpay Key Secret                  |
| `FRONTEND_URL`            | Yes      | CORS origin (e.g. http://localhost:3000) |

---

## 🚢 Production Deployment

### Backend (Railway / Render / EC2)
```bash
npm start  # uses node server.js
```
Set `NODE_ENV=production` and all required env vars.

### Frontend (Vercel / Netlify)
```bash
npm run build
```
Set `REACT_APP_API_URL=https://your-api-domain.com/api`

### MongoDB Atlas
Replace `MONGO_URI` with your Atlas connection string:
```
mongodb+srv://<username>:<password>@cluster.mongodb.net/hospital_management
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📄 License

Rajan Dubey© 2024 HealthAxis
