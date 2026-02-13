import React, { useState } from 'react';
import ScreenContainer from '../components/ScreenContainer';
import DualText from '../components/DualText';
import PrimaryButton from '../components/PrimaryButton';

export default function SafetySession() {
    const [active, setActive] = useState(false);
    const [timer, setTimer] = useState(0);

    const handleStart = async () => {
        try {
            await fetch('http://localhost:8002/civilian/safety/session/start', {
                method: 'POST',
                headers: {
                    'Authorization': localStorage.getItem('civilian_session') ? `Bearer ${JSON.parse(localStorage.getItem('civilian_session')).access_token}` : ''
                }
            });
            setActive(true);
            // Simple timer
            setInterval(() => setTimer(t => t + 1), 1000);
        } catch (err) {
            console.error(err);
            alert('Could not start safety session');
        }
    };

    const formatTime = (s) => {
        const min = Math.floor(s / 60);
        const sec = s % 60;
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    return (
        <ScreenContainer>
            <div className="p-4 flex flex-col h-[80vh]">
                <DualText en="Safety Session" hi="सुरक्षा सत्र" size="heading" className="mb-6" />

                {!active ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold mb-2">Record Your Session</h3>
                        <p className="text-txtSecondary mb-8 max-w-xs">
                            Start a live safety session. Video is encrypted and stored on blockchain for evidence.
                        </p>
                        <PrimaryButton
                            en="Start Live Safety Session"
                            hi="सुरक्षा सत्र शुरू करें"
                            onClick={handleStart}
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col">
                        <div className="relative bg-black rounded-2xl overflow-hidden flex-1 mb-6 flex items-center justify-center">
                            {/* Simulated Video Feed */}
                            <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full animate-pulse z-10">
                                <div className="w-2 h-2 bg-white rounded-full" />
                                <span className="text-white text-xs font-bold">REC {formatTime(timer)}</span>
                            </div>

                            <p className="text-white/50">Camera Feed (Simulated)</p>

                            {/* Overlay UI */}
                            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                        <div className="w-3 h-3 bg-green-400 rounded-full" />
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-bold">Encrypted</p>
                                        <p className="text-white/70 text-xs">Storing to IPFS...</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-red-100 text-red-700 py-4 rounded-xl font-bold"
                        >
                            End Session
                        </button>
                    </div>
                )}
            </div>
        </ScreenContainer>
    );
}
