import React from 'react';
import ScreenContainer from '../components/ScreenContainer';
import CareCard from '../components/CareCard';
import DualText from '../components/DualText';

export default function Bookings() {
    // Mock bookings
    const bookings = [
        { id: 1, caregiver: 'Priya Sharma', date: '13 Feb 2026', time: '09:00 – 11:00', status: 'confirmed', statusHi: 'पुष्टि हुई' },
        { id: 2, caregiver: 'Rajesh Singh', date: '14 Feb 2026', time: '14:00 – 16:00', status: 'pending', statusHi: 'लंबित' },
    ];

    const statusColors = {
        pending: 'bg-alert/20 text-alert',
        matched: 'bg-secondary/20 text-primary',
        confirmed: 'bg-primary/10 text-primary',
        in_progress: 'bg-primary/20 text-primary',
        completed: 'bg-secondary/30 text-primary',
        cancelled: 'bg-danger/10 text-danger',
    };

    return (
        <ScreenContainer>
            <DualText en="Your Bookings" hi="आपकी बुकिंग" size="heading" className="mb-6" />

            {bookings.length === 0 ? (
                <CareCard className="text-center py-8">
                    <DualText en="No bookings yet" hi="अभी तक कोई बुकिंग नहीं" />
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
                                    {b.status}
                                    <span className="block font-hindi text-[10px]">{b.statusHi}</span>
                                </span>
                            </div>
                        </CareCard>
                    ))}
                </div>
            )}
        </ScreenContainer>
    );
}
