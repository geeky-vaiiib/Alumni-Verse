# 🎓 AlumniVerse - SIT Alumni Hub

<div align="center">

![AlumniVerse](https://img.shields.io/badge/AlumniVerse-v1.0.0-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A modern, secure alumni networking platform with OTP authentication**

[Live Demo](#) • [Documentation](#documentation) • [Features](#features) • [Getting Started](#getting-started)

</div>

---

## 🌟 Overview

**AlumniVerse** is a comprehensive alumni management system built for SIT (Siddaganga Institute of Technology) that enables seamless networking, real-time engagement, and career growth opportunities for alumni across all batches and branches.

### ✨ Key Highlights

- 🔐 **Secure OTP Authentication** - No passwords, just 6-digit codes
- 🎨 **Modern UI** - Glassmorphism design with smooth animations
- ⚡ **Real-time Sync** - Instant updates across all devices
- 📧 **Auto-extraction** - USN, branch, passing year from email
- 🚀 **Production Ready** - Complete with docs and testing

---

## 🎯 Features

### Authentication & Security
- ✅ Numeric 6-digit OTP authentication (replaces magic links)
- ✅ Bcrypt password hashing with 10 salt rounds
- ✅ Rate limiting: 5 OTPs/hour, 2/minute per email
- ✅ JWT-based session management
- ✅ Row Level Security (RLS) with Supabase
- ✅ Email domain validation (sit.ac.in only)
- ✅ OTP expiry (5 minutes) with attempt limits

### User Experience
- ✅ Glassmorphic dark theme UI
- ✅ Animated ripple canvas background
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Smooth page transitions with Framer Motion
- ✅ Toast notifications for user feedback
- ✅ Loading states and error handling
- ✅ Keyboard navigation support

### Profile Management
- ✅ Auto-extraction of USN, branch, passing year
- ✅ Avatar upload to Supabase Storage
- ✅ Profile completion tracking
- ✅ Real-time profile synchronization
- ✅ Social links (LinkedIn, GitHub, LeetCode)
- ✅ Location and company information

### Alumni Network
- ✅ Alumni directory with search and filters
- ✅ Connection requests (pending/accepted/rejected)
- ✅ Real-time news feed with posts
- ✅ Like and comment on posts
- ✅ Event calendar and RSVP system
- ✅ Career opportunities board

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - UI library
- **TypeScript 5.8.3** - Type safety
- **Vite 5.4.19** - Build tool
- **Tailwind CSS 3.4.17** - Styling
- **shadcn/ui** - Component library
- **Framer Motion** - Animations
- **React Router 7.1.3** - Routing
- **Lucide React** - Icons

### Backend
- **Node.js 18+** - Runtime
- **Express.js 4.21.2** - API framework
- **bcrypt 5.1.1** - Password hashing
- **nodemailer 6.9.16** - Email service
- **jsonwebtoken 9.0.2** - JWT auth
- **multer 1.4.5** - File uploads
- **cors 2.8.5** - Cross-origin requests

### Database & Services
- **Supabase** - PostgreSQL database
- **Supabase Auth** - User authentication
- **Supabase Storage** - File storage
- **Supabase Realtime** - Live updates

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **Supabase** account
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/geeky-vaiiib/Alumni-Verse.git
   cd Alumni-Verse
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Configure environment variables**

   **Frontend (`.env`):**
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
   VITE_API_URL=http://localhost:5001/api
   VITE_ALLOWED_EMAIL_DOMAIN=sit.ac.in
   ```

   **Backend (`backend/.env`):**
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SUPABASE_ANON_KEY=your_anon_key
   PORT=5001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ALLOWED_EMAIL_DOMAIN=sit.ac.in
   OTP_EXPIRY_MINUTES=5
   MAX_OTP_ATTEMPTS=5
   ```

5. **Apply database migrations**
   ```bash
   # Connect to Supabase
   export PGPASSWORD='your_db_password'
   psql postgresql://postgres@db.your-project.supabase.co:5432/postgres -f supabase/migrations/20251005141321_faefffc8-7fab-41cc-8afa-bc981c2bce38.sql
   psql postgresql://postgres@db.your-project.supabase.co:5432/postgres -f supabase/migrations/002_create_auth_otp.sql
   psql postgresql://postgres@db.your-project.supabase.co:5432/postgres -f supabase/migrations/003_update_profiles_rls.sql
   psql postgresql://postgres@db.your-project.supabase.co:5432/postgres -f supabase/migrations/004_enable_realtime.sql
   ```

6. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will start on http://localhost:5001

7. **Start the frontend (in a new terminal)**
   ```bash
   npm run dev
   ```
   Frontend will start on http://localhost:5173

---

## 📚 API Documentation

### Authentication Endpoints

#### Send OTP
```bash
POST /api/auth/send-otp
Content-Type: application/json

{
  "email": "student@sit.ac.in",
  "purpose": "signup" | "login" | "forgot"
}
```

#### Verify OTP
```bash
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "student@sit.ac.in",
  "otp": "123456",
  "purpose": "signup" | "login" | "forgot"
}
```

### Profile Endpoints

#### Create Profile
```bash
POST /api/profile/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "John Doe",
  "bio": "Software Engineer",
  "location": "Bangalore",
  "current_company": "Tech Corp"
}
```

#### Update Profile
```bash
PUT /api/profile/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "Jane Doe",
  "linkedin": "https://linkedin.com/in/janedoe"
}
```

#### Get Profile
```bash
GET /api/profile/:userId
Authorization: Bearer <token>
```

#### Upload Avatar
```bash
POST /api/profile/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

avatar: <file>
```

For complete API documentation, see [backend/README.md](backend/README.md).

---

## ��️ Project Structure

```
Alumni-Verse/
├── backend/                    # Express.js backend
│   ├── config/                 # Configuration files
│   │   ├── email.js           # Nodemailer setup
│   │   └── supabase.js        # Supabase client
│   ├── controllers/           # Request handlers
│   │   ├── otpController.js   # OTP logic
│   │   └── profileController.js
│   ├── middleware/            # Express middleware
│   │   └── auth.js           # JWT verification
│   ├── routes/               # API routes
│   │   ├── auth.js
│   │   └── profile.js
│   ├── utils/                # Utilities
│   │   └── emailParser.js    # USN extraction
│   └── server.js             # Entry point
├── src/                      # React frontend
│   ├── components/           # React components
│   │   ├── Navbar.tsx       # Navigation bar
│   │   ├── RippleGrid.tsx   # Canvas animation
│   │   ├── auth/
│   │   │   └── OTPInput.tsx # OTP input component
│   │   └── ui/              # shadcn components
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Auth state
│   ├── pages/               # Page components
│   │   ├── Auth.tsx        # Authentication
│   │   ├── Index.tsx       # Landing page
│   │   ├── Dashboard.tsx   # User dashboard
│   │   ├── ProfileSetup.tsx
│   │   └── Directory.tsx
│   ├── utils/              # Frontend utilities
│   │   └── emailParser.ts  # Email parsing
│   └── integrations/       # Third-party integrations
│       └── supabase/
├── supabase/               # Database
│   └── migrations/         # SQL migrations
├── public/                 # Static assets
└── docs/                   # Documentation
```

---

## 🧪 Testing

### Manual Testing

1. **Test Signup**
   ```bash
   # Start both servers
   npm run dev        # Frontend
   cd backend && npm run dev  # Backend
   
   # Navigate to http://localhost:5173
   # Click "Get Started"
   # Enter SIT email: test@sit.ac.in
   # Check console for OTP (dev mode)
   # Enter OTP and complete profile
   ```

2. **Test Login**
   ```bash
   # Use same email on auth page
   # Switch to "Sign In" mode
   # Request OTP and verify
   ```

3. **Verify Database**
   ```bash
   # Check OTP records
   export PGPASSWORD='your_password'
   psql postgresql://postgres@db.your-project.supabase.co:5432/postgres
   
   SELECT * FROM auth_otp ORDER BY created_at DESC LIMIT 5;
   SELECT id, email, usn, branch FROM profiles;
   ```

---

## 📖 Documentation

- **[FINAL_IMPLEMENTATION.md](FINAL_IMPLEMENTATION.md)** - Complete implementation details
- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Database migration instructions
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Project overview
- **[backend/README.md](backend/README.md)** - Backend API documentation
- **[PULL_REQUEST.md](PULL_REQUEST.md)** - PR template

---

## 🔒 Security

- **OTP Hashing**: bcrypt with 10 salt rounds
- **Rate Limiting**: Prevents brute force attacks
- **JWT Tokens**: Secure session management
- **RLS Policies**: Database-level security
- **Email Validation**: Domain whitelist
- **CORS**: Restricted origins
- **Environment Variables**: Sensitive data protection

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Project Lead:** Vaibhav J P  
**Institution:** Siddaganga Institute of Technology  
**Date:** October 2025

---

## 🙏 Acknowledgments

- **SIT** - For the opportunity to build this platform
- **Supabase** - For excellent backend services
- **shadcn/ui** - For beautiful component library
- **Open Source Community** - For amazing tools and libraries

---

## �� Support

For questions or issues:
- 📧 Email: [Insert your email]
- 🐛 Issues: [GitHub Issues](https://github.com/geeky-vaiiib/Alumni-Verse/issues)
- 📖 Wiki: [GitHub Wiki](https://github.com/geeky-vaiiib/Alumni-Verse/wiki)

---

<div align="center">

**Made with ❤️ for SIT Alumni**

⭐ Star this repo if you find it helpful!

</div>
