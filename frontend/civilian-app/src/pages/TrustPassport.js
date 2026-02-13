import React from 'react';
import ScreenContainer from '../components/ScreenContainer';
import CareCard from '../components/CareCard';
import DualText from '../components/DualText';
import TrustBadge from '../components/TrustBadge';

export default function TrustPassport() {
    // In production these come from the API
    const trustData = {
        score: 78,
        rating: 4.3,
        totalRatings: 18,
        completedJobs: 24,
        verified: true,
        memberSince: 'Jan 2025',
    };

    const renderStars = (avg) => {
        const full = Math.floor(avg);
        const half = avg - full >= 0.5 ? 1 : 0;
        const empty = 5 - full - half;
        return '★'.repeat(full) + (half ? '✮' : '') + '☆'.repeat(empty);
    };

    return (
        <ScreenContainer>
            <DualText en="Trust Passport" hi="विश्वास पासपोर्ट" size="heading" className="mb-2" />
            <DualText
                en="This shows reliability"
                hi="यह विश्वसनीयता दर्शाता है"
                size="small"
                className="mb-6"
            />

            {/* Main score card */}
            <CareCard className="mb-6 text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl font-bold text-primary">{trustData.score}</span>
                </div>
                <DualText en="Trust Score" hi="विश्वास स्कोर" className="mb-3" />
                <TrustBadge score={trustData.score} className="mx-auto" />
            </CareCard>

            {/* Breakdown */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <CareCard className="text-center">
                    <p className="text-2xl font-bold text-primary mb-1">
                        {renderStars(trustData.rating)}
                    </p>
                    <p className="text-lg font-semibold text-txtPrimary">{trustData.rating}</p>
                    <DualText en="Average Rating" hi="औसत रेटिंग" size="small" />
                    <p className="text-xs text-txtSecondary mt-1">
                        ({trustData.totalRatings} reviews / समीक्षाएं)
                    </p>
                </CareCard>

                <CareCard className="text-center">
                    <p className="text-3xl font-bold text-primary mb-1">{trustData.completedJobs}</p>
                    <DualText en="Completed Jobs" hi="पूर्ण कार्य" size="small" />
                </CareCard>
            </div>

            {/* Verification status */}
            <CareCard className="mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${trustData.verified ? 'bg-primary/10' : 'bg-danger/10'}`}>
                        {trustData.verified ? (
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-danger" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </div>
                    <div>
                        <DualText
                            en={trustData.verified ? 'Identity Verified' : 'Not Verified'}
                            hi={trustData.verified ? 'पहचान सत्यापित' : 'सत्यापित नहीं'}
                        />
                    </div>
                </div>
            </CareCard>

            <CareCard>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-txtSecondary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 4h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <DualText
                        en={`Member since ${trustData.memberSince}`}
                        hi={`${trustData.memberSince} से सदस्य`}
                    />
                </div>
            </CareCard>
        </ScreenContainer>
    );
}
