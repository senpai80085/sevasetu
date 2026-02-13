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

function App() {
    return (
        <BrowserRouter>
            <div className="bg-background min-h-screen font-sans text-txtPrimary">
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/" element={
                        <ProtectedRoute>
                            <nav className="p-4 bg-primary text-white flex justify-between items-center shadow-md">
                                <h1 className="font-bold text-lg">SevaSetu Caregiver</h1>
                                <button
                                    onClick={() => require('./utils/auth').logout()}
                                    className="text-sm bg-white/20 px-3 py-1 rounded"
                                >
                                    Logout
                                </button>
                            </nav>
                            <AssignedJobs />
                        </ProtectedRoute>
                    } />

                    <Route path="/availability" element={
                        <ProtectedRoute>
                            <ToggleAvailability />
                        </ProtectedRoute>
                    } />

                    <Route path="/register" element={
                        <ProtectedRoute>
                            <RegisterProfile />
                        </ProtectedRoute>
                    } />

                    <Route path="/trust" element={
                        <ProtectedRoute>
                            <TrustPassport />
                        </ProtectedRoute>
                    } />

                    <Route path="/jobs" element={
                        <ProtectedRoute>
                            <JobRequests />
                        </ProtectedRoute>
                    } />

                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <Profile />
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
