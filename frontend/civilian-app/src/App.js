import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Home from './pages/Home';
import MatchResults from './pages/MatchResults';
import ActiveSession from './pages/ActiveSession';
import Safety from './pages/Safety';
import Bookings from './pages/Bookings';
import History from './pages/History';
import Profil from './pages/Profile';
import FindCaregiver from './pages/FindCaregiver';
import SafetySession from './pages/SafetySession';

function App() {
    return (
        <BrowserRouter>
            <div className="bg-background min-h-screen font-sans text-txtPrimary">
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/" element={
                        <ProtectedRoute>
                            <Home />
                            <BottomNav />
                        </ProtectedRoute>
                    } />

                    <Route path="/match" element={
                        <ProtectedRoute>
                            <MatchResults />
                            <BottomNav />
                        </ProtectedRoute>
                    } />

                    <Route path="/session" element={
                        <ProtectedRoute>
                            <ActiveSession />
                            <BottomNav />
                        </ProtectedRoute>
                    } />

                    <Route path="/safety" element={
                        <ProtectedRoute>
                            <Safety />
                            <BottomNav />
                        </ProtectedRoute>
                    } />

                    <Route path="/find-caregiver" element={
                        <ProtectedRoute>
                            <FindCaregiver />
                            <BottomNav />
                        </ProtectedRoute>
                    } />

                    <Route path="/safety-session" element={
                        <ProtectedRoute>
                            <SafetySession />
                            <BottomNav />
                        </ProtectedRoute>
                    } />

                    <Route path="/bookings" element={
                        <ProtectedRoute>
                            <Bookings />
                            <BottomNav />
                        </ProtectedRoute>
                    } />

                    <Route path="/history" element={
                        <ProtectedRoute>
                            <History />
                            <BottomNav />
                        </ProtectedRoute>
                    } />

                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <Profile />
                            <BottomNav />
                        </ProtectedRoute>
                    } />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
