# API Routes Documentation

This document describes all authentication-related API routes available in this backend. Each route is listed with its HTTP method, endpoint, description, and expected request/response structure.

---

## Authentication Routes

### 1. Register a New User

**Endpoint:**  
`POST /api/auth/register`

**Description:**  
Registers a new user with an email and password.

**Request Body:**
```
{
  "email": "user@example.com",
  "password": "yourPassword123!"
}
```
**Response:**
- `201` Created on success
- `401` Unauthorized if validation fails or user already exists

---

### 2. Login

**Endpoint:**  
`POST /api/auth/login`

**Description:**  
Authenticates a user and returns a JWT token.

**Request Body:**
```
{
  "email": "user@example.com",
  "password": "yourPassword123!"
}
```
**Response:**
- `200` OK with JWT token on success
- `401` Unauthorized if credentials are invalid

---

### 3. Logout

**Endpoint:**  
`POST /api/auth/logout`

**Description:**  
Logs out the user by clearing the authentication cookie.

**Response:**
- `200` OK on success

---

### 4. Send Verification Code

**Endpoint:**  
`PATCH /api/auth/send-verification-code`

**Description:**  
Sends a verification code to the user's email for account verification.

**Request Body:**

```
{
  "email": "user@example.com"
}
```

**Response:**
- `200` OK if code sent successfully
- `404` Not Found if user does not exist
- `400` Bad Request if user is already verified

---

### 5. Verify Verification Code

**Endpoint:**  
`PATCH /api/auth/verify-verification-code`

**Description:**  
Verifies the code sent to the user's email and marks the user as verified.

**Request Body:**
```
{
  "email": "user@example.com",
  "providedCode": 123456
}
```
**Response:**
- `200` OK if verification is successful
- `400` Bad Request if code is missing, expired, or user is already verified
- `401` Unauthorized if code or user is invalid

---

## Notes

- All endpoints expect and return JSON.
- JWT token is returned on successful login and should be used for authenticated requests.
- Verification codes expire after 5 minutes.
- Passwords must match the regex defined in the environment variable PASSWORD_REGEX.

---

For more details, refer to the implementation in `controllers/authController.js`