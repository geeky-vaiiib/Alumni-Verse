# AlumniVerse Backend API

RESTful API server for SIT Alumni Hub with OTP-based authentication, profile management, and real-time features.

## 🚀 Features

- **Numeric OTP Authentication** - 6-digit codes sent via email
- **Email Parsing** - Auto-extract USN, branch, and passing year from SIT emails
- **Profile Management** - CRUD operations with Supabase integration
- **Avatar Upload** - Image uploads to Supabase Storage
- **Rate Limiting** - Prevent abuse (5 OTPs/hour, 2/minute per email)
- **JWT Authentication** - Secure API endpoints
- **Email Service** - HTML email templates via nodemailer
- **Real-time Ready** - Integrates with Supabase Realtime

## 📦 Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** Supabase (PostgreSQL)
- **Authentication:** bcrypt (OTP hashing), JWT
- **Email:** nodemailer
- **File Upload:** multer
- **Security:** cors, express-rate-limit

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following:

```bash
# Supabase (REQUIRED)
SUPABASE_URL=https://fpmtzugmvaogxqhetwsj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here

# Server
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080

# Email (SMTP)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
EMAIL_FROM=AlumniVerse <no-reply@alumniverse.sit.ac.in>

# Security
JWT_SECRET=your-jwt-secret-here
OTP_EXPIRY_MINUTES=5
MAX_OTP_ATTEMPTS=5

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Business Logic
ALLOWED_EMAIL_DOMAIN=sit.ac.in
```

### Getting Credentials

**Supabase Keys:**
1. Go to https://supabase.com/dashboard/project/fpmtzugmvaogxqhetwsj
2. Navigate to Settings → API
3. Copy "URL", "anon/public key", and "service_role key"
4. ⚠️ **NEVER expose service_role key to frontend!**

**SMTP (Development):**
1. Sign up at https://mailtrap.io (free tier)
2. Go to Email Testing → SMTP Settings
3. Copy host, port, username, password

**SMTP (Production):**
- **SendGrid:** https://sendgrid.com (free tier: 100 emails/day)
- **AWS SES:** https://aws.amazon.com/ses/ (pay per email)
- **Mailgun:** https://www.mailgun.com (free tier available)

## 🚀 Running the Server

### Development Mode

```bash
npm run dev
# Server starts with auto-reload on http://localhost:5001
```

### Production Mode

```bash
npm start
# Server starts on configured PORT
```

### Health Check

```bash
curl http://localhost:5001/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "uptime": 123.456,
  "timestamp": "2025-01-05T...",
  "environment": "development"
}
```

## 📚 API Endpoints

### Authentication

#### Send OTP

```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "email": "1si23is117@sit.ac.in",
  "purpose": "signup"  // or "login" or "forgot"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 300
}
```

**Errors:**
- `400` - Invalid email domain, user already exists (signup), or user not found (login)
- `429` - Rate limit exceeded
- `500` - Server error

#### Verify OTP

```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "1si23is117@sit.ac.in",
  "otp": "123456",
  "purpose": "signup"
}
```

**Response (Signup):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "userId": "uuid-here",
  "needsProfileSetup": true,
  "user": {
    "id": "uuid",
    "email": "1si23is117@sit.ac.in",
    "usn": "1SI23IS117",
    "branch": "Information Science",
    "passingYear": 2027
  }
}
```

**Response (Login):**
```json
{
  "success": true,
  "message": "Login successful",
  "userId": "uuid",
  "needsProfileSetup": false
}
```

### Profile Management

#### Create Profile

```http
POST /api/profile/create
Content-Type: application/json

{
  "auth_id": "user-uuid",
  "email": "1si23is117@sit.ac.in",
  "full_name": "John Doe",
  "bio": "Alumni from 2027 batch",
  "location": "Bangalore, India",
  "current_company": "Tech Corp",
  "linkedin": "johndoe",
  "github": "johndoe",
  "leetcode": "johndoe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile created successfully",
  "profile": {
    "id": "uuid",
    "usn": "1SI23IS117",
    "branch": "Information Science",
    "passing_year": 2027,
    ...
  }
}
```

#### Update Profile (Requires Auth)

```http
PUT /api/profile/update
Authorization: Bearer <supabase-jwt-token>
Content-Type: application/json

