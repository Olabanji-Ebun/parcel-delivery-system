# Environment Variables Reference

## 📋 Complete List of Environment Variables for Parcel Delivery System

### ✅ Currently Active Variables

#### Database Configuration
| Variable | Description | Example Value |
|----------|-------------|---------------|
| `DB_HOST` | PostgreSQL database host | `dpg-d43qa3jipnbc73c7jt4g-a.oregon-postgres.render.com` |
| `DB_USER` | Database username | `parcel_delivery_parcel_user` |
| `DB_PASSWORD` | Database password | `kMmz1SPlgvkMBtKPwq58O579D71Ip1Je` |
| `DB_NAME` | Database name | `parcel_delivery_parcel` |
| `DB_PORT` | Database port | `5432` |

#### Server Configuration
| Variable | Description | Example Value |
|----------|-------------|---------------|
| `NODE_ENV` | Node.js environment | `production` or `development` |
| `PORT` | Server port number | `10000` |

#### CORS Configuration
| Variable | Description | Example Value |
|----------|-------------|---------------|
| `CORS_ORIGIN` | Allowed CORS origins | `*` (all) or specific domain |

#### Application Configuration
| Variable | Description | Example Value |
|----------|-------------|---------------|
| `APP_NAME` | Application name | `parcel-delivery-system` |
| `API_VERSION` | API version | `v1` |
| `LOG_LEVEL` | Logging level | `info`, `debug`, `warn`, `error` |

---

### 🔒 Optional Security Variables (For Future Use)

| Variable | Description | When to Use |
|----------|-------------|-------------|
| `JWT_SECRET` | Secret key for JWT tokens | When implementing authentication |
| `SESSION_SECRET` | Secret for session management | When implementing sessions |
| `ENCRYPTION_KEY` | Key for data encryption | When encrypting sensitive data |

---

### 📧 Optional Email Service Variables (For Future Notifications)

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` or `465` |
| `SMTP_USER` | Email username | `your-email@gmail.com` |
| `SMTP_PASSWORD` | Email password | `your-app-password` |
| `EMAIL_FROM` | Default sender email | `noreply@yourdomain.com` |

---

### 🚦 Optional Rate Limiting Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `RATE_LIMIT_WINDOW` | Time window in minutes | `15` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

---

### 📱 Optional Frontend Configuration

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `FRONTEND_URL` | Frontend application URL | `https://your-frontend.com` |
| `API_BASE_URL` | Base URL for API | `https://parcel-backend.onrender.com` |

---

### 🌐 Optional External Services

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `GOOGLE_MAPS_API_KEY` | For address/geocoding | `your-google-maps-key` |
| `TWILIO_ACCOUNT_SID` | For SMS notifications | `your-twilio-sid` |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | `your-twilio-token` |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | `+1234567890` |

---

## 🎯 How to Use in Your Code

### In Node.js (server.js)
```javascript
// Access environment variables
const dbHost = process.env.DB_HOST;
const appName = process.env.APP_NAME || 'parcel-delivery-system';
const port = process.env.PORT || 3000;
const nodeEnv = process.env.NODE_ENV || 'development';
```

### Best Practices
1. ✅ Always use `process.env.VARIABLE_NAME`
2. ✅ Provide default values with `||` operator
3. ✅ Never commit secrets to git
4. ✅ Use UPPER_CASE for variable names
5. ✅ Document all variables

---

## 📝 Quick Reference

### Required Variables (Must Have)
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
- `NODE_ENV`, `PORT`

### Recommended Variables (Good to Have)
- `APP_NAME`, `API_VERSION`, `LOG_LEVEL`, `CORS_ORIGIN`

### Optional Variables (Future Features)
- Security: `JWT_SECRET`, `SESSION_SECRET`
- Email: `SMTP_*` variables
- Rate Limiting: `RATE_LIMIT_*` variables
- External Services: `GOOGLE_MAPS_API_KEY`, `TWILIO_*`

---

## 🔄 Adding New Variables

1. **Add to render.yaml** (for version control)
2. **Add to Render Dashboard** (for secrets)
3. **Update this document** (for documentation)
4. **Use in server.js** (in your code)
5. **Commit and push** (to deploy)

---

## ⚠️ Security Notes

- 🔒 Never commit passwords or API keys
- 🔒 Use Render's environment variable UI for secrets
- 🔒 Keep sensitive variables commented out in render.yaml
- 🔒 Use different values for development and production

