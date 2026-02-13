import React, { useState, useEffect } from 'react';
import ScreenContainer from '../components/ScreenContainer';
import CareCard from '../components/CareCard';
import DualText from '../components/DualText';
import PrimaryButton from '../components/PrimaryButton';
import { logout } from '../utils/auth';

export default function Profile() {
    const [info, setInfo] = useState({ name: '', skills: [], experience_years: 0 });
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    // Form State
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchInfo();
    }, []);

    const fetchInfo = async () => {
        try {
            const res = await fetch('http://localhost:8001/caregiver/me', {
                headers: {
                    'Authorization': localStorage.getItem('caregiver_session') ? `Bearer ${JSON.parse(localStorage.getItem('caregiver_session')).access_token}` : ''
                },
            });
            if (res.ok) {
                const data = await res.json();
                setInfo(data);
                setFormData(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await fetch('http://localhost:8001/caregiver/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('caregiver_session') ? `Bearer ${JSON.parse(localStorage.getItem('caregiver_session')).access_token}` : ''
                },
                body: JSON.stringify(formData)
            });
            setInfo(formData);
            setEditing(false);
            alert('Profile Updated!');
        } catch (err) {
            alert('Update Failed');
        }
    };

    return (
        <ScreenContainer>
            <div className="flex justify-between items-center mb-6 px-4 pt-4">
                <DualText en="My Profile" hi="मेरी प्रोफ़ाइल" size="heading" />
                <button
                    onClick={() => editing ? handleSave() : setEditing(true)}
                    className="text-primary font-bold text-sm"
                >
                    {editing ? 'Save' : 'Edit'}
                </button>
            </div>

            {loading ? <p className="text-center">Loading...</p> : (
                <div className="space-y-4 px-4">
                    <CareCard>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-txtSecondary font-medium">Full Name</label>
                                {editing ? (
                                    <input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full border-b border-divider py-1 focus:outline-none focus:border-primary font-medium"
                                    />
                                ) : (
                                    <p className="font-bold text-lg">{info.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm text-txtSecondary font-medium">Experience (Years)</label>
                                {editing ? (
                                    <input
                                        type="number"
                                        value={formData.experience_years}
                                        onChange={e => setFormData({ ...formData, experience_years: parseInt(e.target.value) })}
                                        className="w-full border-b border-divider py-1 focus:outline-none focus:border-primary font-medium"
                                    />
                                ) : (
                                    <p className="font-bold text-lg">{info.experience_years} Years</p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm text-txtSecondary font-medium">Skills (Comma separated)</label>
                                {editing ? (
                                    <input
                                        value={formData.skills?.join(', ')}
                                        onChange={e => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()) })}
                                        className="w-full border-b border-divider py-1 focus:outline-none focus:border-primary font-medium"
                                    />
                                ) : (
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {info.skills?.map(s => (
                                            <span key={s} className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CareCard>

                    <PrimaryButton en="Logout" hi="लॉग आउट" variant="danger" onClick={() => logout('caregiver')} />
                </div>
            )}
        </ScreenContainer>
    );
}
