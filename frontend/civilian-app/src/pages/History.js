import React from 'react';
import ScreenContainer from '../components/ScreenContainer';
import CareCard from '../components/CareCard';
import DualText from '../components/DualText';

export default function History() {
    const history = [
        { id: 1, caregiver: 'Anita Verma', date: '10 Feb 2026', rating: 4.5, status: 'Completed', statusHi: 'पूर्ण' },
        { id: 2, caregiver: 'Suresh Kumar', date: '5 Feb 2026', rating: 5.0, status: 'Completed', statusHi: 'पूर्ण' },
        { id: 3, caregiver: 'Meera Devi', date: '28 Jan 2026', rating: 4.0, status: 'Completed', statusHi: 'पूर्ण' },
    ];

    return (
        <ScreenContainer>
            <DualText en="Care History" hi="देखभाल इतिहास" size="heading" className="mb-6" />

            {history.length === 0 ? (
                <CareCard className="text-center py-8">
                    <DualText en="No past sessions" hi="कोई पिछला सत्र नहीं" />
                </CareCard>
            ) : (
                <div className="space-y-4">
                    {history.map((h) => (
                        <CareCard key={h.id}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-txtPrimary">{h.caregiver}</h3>
                                    <p className="text-sm text-txtSecondary">{h.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-primary">
                                        {'★'.repeat(Math.round(h.rating))}{'☆'.repeat(5 - Math.round(h.rating))}
                                    </p>
                                    <p className="text-xs text-txtSecondary">{h.status}</p>
                                    <p className="text-[10px] text-txtSecondary font-hindi">{h.statusHi}</p>
                                </div>
                            </div>
                        </CareCard>
                    ))}
                </div>
            )}
        </ScreenContainer>
    );
}
