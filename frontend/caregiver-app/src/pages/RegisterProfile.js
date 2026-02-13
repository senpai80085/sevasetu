import React, { useState, useEffect } from 'react';
import ScreenContainer from '../components/ScreenContainer';
import CareCard from '../components/CareCard';
import DualText from '../components/DualText';
import PrimaryButton from '../components/PrimaryButton';
import { getSession, getAuthHeaders, validateSession } from '../utils/auth';

const CAREGIVER_API = 'http://localhost:8001';

export default function RegisterProfile() {
    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        skills: '',
        experience: ''
    });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        if (!validateSession()) return;
        const session = getSession();
        try {
            const res = await fetch(`${CAREGIVER_API}/caregiver/me`, {
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    name: data.name || '',
                    gender: data.gender || '',
                    skills: data.skills ? data.skills.join(', ') : '',
                    experience: data.experience_years || '',
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateSession()) return;
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch(`${CAREGIVER_API}/caregiver/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({
                    name: formData.name,
                    gender: formData.gender,
                    skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
                    experience_years: parseInt(formData.experience) || 0
                })
            });

            if (!res.ok) throw new Error('Update failed');

            const data = await res.json();
            setMessage('Profile updated successfully!');
        } catch (error) {
            setMessage('Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <ScreenContainer><p className="p-4 text-center">Loading...</p></ScreenContainer>;

    return (
        <ScreenContainer>
            <DualText en="Edit Profile" hi="प्रोफ़ाइल संपादित करें" size="heading" className="mb-6" />

            <CareCard>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-txtPrimary mb-1">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-3 rounded-lg border border-divider"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-txtPrimary mb-1">Gender</label>
                        <select
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            className="w-full p-3 rounded-lg border border-divider bg-white"
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-txtPrimary mb-1">Skills (comma separated)</label>
                        <input
                            type="text"
                            value={formData.skills}
                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                            className="w-full p-3 rounded-lg border border-divider"
                            placeholder="Nursing, Cooking, etc."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-txtPrimary mb-1">Experience (Years)</label>
                        <input
                            type="number"
                            value={formData.experience}
                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                            className="w-full p-3 rounded-lg border border-divider"
                            min="0"
                        />
                    </div>

                    {message && <p className="text-primary text-sm font-medium">{message}</p>}

                    <PrimaryButton
                        en="Save Changes"
                        hi="परिवर्तन सहेजें"
                        type="submit"
                        disabled={loading}
                    />
                </form>
            </CareCard>
        </ScreenContainer>
    );
}
