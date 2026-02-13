import React, { useState, useEffect } from 'react';
import ScreenContainer from '../components/ScreenContainer';
import CareCard from '../components/CareCard';
import DualText from '../components/DualText';
import { getSession, getAuthHeaders, validateSession } from '../utils/auth';

const CAREGIVER_API = 'http://localhost:8001';

export default function TrustPassport() {
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInfo();
    }, []);

    const fetchInfo = async () => {
        if (!validateSession()) return;
        const session = getSession();

        try {
            const res = await fetch(`${CAREGIVER_API}/caregiver/me`, {
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                const data = await res.json();
                setInfo(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenContainer>
            <DualText en="Trust Passport" hi="विश्वास पासपोर्ट" size="heading" className="mb-6" />

            {loading && <p className="text-center text-txtSecondary">Loading...</p>}

            {info && (
                <div className="space-y-4">
                    {/* Score Circle */}
                    <div className="flex justify-center my-6">
                        <div className="relative w-40 h-40">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="#E2E8E5" strokeWidth="10" fill="transparent" />
                                <circle cx="80" cy="80" r="70" stroke="#2E7D61" strokeWidth="10" fill="transparent"
                                    strokeDasharray={440}
                                    strokeDashoffset={440 - (440 * (info.trust_score || 0)) / 100}
                                    className="transition-all duration-1000"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-primary">{Math.round(info.trust_score || 0)}</span>
                                <span className="text-xs text-txtSecondary uppercase tracking-wide">Score</span>
                            </div>
                        </div>
                    </div>

                    <CareCard>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-txtPrimary">{info.experience_years || 0}</p>
                                <DualText en="Years Exp" hi="वर्ष का अनुभव" size="caption" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-txtPrimary">
                                    {info.verified ? '✓' : '✕'}
                                </p>
                                <DualText en="Verified" hi="सत्यापित" size="caption" />
                            </div>
                        </div>
                    </CareCard>

                    <CareCard>
                        <DualText en="Skills" hi="कौशल" size="subheading" className="mb-3" />
                        <div className="flex flex-wrap gap-2">
                            {info.skills && info.skills.map(skill => (
                                <span key={skill} className="px-3 py-1 bg-secondary/50 text-primary text-sm rounded-lg border border-primary/10">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </CareCard>
                </div>
            )}
        </ScreenContainer>
    );
}
