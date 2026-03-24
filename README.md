# 📚 Library Management System

[![Java](https://img.shields.io/badge/Java-SpringBoot-orange)](https://spring.io/projects/spring-boot)
[![Database](https://img.shields.io/badge/Database-MySQL-blue)](https://www.mysql.com/)
[![Frontend](https://img.shields.io/badge/Frontend-HTML%2FCSS%2FJS-green)]()
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

A complete **Full Stack Library Management System** designed to manage books, users, and transactions efficiently.  
This project demonstrates real-world backend logic such as **authentication, book issuing, returning, and fine calculation**, along with a simple and interactive frontend.

---

## 🎯 Project Overview

This system simulates how a real library works:

- Users can create accounts and log in  
- Books can be added, viewed, issued, and returned  
- The system tracks due dates and calculates fines automatically  
- Availability of books updates in real-time  

Both **Admin** and **Member** roles are supported.

---

## 👥 User Roles

### 🔹 Member
- Register and login  
- View all books  
- Issue books  
- Return books using Transaction ID  
- View due date and fine  

### 🔹 Admin
- All Member functionalities  
- Add new books  
- Delete books  
- Monitor book availability  

---

## ⚙️ System Workflow

### 📌 Book Issue Flow
1. User clicks **Issue**  
2. Backend checks:  
   - Book availability  
   - If user already has the book  
3. System creates a **Transaction**  
4. Due date = Issue date + 14 days  
5. Available copies decrease  

---

### 📌 Book Return Flow
1. User enters Transaction ID  
2. System calculates:  
   - If returned after due date → fine applied  
3. Book copies increase  
4. Transaction is marked as returned  

---

## 💰 Fine Calculation Logic

- Loan period: **14 days**  
- Fine rule:  

```
₹10 × number of days late
```

Example:  
If a book is returned 3 days late → Fine = ₹30  

---

## 🧰 Tech Stack

### 🔹 Backend
- Java (Spring Boot)  
- Spring Data JPA  
- Hibernate (ORM)  
- MySQL Database  

### 🔹 Frontend
- HTML  
- CSS  
- JavaScript (Vanilla JS)  

---

## 🗂️ Project Structure

```
library-management-system/

├── backend/                (Java Spring Boot)
│   ├── src/main/java/com/library/
│   │   ├── LibraryApplication.java
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   ├── BookController.java
│   │   │   ├── TransactionController.java
│   │   ├── model/
│   │   │   ├── User.java
│   │   │   ├── Book.java
│   │   │   ├── Transaction.java
│   │   ├── service/
│   │   │   ├── AuthService.java
│   │   │   ├── BookService.java
│   │   │   ├── TransactionService.java
│   │   │   ├── FineService.java
│   │   ├── repository/
│   │   │   ├── UserRepository.java
│   │   │   ├── BookRepository.java
│   │   │   ├── TransactionRepository.java
│   │   ├── util/
│   │   │   ├── FineCalculator.java
│   │   ├── exception/
│   │   │   ├── GlobalExceptionHandler.java
│   ├── src/main/resources/
│   │   ├── application.properties
│   ├── pom.xml
│
├── frontend/               (HTML, CSS, JS)
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── style.css
│   ├── script.js
│
└── README.md
```

---

## 🚀 Setup Instructions

### 🔹 Backend
```bash
cd backend
mvn spring-boot:run
```
Server runs at:  
```
http://localhost:8080
```

---

### 🔹 Frontend
Open in browser:  
```
frontend/login.html
```

---

## 🔗 API Endpoints

### 🧑 Authentication
- `POST /api/auth/register`  
- `POST /api/auth/login`  

### 📚 Books
- `GET /api/books` → Get all books  
- `POST /api/books` → Add book  
- `DELETE /api/books/{id}` → Delete book  

### 🔄 Transactions
- `POST /api/transactions/issue` → Issue book  
- `POST /api/transactions/return/{id}` → Return book  

---

## 🎥 Live Demo

👉 Try the project here:  
[**Library Management System Demo**](https://library-management-system-iota-self.vercel.app/)   

---

## 🌐 GitHub
👉 [https://github.com/Jiban0507](https://github.com/Jiban0507)

---

## 🔮 Future Improvements
- Update/Edit Book feature  
- Search and filter system  
- User-wise issued books tracking  
- JWT Authentication (secure login)  
- Better UI/UX  

---

## ⭐ Conclusion
This project demonstrates a complete **real-world full-stack system** including:  
- Authentication  
- CRUD operations  
- Role-based access (Admin & Member)  
- Business logic (fine calculation)  

---
