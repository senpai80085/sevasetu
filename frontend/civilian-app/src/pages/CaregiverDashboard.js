import React, { useState } from 'react';
import ScreenContainer from '../components/ScreenContainer';
import CareCard from '../components/CareCard';
import DualText from '../components/DualText';
import PrimaryButton from '../components/PrimaryButton';
import TrustBadge from '../components/TrustBadge';

export default function CaregiverDashboard() {
    const [available, setAvailable] = useState(true);

    // Mock jobs data
    const todaysJobs = [
        { id: 1, clientName: 'Ramesh Kumar', time: '09:00 – 11:00', status: 'confirmed', statusHi: 'पुष्टि हुई' },
        { id: 2, clientName: 'Sunita Devi', time: '14:00 – 16:00', status: 'in_progress', statusHi: 'जारी है' },
    ];

    const trustScore = 78;
    const totalJobs = 24;
    const rating = 4.3;

    const statusColors = {
        confirmed: 'bg-alert/20 text-alert',
        in_progress: 'bg-primary/10 text-primary',
        completed: 'bg-secondary/20 text-primary',
    };

    return (
        <ScreenContainer>
            <DualText en="Caregiver Dashboard" hi="देखभालकर्ता डैशबोर्ड" size="heading" className="mb-6" />

            {/* Availability toggle */}
            <CareCard className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <DualText en="Your Availability" hi="आपकी उपलब्धता" />
                        <p className={`text-sm font-semibold mt-1 ${available ? 'text-primary' : 'text-danger'}`}>
                            {available ? 'Available' : 'Not Available'}
                        </p>
                        <p className="text-xs text-txtSecondary font-hindi">
                            {available ? 'उपलब्ध' : 'उपलब्ध नहीं'}
                        </p>
                    </div>

                    {/* Large toggle switch */}
                    <button
                        onClick={() => setAvailable(!available)}
                        className={`
              relative w-20 h-10 rounded-full transition-colors
              ${available ? 'bg-primary' : 'bg-gray-300'}
            `}
                    >
                        <span
                            className={`
                absolute top-1 w-8 h-8 bg-white rounded-full shadow transition-transform
                ${available ? 'translate-x-11' : 'translate-x-1'}
              `}
                        />
                    </button>
                </div>
            </CareCard>

            {/* Trust passport preview */}
            <CareCard className="mb-6 bg-accent/30">
                <div className="flex items-center justify-between mb-3">
                    <DualText en="Trust Passport" hi="विश्वास पासपोर्ट" />
                    <TrustBadge score={trustScore} />
                </div>
                <div className="flex justify-around text-center">
                    <div>
                        <p className="text-2xl font-bold text-primary">{trustScore}</p>
                        <DualText en="Trust Score" hi="विश्वास स्कोर" size="small" />
                    </div>
                    <div className="w-px bg-divider" />
                    <div>
                        <p className="text-2xl font-bold text-primary">{rating}★</p>
                        <DualText en="Rating" hi="रेटिंग" size="small" />
                    </div>
                    <div className="w-px bg-divider" />
                    <div>
                        <p className="text-2xl font-bold text-primary">{totalJobs}</p>
                        <DualText en="Jobs Done" hi="कार्य पूर्ण" size="small" />
                    </div>
                </div>
            </CareCard>

            {/* Today's jobs */}
            <DualText en="Today's Jobs" hi="आज के कार्य" className="mb-3 font-semibold" />

            {todaysJobs.length === 0 ? (
                <CareCard className="text-center py-6">
                    <DualText en="No jobs scheduled today" hi="आज कोई कार्य निर्धारित नहीं है" />
                </CareCard>
            ) : (
                <div className="space-y-3">
                    {todaysJobs.map((job) => (
                        <CareCard key={job.id}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-txtPrimary">{job.clientName}</h3>
                                <span className={`text-xs font-medium px-3 py-1 rounded-lg ${statusColors[job.status] || 'bg-gray-100'}`}>
                                    {job.status.replace(/_/g, ' ')}
                                </span>
                            </div>
                            <p className="text-sm text-txtSecondary">{job.time}</p>
                            <p className="text-xs text-txtSecondary font-hindi">{job.statusHi}</p>

                            {job.status === 'confirmed' && (
                                <PrimaryButton en="Start Job" hi="कार्य शुरू करें" className="mt-3" />
                            )}
                            {job.status === 'in_progress' && (
                                <PrimaryButton en="End Job" hi="कार्य समाप्त करें" variant="secondary" className="mt-3" />
                            )}
                        </CareCard>
                    ))}
                </div>
            )}
        </ScreenContainer>
    );
}
