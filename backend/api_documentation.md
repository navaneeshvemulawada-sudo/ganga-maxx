# Ganga Maxx Authentication API Documentation

This document defines the request and response payloads for the backend authentication endpoints of the Ganga Maxx Quotation Suite, including Postman examples.

---

## 1. Register User Account
Registers a new user profile. Staff roles (`operations`, `supervisor`, `admin`) are marked as pending admin approval, while customer roles (`client`, `distributor`) are auto-approved.

* **Endpoint**: `POST /api/auth/register`
* **Content-Type**: `application/json`

### Request Payload (Postman Example)
```json
{
  "full_name": "John Doe",
  "email": "johndoe@cleanbundle.ai",
  "password": "Password@123",
  "role": "operations"
}
```

### Successful Response (201 Created)
```json
{
  "success": true,
  "message": "User registered successfully"
}
```

### Error Responses

#### Missing Fields (400 Bad Request)
```json
{
  "success": false,
  "error": "Missing required fields"
}
```

#### Email Already Exists (400 Bad Request)
```json
{
  "success": false,
  "error": "Email already exists"
}
```

---

## 2. User Login
Authenticates a user via email and password, issuing a JWT bearer token.

* **Endpoint**: `POST /api/auth/login`
* **Content-Type**: `application/json`

### Request Payload (Postman Example)
```json
{
  "email": "johndoe@cleanbundle.ai",
  "password": "Password@123"
}
```

### Successful Response (200 OK)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 12,
    "full_name": "John Doe",
    "email": "johndoe@cleanbundle.ai",
    "role": "operations"
  }
}
```

### Error Responses

#### Missing Credentials (400 Bad Request)
```json
{
  "success": false,
  "error": "Missing credentials"
}
```

#### Invalid Email or Password (401 Unauthorized)
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

#### Pending Approval (403 Forbidden)
```json
{
  "success": false,
  "error": "Your account is pending administrator approval."
}
```
