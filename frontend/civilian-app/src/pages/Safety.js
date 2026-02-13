import React from 'react';
import ScreenContainer from '../components/ScreenContainer';
import CareCard from '../components/CareCard';
import DualText from '../components/DualText';
import PrimaryButton from '../components/PrimaryButton';

export default function Safety() {
    return (
        <ScreenContainer>
            <DualText en="Safety" hi="सुरक्षा" size="heading" className="mb-2" />
            <DualText
                en="Your safety is our highest priority"
                hi="आपकी सुरक्षा हमारी सर्वोच्च प्राथमिकता है"
                size="small"
                className="mb-6"
            />

            <div className="space-y-4">
                {/* Check status */}
                <CareCard>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <DualText en="Check Status" hi="स्थिति जांचें" />
                            <p className="text-sm text-txtSecondary mt-1">
                                View your current care session status
                            </p>
                            <p className="text-xs text-txtSecondary font-hindi">
                                अपने वर्तमान देखभाल सत्र की स्थिति देखें
                            </p>
                        </div>
                    </div>
                    <PrimaryButton
                        en="Check Now"
                        hi="अभी जांचें"
                        variant="secondary"
                        onClick={() => alert('All systems are healthy. Your caregiver is verified and active.')}
                        className="mt-4"
                    />
                </CareCard>

                {/* Contact guardian */}
                <CareCard>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-alert/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-alert" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <DualText en="Contact Guardian" hi="अभिभावक से संपर्क करें" />
                            <p className="text-sm text-txtSecondary mt-1">
                                Reach your emergency contact immediately
                            </p>
                            <p className="text-xs text-txtSecondary font-hindi">
                                तुरंत अपने आपातकालीन संपर्क से जुड़ें
                            </p>
                        </div>
                    </div>
                    <PrimaryButton
                        en="Call Guardian"
                        hi="अभिभावक को कॉल करें"
                        variant="secondary"
                        onClick={() => alert('Calling guardian...')}
                        className="mt-4"
                    />
                </CareCard>

                {/* Live safety session */}
                <CareCard>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-danger/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-danger" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <DualText en="Start Live Safety Session" hi="लाइव सुरक्षा सत्र शुरू करें" />
                            <p className="text-sm text-txtSecondary mt-1">
                                Begin a monitored live session for peace of mind
                            </p>
                            <p className="text-xs text-txtSecondary font-hindi">
                                मन की शांति के लिए निगरानी सत्र शुरू करें
                            </p>
                        </div>
                    </div>
                    <PrimaryButton
                        en="Start Session"
                        hi="सत्र शुरू करें"
                        onClick={() => alert('Live safety session started. Your guardian has been notified.')}
                        className="mt-4"
                    />
                </CareCard>
            </div>
        </ScreenContainer>
    );
}
