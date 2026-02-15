import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScreenContainer from '../components/ScreenContainer';
import CareCard from '../components/CareCard';
import DualText from '../components/DualText';
import PrimaryButton from '../components/PrimaryButton';

/**
 * Login screen for Civilian app.
 * Uses role-specific endpoint: POST /auth/civilian/login
 */
export default function Login() {
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('phone'); // 'phone' | 'otp'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:8006/auth/civilian/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone_number: `+91${phone}` }),
            });

            if (!res.ok) throw new Error('Failed to send OTP');

            const data = await res.json();
            console.log('[DEV] OTP:', data.otp); // For dev testing
            alert(`Your OTP is: ${data.otp}`);
            setStep('otp');
        } catch (err) {
            setError(err.message || 'We couldn\'t connect. Please try again.');
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
                    role: 'civilian',
                    otp: otp,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.detail || 'Invalid OTP');
            }

            const data = await res.json();

            // Store tokens in role-specific storage keys
            localStorage.setItem('civilian_session', JSON.stringify({
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                role: data.role,
                identity_id: data.identity_id,
                session_id: data.session_id,
            }));

            localStorage.setItem('user_phone', `+91${phone}`);
            localStorage.setItem('user_role', 'civilian');
            localStorage.setItem('civilian_id', data.identity_id);

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
                <DualText en="SevaSetu Login" hi="सेवासेतु लॉगिन" size="heading" className="mb-6 text-center" />

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

                            {error && (
                                <div className="text-sm text-danger">
                                    {error}
                                    <p className="text-xs font-hindi">कनेक्शन नहीं हो पाया</p>
                                </div>
                            )}

                            <PrimaryButton
                                en="Send OTP"
                                hi="ओटीपी भेजें"
                                type="submit"
                                disabled={loading || phone.length < 10}
                            />
                        </form>
                    </CareCard>
                ) : (
                    <CareCard className="w-full">
                        <form onSubmit={handleVerifyOTP} className="space-y-5">
                            <div>
                                <label className="block text-body font-medium text-txtPrimary mb-1.5">
                                    Enter OTP
                                    <span className="block text-sm text-txtSecondary font-hindi">ओटीपी दर्ज करें</span>
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl bg-surface border border-divider text-body focus:outline-none focus:ring-2 focus:ring-primary/30 text-center text-xl tracking-widest"
                                    placeholder="••••••"
                                    required
                                    maxLength={6}
                                    pattern="[0-9]{6}"
                                />
                                <p className="text-xs text-txtSecondary mt-2">
                                    Sent to +91 {phone}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStep('phone');
                                            setOtp('');
                                        }}
                                        className="text-primary ml-2 underline"
                                    >
                                        Change
                                    </button>
                                </p>
                            </div>

                            {error && (
                                <div className="text-sm text-danger">
                                    {error}
                                    <p className="text-xs font-hindi">अमान्य ओटीपी</p>
                                </div>
                            )}

                            <PrimaryButton
                                en="Verify & Login"
                                hi="सत्यापित करें और लॉगिन करें"
                                type="submit"
                                disabled={loading || otp.length !== 6}
                            />
                        </form>
                    </CareCard>
                )}
            </div>
        </ScreenContainer>
    );
}
