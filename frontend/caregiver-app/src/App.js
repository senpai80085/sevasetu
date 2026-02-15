import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import RegisterProfile from './pages/RegisterProfile';
import ToggleAvailability from './pages/ToggleAvailability';
import AssignedJobs from './pages/AssignedJobs';
import TrustPassport from './pages/TrustPassport';
import JobRequests from './pages/JobRequests';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import BottomNav from './components/BottomNav';

function App() {
    return (
        <BrowserRouter>
            <div className="bg-background min-h-screen font-sans text-txtPrimary">
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/" element={
                        <ProtectedRoute>
                            <AssignedJobs />
                            <BottomNav />
                        </ProtectedRoute>
                    } />

                    <Route path="/availability" element={
                        <ProtectedRoute>
                            <ToggleAvailability />
                            <BottomNav />
                        </ProtectedRoute>
                    } />

                    <Route path="/register" element={
                        <ProtectedRoute>
                            <RegisterProfile />
                            <BottomNav />
                        </ProtectedRoute>
                    } />

                    <Route path="/trust" element={
                        <ProtectedRoute>
                            <TrustPassport />
                            <BottomNav />
                        </ProtectedRoute>
                    } />

                    <Route path="/jobs" element={
                        <ProtectedRoute>
                            <JobRequests />
                            <BottomNav />
                        </ProtectedRoute>
                    } />

                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <Profile />
                            <BottomNav />
                        </ProtectedRoute>
                    } />

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
