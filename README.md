# Swish 🚀
### Private Social Sharing Platform for Campus Communities

Swish is a high-energy, full-stack social sharing platform designed exclusively for campus environments. It bridges the gap between modern social media experiences and secure, private academic networking, allowing students and faculty to share achievements, updates, and photos within a trusted community.

## ✨ Key Features

- **📸 Photo Sharing:** Share your campus life through visual updates.
- **🛡️ Secure Networking:** Private, campus-exclusive environment.
- **💬 Engagement:** Like, comment, and connect with peers and faculty.
- **🔔 Real-time Notifications:** Stay updated with community interactions.
- **👤 Profile Management:** Customize your digital identity.
- **👮 Admin Moderation:** Tools for maintaining a safe academic space.

## 🛠️ Tech Stack

### Frontend
- **Framework:** [React](https://reactjs.org/) (v19)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Routing:** [React Router](https://reactrouter.com/)

### Backend
- **Environment:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/)
- **Authentication:** [JWT](https://jwt.io/) & [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- **File Handling:** [Multer](https://github.com/expressjs/multer)

## 📁 Project Structure

```text
Swish/
├── frontend/          # React + Vite application
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
├── backend/           # Node.js + Express API
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── middleware/
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (Local or Atlas)

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Swish
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Create a .env file with:
   # PORT=5000
   # MONGO_URI=your_mongodb_uri
   # JWT_SECRET=your_secret_key
   node server.js
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---
*Created with ❤️ for vibrant campus communities.*
