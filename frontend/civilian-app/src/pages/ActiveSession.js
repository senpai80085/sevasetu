import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScreenContainer from '../components/ScreenContainer';
import CareCard from '../components/CareCard';
import DualText from '../components/DualText';
import PrimaryButton from '../components/PrimaryButton';

const CIVILIAN_API = 'http://localhost:8002';

function getAuthToken() {
    try {
        const session = localStorage.getItem('civilian_session');
        if (session) return JSON.parse(session).access_token;
    } catch { /* ignore */ }
    return localStorage.getItem('access_token') || '';
}

export default function ActiveSession() {
    const navigate = useNavigate();
    const [seconds, setSeconds] = useState(0);
    const [bookingStatus, setBookingStatus] = useState('confirmed'); // start with confirmed
    const caregiverName = localStorage.getItem('current_caregiver_name') || 'Caregiver';
    const bookingId = localStorage.getItem('current_booking_id');

    // ── RATING: Session completed, ask for review ──────────────────
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [caregiverId, setCaregiverId] = useState(null);

    // Update poll to get caregiver_id
    useEffect(() => {
        if (!bookingId) return;
        if (bookingStatus === 'rated') return;

        const poll = async () => {
            try {
                const token = getAuthToken();
                const res = await fetch(`${CIVILIAN_API}/civilian/booking/status/${bookingId}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (res.ok) {
                    const data = await res.json();
                    setBookingStatus(data.status);
                    if (data.caregiver_id) setCaregiverId(data.caregiver_id);
                    if (data.caregiver_name) {
                        localStorage.setItem('current_caregiver_name', data.caregiver_name);
                    }
                }
            } catch (err) {
                console.error('Poll failed:', err);
            }
        };

        poll();
        const interval = setInterval(poll, 3000);
        return () => clearInterval(interval);
    }, [bookingId, bookingStatus]);

    // ── Session timer — only runs when in_progress ─────────────
    useEffect(() => {
        if (bookingStatus !== 'in_progress') return;
        const interval = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(interval);
    }, [bookingStatus]);

    const formatTime = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    const handleSubmitRating = async () => {
        if (!rating) return alert('Please select a star rating');
        try {
            const token = getAuthToken();
            await fetch(`${CIVILIAN_API}/civilian/submit-rating`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    caregiver_id: caregiverId,
                    rating: rating,
                    review_text: review,
                }),
            });
            setBookingStatus('rated');
            // Clean up
            localStorage.removeItem('current_booking_id');
            localStorage.removeItem('current_caregiver_name');
        } catch (err) {
            console.error('Rating failed:', err);
            alert('Failed to submit rating');
        }
    };

    if (bookingStatus === 'completed') {
        return (
            <ScreenContainer>
                <DualText en="Session Complete" hi="सत्र पूरा हुआ" size="heading" className="mb-6" />
                <CareCard className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <DualText en="Care session finished" hi="देखभाल सत्र समाप्त हो गया" className="mb-6" />

                    <div className="mb-6">
                        <p className="text-sm text-txtSecondary mb-2 font-medium">Rate your experience</p>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={`w-10 h-10 text-2xl transition-colors ${star <= rating ? 'text-yellow-400 scale-110' : 'text-gray-300 hover:text-yellow-200'
                                        }`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>

                    <textarea
                        className="w-full p-3 border border-divider rounded-xl mb-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        rows="3"
                        placeholder="Write a review... (optional)"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                    />

                    <PrimaryButton
                        en="Submit Review"
                        hi="समीक्षा जमा करें"
                        onClick={handleSubmitRating}
                    />
                </CareCard>
            </ScreenContainer>
        );
    }

    if (bookingStatus === 'rated' || bookingStatus === 'closed') {
        return (
            <ScreenContainer>
                <div className="text-center py-20 px-4">
                    <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-4xl">🙏</span>
                    </div>
                    <DualText en="Thank You!" hi="धन्यवाद!" size="heading" className="mb-2" />
                    <p className="text-txtSecondary mb-8">Your feedback helps us improve.</p>
                    <PrimaryButton en="Back Home" hi="घर वापस" onClick={() => navigate('/')} />
                </div>
            </ScreenContainer>
        );
    }

    // ── IN_PROGRESS: Live session timer ────────────────────────
    return (
        <ScreenContainer>
            <DualText en="Active Care Session" hi="सक्रिय देखभाल सत्र" size="heading" className="mb-6" />

            <CareCard className="mb-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>

                    <DualText en="Care in Progress" hi="देखभाल जारी है" size="heading" className="mb-2" />

                    <p className="text-txtSecondary mb-1">
                        Caregiver: <span className="font-semibold text-txtPrimary">{caregiverName}</span>
                    </p>
                    <p className="text-sm text-txtSecondary font-hindi mb-4">
                        देखभालकर्ता: {caregiverName}
                    </p>

                    {/* Timer */}
                    <div className="bg-background rounded-xl py-4 px-6 mb-4">
                        <p className="text-3xl font-bold text-primary font-mono tracking-wider">
                            {formatTime(seconds)}
                        </p>
                        <DualText en="Session duration" hi="सत्र की अवधि" size="small" className="mt-1" />
                    </div>
                </div>
            </CareCard>

            {/* Safety status */}
            <CareCard className="mb-4 bg-primary/5">
                <div className="flex items-center gap-3">
                    <svg className="w-7 h-7 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 1l6 3v5c0 4.418-2.686 8.166-6 9-3.314-.834-6-4.582-6-9V4l6-3z" clipRule="evenodd" />
                    </svg>
                    <DualText en="Safety monitoring active" hi="सुरक्षा निगरानी सक्रिय" size="small" />
                </div>
            </CareCard>

            <PrimaryButton
                en="View Safety Options"
                hi="सुरक्षा विकल्प देखें"
                variant="secondary"
                onClick={() => navigate('/safety')}
                className="mb-4"
            />

            {/* Emergency button */}
            <div className="fixed bottom-24 left-0 right-0 px-4">
                <div className="max-w-app mx-auto">
                    <PrimaryButton
                        en="⚠ Emergency"
                        hi="आपातकालीन स्थिति"
                        variant="danger"
                        onClick={() => {
                            alert('Emergency services will be contacted. Guardian has been notified.');
                        }}
                    />
                </div>
            </div>
        </ScreenContainer>
    );
}
