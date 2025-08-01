# 💸 Digital Wallet System API 

A secure, modular, role-based backend API for a digital wallet platform. Built with **Node.js**, **Express.js**, and **MongoDB**.

---

## 🚀 Features

- 🔐 JWT-based Authentication (User, Agent, Admin)
- 🧂 Secure Password Hashing with Bcrypt
- 🏦 Wallet Creation and Management
- 💳 Transactions (Top-up, Withdraw, Send, Cash-in, Cash-out)
- 🎭 Role-based Access Control (RBAC)
- 📦 Modular Project Structure
- 🧾 Full Transaction History & Wallet Logs
- ⚙️ Admin Controls (Block Wallet, Approve Agents, etc.)


---

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JSON Web Tokens (JWT)
- Bcrypt.js
- TypeScript (Optional)
- Dotenv

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YeasinWebDev/a5-backend.git
cd a5-backend
```

### 2.Install Dependencies

```bash
npm install
```

### 3.Environment Variables

```bash
PORT=
DB_URL=
JWT_SECRET=
```

### 4.Start the Server

```bash
npm run dev
```

---

## 📦 API Endpoints

# 👤 User  

| Method | Endpoint               | Access        | Description               |
|--------|------------------------|---------------|---------------------------|
| GET    | /api/user/transactions | User, Agent   | View transaction history  |
| POST   | /api/user/add-money    | User, Agent   | Add money to wallet       |
| POST   | /api/user/withdraw     | User, Agent   | Withdraw money from wallet|
| POST   | /api/user/send-money   | User, Agent   | Send money to another user|   


# 👤 Agent  

| Method | Endpoint               | Access | Description                         |
|--------|------------------------|--------|-------------------------------------|
| GET    | /api/agent/commissions | Agent  | View commission history             |
| POST   | /api/agent/cash-in     | Agent  | Cash-in money to a user’s wallet    |
| POST   | /api/agent/cash-out    | Agent  | Cash-out money from a user’s wallet |   

# ⚙️ Admin  

| Method | Endpoint                       | Access | Description                            |
|--------|--------------------------------|--------|----------------------------------------|
| GET    | /api/admin/all                 | Admin  | View all users, agents, wallets, etc.  |
| PATCH  | /api/admin/wallets/:walletId   | Admin  | Block or unblock a wallet              |
| PATCH  | /api/admin/agents/:agentId     | Admin  | Approve or suspend an agent            |

---

## 📧 Contact
If you have any questions or suggestions, feel free to reach out!  

* Portfolio : [Yeasin Arafat](https://yeasin-arafat-portfolio.netlify.app)
* LinkedIn: [Yeasin Arafat](https://www.linkedin.com/in/yeasinarafat121)




