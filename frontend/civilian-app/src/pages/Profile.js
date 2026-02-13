import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScreenContainer from '../components/ScreenContainer';
import CareCard from '../components/CareCard';
import DualText from '../components/DualText';
import PrimaryButton from '../components/PrimaryButton';
import { logout } from '../utils/auth';

export default function Profile() {
    const navigate = useNavigate();
    const userName = 'User'; // In real app, fetch from API or state
    const phone = localStorage.getItem('user_phone') || '+91 ****';
    const role = localStorage.getItem('user_role') || 'civilian';

    const handleLogout = () => {
        logout('civilian');
    };

    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({ name: userName, address: '' });

    const handleSave = async () => {
        try {
            await fetch('http://localhost:8002/civilian/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('civilian_session') ? `Bearer ${JSON.parse(localStorage.getItem('civilian_session')).access_token}` : ''
                },
                body: JSON.stringify(formData)
            });
            setEditing(false);
            // In real app, update context/state
            alert('Profile Updated!');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <ScreenContainer>
            <div className="flex justify-between items-center mb-6 px-4 pt-4">
                <DualText en="Profile" hi="प्रोफ़ाइल" size="heading" />
                <button
                    onClick={() => editing ? handleSave() : setEditing(true)}
                    className="text-primary font-bold text-sm"
                >
                    {editing ? 'Save' : 'Edit'}
                </button>
            </div>

            {/* User info card */}
            <CareCard className="mb-6 mx-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        {editing ? (
                            <div className="space-y-2">
                                <input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border-b border-divider bg-transparent focus:outline-none focus:border-primary font-semibold"
                                    placeholder="Name"
                                />
                                <input
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full border-b border-divider bg-transparent focus:outline-none focus:border-primary text-sm"
                                    placeholder="Address"
                                />
                            </div>
                        ) : (
                            <>
                                <h3 className="text-lg font-semibold text-txtPrimary">{formData.name}</h3>
                                <p className="text-sm text-txtSecondary">{phone}</p>
                            </>
                        )}
                        <span className="inline-block bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-lg mt-1">
                            {role}
                        </span>
                    </div>
                </div>
            </CareCard>

            {/* Menu items */}
            <div className="space-y-3 mb-6 px-4">
                <CareCard>
                    <div className="flex items-center justify-between">
                        <DualText en="Emergency Contacts" hi="आपातकालीन संपर्क" />
                        <svg className="w-5 h-5 text-txtSecondary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </CareCard>

                <CareCard>
                    <div className="flex items-center justify-between">
                        <DualText en="Help & Support" hi="सहायता एवं समर्थन" />
                        <svg className="w-5 h-5 text-txtSecondary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </CareCard>
            </div>

            <div className="px-4">
                <PrimaryButton en="Logout" hi="लॉग आउट" variant="danger" onClick={handleLogout} />
            </div>
        </ScreenContainer>
    );
}
