# 🎬 myFlix API (Server-Side)

The **myFlix API** is the server-side component of a web application that allows users to explore movie information, create a profile, and manage a list of favorite movies. Built with Node.js, Express, and MongoDB, this RESTful API provides movie, director, and genre data while supporting full user authentication and data security.

This backend project is part of a full-stack JavaScript application developed as part of the CareerFoundry Full-Stack Web Development Program.

---

## 🚀 Live Link
- **Hosted on Heroku:** [https://movie-api-padma-7528be21ca05.herokuapp.com](https://movie-api-padma-7528be21ca05.herokuapp.com)

---

## 🧩 Features

### ✅ Essential Features

- Get a list of **all movies**
- Get detailed info on a **single movie by title**
- Get information about a **genre by name**
- Get information about a **director by name**
- **User registration** and account creation
- **Update** user profile details
- **Add or remove** movies from the user's favorites list
- **Deregister** an existing user account

### 🌟 Optional Features (Planned/Future Enhancements)

- Add support for movie ratings and release dates
- Include actor information
- Implement a "To Watch" list

---

## 📁 Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/movies` | Get all movies |
| GET | `/movies/:title` | Get a specific movie by title |
| GET | `/genres/:genreName` | Get genre info by name |
| GET | `/directors/:directorName` | Get director info by name |
| POST | `/users` | Register a new user |
| GET | `/users/:username` | Get user details |
| PUT | `/users/:username` | Update user information |
| POST | `/users/:username/movies/:movieID` | Add movie to favorites |
| DELETE | `/users/:username/movies/:movieID` | Remove movie from favorites |
| DELETE | `/users/:username` | Delete user account |

> All protected routes require JWT authentication.

---

## 🛠️ Technology Stack

- **Backend Framework:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT (JSON Web Tokens), Passport.js
- **Validation:** express-validator
- **Logging:** Morgan
- **Testing:** Postman
- **Deployment:** Heroku

---

## 🔒 Authentication & Security

- Passwords are hashed using `bcrypt`.
- JWT-based token authentication using `Passport` strategies.
- Validation using `express-validator` to enforce secure data input.
- CORS configured to allow controlled cross-origin requests.

---

## 🧪 Testing

All API endpoints were tested using **Postman** to ensure accurate request/response handling, proper error messages, and secure authentication.

---

## 📂 Project Structure

myFlix/ ├── models/ # Mongoose models │ └── models.js ├── routes/ # Express route handlers │ └── movies.js
├── auth/ # Authentication logic (JWT, Passport) │ └── auth.js ├── middleware/ │ └── passport.js ├── public/
# Static files (if needed) ├── .env ├── index.js # Main server file ├── package.json

---

## 👤 Developer

**Padmaja Pinnika**  
- 🔗 [GitHub Profile](https://github.com/padmajapinnika)  
- 📬 Email: padmajapinnika@gmail.com

---

## 📌 Getting Started (Local Setup)

1. Clone the repository:
   ```bash
   git clone https://github.com/padmajapinnika/movie_api.git
2.Install dependencies:
npm install
3.Create a .env file with your environment variables (e.g., MongoDB URI, secret key).
4.Run the server:
npm start


