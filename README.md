# TrimLink

A modern URL Shortener built using Node.js, Express.js, MySQL, and Docker. This project allows users to create shortened URLs, manage custom aliases, track analytics, and securely authenticate using JWT.

## Features

### URL Management

* Shorten long URLs
* Custom alias support
* URL expiration
* Redirect shortened URLs
* URL validation using express-validator

### Analytics

* Track URL visits
* Store visit history
* Analytics API for each shortened URL
* Total visit count

### Authentication

* User Registration
* User Login
* Password hashing using bcrypt
* JWT-based authentication
* Protected routes

### Security

* Rate Limiting
* Environment Variables (.env)
* Password encryption
* Authentication middleware

### Architecture

* Controller Layer
* Service Layer
* Repository Layer
* Middleware-based error handling

### Frontend

* Modern responsive UI
* Dark theme
* Login & Registration UI
* Analytics Dashboard
* Copy-to-clipboard functionality
* Mobile-friendly design

### DevOps

* Dockerized application
* Docker Hub image available

---

# Tech Stack

## Backend

* Node.js
* Express.js

## Database

* MySQL

## Authentication

* JWT (jsonwebtoken)
* bcrypt

## Validation

* express-validator

## Security

* express-rate-limit

## Containerization

* Docker

## Frontend

* HTML
* CSS
* JavaScript

---

# Project Structure

```text
urlshortner/
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── src/
│   ├── controllers/
│   │   ├── urlController.js
│   │   └── userController.js
│   │
│   ├── services/
│   │   ├── urlService.js
│   │   └── userService.js
│   │
│   ├── repositories/
│   │   ├── urlRepository.js
│   │   └── userRepository.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   │
│   └── validators/
│       └── urlValidators.js
│
├── db.js
├── server.js
├── Dockerfile
├── package.json
├── .env
└── README.md
```

---

# Database Schema

## users

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255)
);
```

## urls

```sql
CREATE TABLE urls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_url TEXT NOT NULL,
    short_code VARCHAR(20) UNIQUE,
    expires_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## url_visits

```sql
CREATE TABLE url_visits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url_id INT,
    visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

# Environment Variables

Create a `.env` file in the root directory.

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=url_shortener

PORT=3000

JWT_SECRET=your_secret_key
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/prajan107/urlshortner.git

cd urlshortner
```

## Install Dependencies

```bash
npm install
```

## Start Server

```bash
node server.js
```

Server runs on:

```text
http://localhost:3000
```

---

# API Endpoints

## Register User

```http
POST /register
```

Request:

```json
{
  "username": "rajan",
  "email": "rajan@gmail.com",
  "password": "123456"
}
```

---

## Login User

```http
POST /login
```

Request:

```json
{
  "email": "rajan@gmail.com",
  "password": "123456"
}
```

Response:

```json
{
  "token": "jwt_token"
}
```

---

## Shorten URL

```http
POST /shorten
```

Request:

```json
{
  "url": "https://example.com"
}
```

---

## Custom Alias

```json
{
  "url": "https://example.com",
  "customAlias": "my-link"
}
```

---

## Redirect URL

```http
GET /:code
```

Example:

```http
GET /abc123
```

---

## Analytics

```http
GET /analytics/:code
```

Headers:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

# Running with Docker

## Pull Image

```bash
docker pull prajan107/urlshortener:v1
```

## Run Container

```bash
docker run --env-file .env -p 3000:3000 prajan107/urlshortener:v1
```

---

# Docker Hub

Image:

```text
prajan107/urlshortener:v1
```

---

# Future Improvements

* Docker Compose
* Refresh Tokens
* User-specific URL Dashboard
* URL Deletion
* URL Editing
* QR Code Generation
* Unit Testing with Jest
* CI/CD Pipeline
* Cloud Deployment

---

# Author

Rajan Prajapati

GitHub:
https://github.com/prajan107

Docker Hub:
https://hub.docker.com/u/prajan107