{
  "full_name": "John Updated",
  "bio": "New bio",
  "location": "Mumbai"
}
```

#### Get Profile

```http
GET /api/profile/:userId
```

#### Upload Avatar (Requires Auth)

```http
POST /api/profile/upload
Authorization: Bearer <supabase-jwt-token>
Content-Type: multipart/form-data

avatar: <image-file>
```

**Response:**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "avatar_url": "https://...supabase.co/storage/v1/object/public/avatars/..."
}
```

## 🔐 Authentication

Protected endpoints require a Supabase JWT token in the Authorization header:

```http
Authorization: Bearer <supabase-jwt-token>
```

Get the token from the frontend Supabase client:
```javascript
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

## 🛡️ Security Features

### OTP Security
- ✅ Hashed with bcrypt (10 rounds)
- ✅ 5-minute expiry
- ✅ Max 5 verification attempts
- ✅ Single-use (marked as `used` after verification)

### Rate Limiting
- **Global:** 100 requests per 15 minutes per IP
- **OTP Requests:** 5 per hour, 2 per minute per email

### Input Validation
- Email domain validation (only @sit.ac.in)
- OTP format validation (6 digits)
- File type validation (images only for avatars)
- File size limit (5MB)

### CORS
- Configured for frontend origin only
- Credentials allowed for authenticated requests

## 📧 Email Templates

OTP emails include:
- HTML and plain text versions
- 6-digit code prominently displayed
- Expiry time (5 minutes)
- Security warning
- Branded header with gradient

### Development Mode

When SMTP is not configured, OTPs are logged to console:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 [DEV MODE] OTP Email for test@sit.ac.in
Purpose: signup
OTP: 123456
Expires in: 5 minutes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🧪 Testing

### Manual Testing with curl

```bash
# Send OTP
curl -X POST http://localhost:5001/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@sit.ac.in","purpose":"signup"}'

# Verify OTP (check logs for OTP)
curl -X POST http://localhost:5001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@sit.ac.in","otp":"123456","purpose":"signup"}'
```

### Unit Tests (To Implement)

```bash
npm test
```

## 🐛 Troubleshooting

### "Failed to send email"
- Check SMTP credentials in `.env`
- Verify SMTP host/port are correct
- For dev, use Mailtrap (free and reliable)
- Check firewall/network settings

### "Invalid or expired token"
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check key hasn't expired
- Verify Supabase project URL matches

### "Database error"
- Run migrations: `supabase db push` or apply via dashboard
- Check RLS policies aren't blocking operations
- Verify service role key has proper permissions

### "Rate limit exceeded"
- Wait for cooldown period
- In dev, restart server to reset in-memory store
- For production, implement Redis-based rate limiting

## 📊 Database Schema

### `auth_otp` Table

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| email | text | User's email |
| otp_hash | text | Bcrypt hashed OTP |
| expires_at | timestamptz | Expiry time (5 min) |
| attempts | integer | Verification attempts |
| purpose | text | signup/login/forgot |
| used | boolean | Single-use flag |
| created_at | timestamptz | Creation time |

### `profiles` Table

Managed by Supabase (see main migrations).

## 🚀 Deployment

### Railway

```bash
railway init
railway up
```

Set environment variables in Railway dashboard.

### Render

1. Create new Web Service
2. Connect GitHub repo
3. Build: `npm install`
4. Start: `npm start`
5. Add environment variables

### Heroku

```bash
heroku create alumni-hub-api
git push heroku main
heroku config:set SUPABASE_URL=...
```

## 📝 Maintenance

### Cleanup Expired OTPs

Run periodically via cron or manually:

```sql
SELECT cleanup_expired_otps();
```

Returns number of rows deleted.

### Monitor Logs

```bash
# Development
Check console output

# Production
Use logging service (Logtail, Papertrail, etc.)
```

### Database Backups

Supabase provides automatic backups. For manual backup:

```bash
supabase db dump -f backup.sql
```

## 🤝 Contributing

1. Create feature branch
2. Implement changes
3. Add tests
4. Update documentation
5. Submit PR

## 📄 License

MIT

## 🔗 Links

- **Frontend:** ../src/
- **Migrations:** ../supabase/migrations/
- **Supabase Dashboard:** https://supabase.com/dashboard/project/fpmtzugmvaogxqhetwsj

---

**Version:** 1.0.0  
**Last Updated:** 2025-01-05
