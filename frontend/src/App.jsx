import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import SplashScreen from './components/SplashScreen';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import PostView from './pages/PostView';
import CreatePost from './pages/CreatePost';
import CreateStory from './pages/CreateStory';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import EditProfile from './pages/EditProfile';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Bookmarks from './pages/Bookmarks';
import Announcements from './pages/AnnouncementsNew';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudents from './pages/AdminStudents';
import AdminFaculties from './pages/AdminFaculties';
import AdminReports from './pages/AdminReports';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-3 border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-3 border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'Admin') return <Navigate to="/" />;

  return children;
};

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Only show splash on first visit during session
    return !sessionStorage.getItem('splashShown');
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem('splashShown', 'true');
    setShowSplash(false);
  };

  return (
    <AuthProvider>
      <ToastProvider>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }>
              <Route index element={<Home />} />
              <Route path="explore" element={<Explore />} />
              <Route path="create" element={<CreatePost />} />
              <Route path="create-story" element={<CreateStory />} />
              <Route path="post/:id" element={<PostView />} />
              <Route path="profile" element={<Profile />} />
              <Route path="profile/edit" element={<EditProfile />} />
              <Route path="user/:id" element={<UserProfile />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="messages" element={<Messages />} />
              <Route path="announcements" element={<Announcements />} />
              <Route path="bookmarks" element={<Bookmarks />} />
              <Route path="admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="admin/students" element={
                <AdminRoute>
                  <AdminStudents />
                </AdminRoute>
              } />
              <Route path="admin/faculties" element={
                <AdminRoute>
                  <AdminFaculties />
                </AdminRoute>
              } />
              <Route path="admin/reports" element={
                <AdminRoute>
                  <AdminReports />
                </AdminRoute>
              } />
            </Route>
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

