import React, { useEffect, useState } from 'react';
import ScreenContainer from '../components/ScreenContainer';
import CareCard from '../components/CareCard';
import DualText from '../components/DualText';
import PrimaryButton from '../components/PrimaryButton';
import { useNavigate } from 'react-router-dom';

/* ── DEMO_MODE: Status translations ─────────────────────────────────── */
const STATUS_LABELS = {
    pending: { en: 'Pending', hi: 'लंबित' },
    matched: { en: 'Matched', hi: 'मिलान हुआ' },
    confirmed: { en: 'Confirmed', hi: 'पुष्टि हुई' },
    in_progress: { en: 'In Progress', hi: 'प्रगति में' },
    completed: { en: 'Completed', hi: 'पूर्ण' },
    cancelled: { en: 'Cancelled', hi: 'रद्द' },
    closed: { en: 'Closed', hi: 'बंद' },
};

const statusColors = {
    pending: 'bg-alert/20 text-alert',
    matched: 'bg-secondary/20 text-primary',
    confirmed: 'bg-primary/10 text-primary',
    in_progress: 'bg-primary/20 text-primary',
    completed: 'bg-secondary/30 text-primary',
    cancelled: 'bg-danger/10 text-danger',
    closed: 'bg-gray-100 text-gray-600',
};

export default function Bookings() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        /* DEMO_MODE: Try to load bookings but never fail */
        const loadBookings = async () => {
            // Try reading from the booking we just created
            const bookingId = localStorage.getItem('current_booking_id');
            const caregiverName = localStorage.getItem('current_caregiver_name');

            if (bookingId) {
                setBookings([{
                    id: bookingId,
                    caregiver: caregiverName || 'Demo Caregiver',
                    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                    time: 'Today',
                    status: 'confirmed',
                    statusHi: 'पुष्टि हुई',
                }]);
            } else {
                // DEMO_MODE: Show "Find Caregiver" state instead of empty
                setBookings([]);
            }
            setLoading(false);
        };

        loadBookings();
    }, []);

    if (loading) {
        return (
            <ScreenContainer>
                <div className="flex justify-center mt-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <DualText en="Your Bookings" hi="आपकी बुकिंग" size="heading" className="mb-6" />

            {bookings.length === 0 ? (
                /* DEMO_MODE: Never show blank — prompt user to find caregiver */
                <CareCard className="text-center py-8">
                    <DualText
                        en="No active bookings"
                        hi="कोई सक्रिय बुकिंग नहीं"
                        className="mb-4"
                    />
                    <PrimaryButton
                        en="Find Caregiver"
                        hi="केयरगिवर खोजें"
                        onClick={() => navigate('/find-caregiver')}
                    />
                </CareCard>
            ) : (
                <div className="space-y-4">
                    {bookings.map((b) => (
                        <CareCard key={b.id}>
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h3 className="font-semibold text-txtPrimary">{b.caregiver}</h3>
                                    <p className="text-sm text-txtSecondary">{b.date}</p>
                                    <p className="text-sm text-txtSecondary">{b.time}</p>
                                </div>
                                <span className={`text-xs font-medium px-3 py-1 rounded-lg ${statusColors[b.status] || 'bg-gray-100'}`}>
                                    {STATUS_LABELS[b.status]?.en || b.status}
                                    <span className="block font-hindi text-[10px]">{STATUS_LABELS[b.status]?.hi || b.statusHi}</span>
                                </span>
                            </div>
                        </CareCard>
                    ))}
                </div>
            )}
        </ScreenContainer>
    );
}
