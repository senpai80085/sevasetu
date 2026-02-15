import React, { useState, useEffect, useCallback } from 'react';
import ScreenContainer from '../components/ScreenContainer';
import CareCard from '../components/CareCard';
import DualText from '../components/DualText';
import PrimaryButton from '../components/PrimaryButton';
import { getAuthHeaders } from '../utils/auth';

const CAREGIVER_API = 'http://localhost:8001';

export default function AssignedJobs() {
    // phase: 'waiting' | 'job' | 'traveling' | 'session'
    const [phase, setPhase] = useState('waiting');
    const [jobs, setJobs] = useState([]);
    const [activeJob, setActiveJob] = useState(null);
    const [seconds, setSeconds] = useState(0);

    // ── POLL for pending bookings ──────────────────────────────
    const fetchJobs = useCallback(async () => {
        try {
            const res = await fetch(`${CAREGIVER_API}/caregiver/bookings/pending`, {
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
                if (data.length > 0 && phase === 'waiting') {
                    setPhase('job');
                }
            }
        } catch (err) {
            console.error('Poll failed:', err);
        }
    }, [phase]);

    // ── Check for ACTIVE job on mount (restore session) ────────
    useEffect(() => {
        const checkActive = async () => {
            try {
                const res = await fetch(`${CAREGIVER_API}/caregiver/jobs/me`, {
                    headers: getAuthHeaders(),
                });
                if (res.ok) {
                    const myJobs = await res.json();
                    // Find any job that is NOT completed/cancelled
                    const active = myJobs.find(j => ['accepted', 'in_progress', 'paused'].includes(j.status));
                    if (active) {
                        setActiveJob(active);
                        if (active.status === 'accepted') setPhase('traveling');
                        else setPhase('session');
                    }
                }
            } catch (err) {
                console.error('Check active failed:', err);
            }
        };
        checkActive();
    }, []);

    useEffect(() => {
        // Only poll when waiting or showing job list
        if (phase !== 'waiting' && phase !== 'job') return;
        fetchJobs();
        const interval = setInterval(fetchJobs, 3000);
        return () => clearInterval(interval);
    }, [fetchJobs, phase]);

    // ── Session timer ──────────────────────────────────────────
    useEffect(() => {
        if (phase !== 'session') return;
        const interval = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(interval);
    }, [phase]);

    const formatTimer = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    // ── ACCEPT job ─────────────────────────────────────────────
    const handleAccept = async (job) => {
        try {
            await fetch(`${CAREGIVER_API}/caregiver/bookings/${job.id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ status: 'accepted' }),
            });
        } catch (err) {
            console.error('Accept API failed:', err);
        }
        setActiveJob(job);
        setPhase('traveling');
    };

    // ── REJECT job ─────────────────────────────────────────────
    const handleReject = async (job) => {
        try {
            await fetch(`${CAREGIVER_API}/caregiver/bookings/${job.id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ status: 'rejected' }),
            });
        } catch (err) {
            console.error('Reject API failed:', err);
        }
        setJobs(prev => prev.filter(j => j.id !== job.id));
        if (jobs.length <= 1) setPhase('waiting');
    };

    // ── ARRIVED → start job ────────────────────────────────────
    const handleArrived = async () => {
        try {
            await fetch(`${CAREGIVER_API}/caregiver/start-job/${activeJob.id}`, {
                method: 'POST',
                headers: getAuthHeaders(),
            });
        } catch (err) {
            console.error('Start-job API failed:', err);
        }
        setSeconds(0);
        setPhase('session');
    };

    // ── END session ────────────────────────────────────────────
    const handleEndSession = async () => {
        try {
            await fetch(`${CAREGIVER_API}/caregiver/end-job/${activeJob.id}`, {
                method: 'POST',
                headers: getAuthHeaders(),
            });
        } catch (err) {
            console.error('End-job API failed:', err);
        }
        setActiveJob(null);
        setPhase('waiting');
        setSeconds(0);
        fetchJobs();
    };

    const formatTime = (iso) => {
        try { return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }
        catch { return 'TBD'; }
    };

    const formatDate = (iso) => {
        try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); }
        catch { return 'Today'; }
    };

    // ════════════════════════════════════════════════════════════
    // PHASE 1: WAITING — no jobs yet
    // ════════════════════════════════════════════════════════════
    if (phase === 'waiting') {
        return (
            <ScreenContainer>
                <DualText en="Dashboard" hi="डैशबोर्ड" size="heading" className="mb-6" />
                <CareCard className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>
                    <DualText en="No jobs yet" hi="अभी कोई नौकरी नहीं" className="mb-2" />
                    <p className="text-sm text-txtSecondary animate-pulse">Scanning for nearby requests...</p>
                    <p className="text-xs text-txtSecondary font-hindi mt-1">पास के अनुरोधों की खोज कर रहे हैं...</p>
                </CareCard>
            </ScreenContainer>
        );
    }

    // ════════════════════════════════════════════════════════════
    // PHASE 2: JOB NOTIFICATION — show patient card
    // ════════════════════════════════════════════════════════════
    if (phase === 'job') {
        return (
            <ScreenContainer>
                <DualText en="Dashboard" hi="डैशबोर्ड" size="heading" className="mb-2" />
                <p className="text-sm text-txtSecondary mb-6">
                    {jobs.length} new request{jobs.length > 1 ? 's' : ''}
                </p>

                <div className="space-y-4">
                    {jobs.map(job => (
                        <CareCard key={job.id} className="border-l-4 border-primary relative overflow-hidden">
                            <div className="absolute top-3 right-3">
                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-1 rounded-full font-bold animate-pulse">
                                    NEW
                                </span>
                            </div>

                            {/* Patient Profile */}
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-lg font-bold text-primary flex-shrink-0">
                                    {(job.civilian_name || 'P')[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{job.civilian_name || 'Patient'}</h3>
                                    <p className="text-sm text-txtSecondary">
                                        <span className="font-hindi">रोगी / </span>Patient
                                    </p>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="bg-background rounded-lg p-3 mb-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-txtSecondary">📅 Date</span>
                                    <span className="font-medium">{formatDate(job.start_time)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-txtSecondary">⏰ Time</span>
                                    <span className="font-medium">{formatTime(job.start_time)} - {formatTime(job.end_time)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-txtSecondary">🩺 Care Type</span>
                                    <span className="font-medium">Elder Care</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleReject(job)}
                                    className="flex-1 py-3 border border-divider rounded-xl font-medium text-txtSecondary active:bg-gray-50"
                                >
                                    Reject
                                    <span className="block text-[10px] font-hindi opacity-70">अस्वीकार</span>
                                </button>
                                <button
                                    onClick={() => handleAccept(job)}
                                    className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 active:opacity-80"
                                >
                                    Accept Job
                                    <span className="block text-[10px] opacity-80 font-normal">नौकरी स्वीकारें</span>
                                </button>
                            </div>
                        </CareCard>
                    ))}
                </div>
            </ScreenContainer>
        );
    }

    // ════════════════════════════════════════════════════════════
    // PHASE 3: TRAVELING — on the way to patient
    // ════════════════════════════════════════════════════════════
    if (phase === 'traveling') {
        return (
            <ScreenContainer>
                <DualText en="Traveling" hi="यात्रा कर रहे हैं" size="heading" className="mb-6" />

                <CareCard className="text-center py-8 mb-6">
                    <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>

                    <DualText en="On the way to patient" hi="रोगी के पास जा रहे हैं" className="mb-2" />
                    <p className="text-txtSecondary text-sm mb-1">{activeJob?.civilian_name}</p>
                    <p className="text-xs text-txtSecondary">
                        {formatDate(activeJob?.start_time)} • {formatTime(activeJob?.start_time)}
                    </p>

                    <div className="mt-6 flex items-center justify-center gap-2 text-blue-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                        <span className="text-sm font-medium animate-pulse">Navigating...</span>
                    </div>
                </CareCard>

                <PrimaryButton
                    en="I've Arrived — Start Session"
                    hi="मैं पहुँच गया — सत्र शुरू करें"
                    onClick={handleArrived}
                />
            </ScreenContainer>
        );
    }

    // ════════════════════════════════════════════════════════════
    // PHASE 4: SESSION — live timer
    // ════════════════════════════════════════════════════════════
    return (
        <ScreenContainer>
            <DualText en="Active Session" hi="सक्रिय सत्र" size="heading" className="mb-6" />

            <CareCard className="text-center py-8 mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </div>

                <DualText en="Care in Progress" hi="देखभाल जारी है" className="mb-2" />
                <p className="text-txtSecondary text-sm mb-4">
                    Patient: <span className="font-semibold text-txtPrimary">{activeJob?.civilian_name}</span>
                </p>

                {/* Timer */}
                <div className="bg-background rounded-xl py-4 px-6 mb-4">
                    <p className="text-4xl font-bold text-primary font-mono tracking-wider">
                        {formatTimer(seconds)}
                    </p>
                    <DualText en="Session duration" hi="सत्र की अवधि" size="small" className="mt-1" />
                </div>
            </CareCard>

            {/* Safety indicator */}
            <CareCard className="mb-4 bg-primary/5">
                <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 1l6 3v5c0 4.418-2.686 8.166-6 9-3.314-.834-6-4.582-6-9V4l6-3z" clipRule="evenodd" />
                    </svg>
                    <DualText en="Safety monitoring active" hi="सुरक्षा निगरानी सक्रिय" size="small" />
                </div>
            </CareCard>

            <PrimaryButton
                en="End Session"
                hi="सत्र समाप्त करें"
                variant="danger"
                onClick={handleEndSession}
                className="mt-4"
            />
        </ScreenContainer>
    );
}
