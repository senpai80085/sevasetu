import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScreenContainer from '../components/ScreenContainer';
import CareCard from '../components/CareCard';
import DualText from '../components/DualText';
import PrimaryButton from '../components/PrimaryButton';

export default function Login() {
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('phone');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:8006/auth/caregiver/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone_number: `+91${phone}` }),
            });

            if (!res.ok) throw new Error('Failed to send OTP');

            const data = await res.json();
            console.log('[DEV] OTP:', data.otp);
            alert(`Your OTP is: ${data.otp}`);
            setStep('otp');
        } catch (err) {
            setError(err.message || 'Connection failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:8006/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone_number: `+91${phone}`,
                    role: 'caregiver',
                    otp: otp,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.detail || 'Invalid OTP');
            }

            const data = await res.json();

            // Store tokens in role-specific storage keys
            localStorage.setItem('caregiver_session', JSON.stringify({
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                role: data.role,
                identity_id: data.identity_id,
                session_id: data.session_id,
            }));

            localStorage.setItem('caregiver_phone', `+91${phone}`);
            localStorage.setItem('caregiver_id', data.identity_id);

            navigate('/');
        } catch (err) {
            setError(err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenContainer>
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="mb-8 p-4 bg-primary/10 rounded-full">
                    <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                </div>

                <DualText en="Caregiver Login" hi="देखभालकर्ता लॉगिन" size="heading" className="mb-6 text-center" />

                {step === 'phone' ? (
                    <CareCard className="w-full">
                        <form onSubmit={handleRequestOTP} className="space-y-5">
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-txtSecondary font-medium pointer-events-none">
                                    +91
                                </span>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setPhone(val);
                                    }}
                                    className="w-full h-12 pl-14 pr-4 rounded-xl bg-surface border border-divider text-body focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium"
                                    placeholder="XXXXX XXXXX"
                                    required
                                    minLength={10}
                                />
                            </div>
                            {error && <div className="text-sm text-danger">{error}</div>}
                            <PrimaryButton en="Send OTP" hi="ओटीपी भेजें" type="submit" disabled={loading || phone.length < 10} />
                        </form>
                    </CareCard>
                ) : (
                    <CareCard className="w-full">
                        <form onSubmit={handleVerifyOTP} className="space-y-5">
                            <div>
                                <label className="block text-body font-medium text-txtPrimary mb-1.5">Enter OTP</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl bg-surface border border-divider text-body focus:outline-none focus:ring-2 focus:ring-primary/30 text-center text-xl tracking-widest"
                                    placeholder="••••••"
                                    required
                                    maxLength={6}
                                />
                            </div>
                            {error && <div className="text-sm text-danger">{error}</div>}
                            <PrimaryButton en="Verify & Login" hi="लॉगिन करें" type="submit" disabled={loading || otp.length !== 6} />
                        </form>
                    </CareCard>
                )}
            </div>
        </ScreenContainer>
    );
}
