import React, { useState, useEffect } from 'react';
import ScreenContainer from '../components/ScreenContainer';
import CareCard from '../components/CareCard';
import DualText from '../components/DualText';
import PrimaryButton from '../components/PrimaryButton';
import { getSession, getAuthHeaders, validateSession } from '../utils/auth';

const API_BASE = 'http://localhost:8006'; // auth-service for some things, but jobs are in caregiver-api (8001) ??
// Wait, the prompt said "caregiver-app API client: only call caregiver-api endpoints".
// caregiver-api runs on 8001.

const CAREGIVER_API = 'http://localhost:8001';

export default function AssignedJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        if (!validateSession()) return;
        setLoading(true);
        const session = getSession();

        try {
            // In a real app, we'd filter by status or get all
            // Use /jobs/me to get jobs for the logged-in caregiver (resolved from token)
            const res = await fetch(`${CAREGIVER_API}/caregiver/jobs/me`, {
                headers: getAuthHeaders(),
            });

            if (!res.ok) throw new Error('Failed to load jobs');
            const data = await res.json();
            setJobs(data);
        } catch (err) {
            console.error(err);
            setError('Could not load jobs');
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        pending: 'bg-alert/20 text-alert',
        matched: 'bg-secondary/20 text-primary',
        confirmed: 'bg-primary/10 text-primary',
        in_progress: 'bg-primary/20 text-primary',
        completed: 'bg-secondary/30 text-primary',
        cancelled: 'bg-danger/10 text-danger',
    };

    return (
        <ScreenContainer>
            <DualText en="My Jobs" hi="मेरी नौकरियां" size="heading" className="mb-6" />

            {loading && <p className="text-center text-txtSecondary">Loading...</p>}
            {error && <p className="text-center text-danger">{error}</p>}

            {!loading && jobs.length === 0 && (
                <CareCard className="text-center py-8">
                    <DualText en="No jobs assigned yet" hi="अभी तक कोई काम नहीं मिला" />
                </CareCard>
            )}

            <div className="space-y-4">
                {jobs.map((job) => (
                    <CareCard key={job.id}>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-semibold text-txtPrimary">{job.civilian_name || 'Civilian'}</h3>
                                <p className="text-sm text-txtSecondary">
                                    {new Date(job.start_time).toLocaleDateString()}
                                </p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[job.status] || 'bg-gray-100'}`}>
                                {job.status}
                            </span>
                        </div>
                        <p className="text-sm text-txtSecondary mb-3">
                            {new Date(job.start_time).toLocaleTimeString()} - {new Date(job.end_time).toLocaleTimeString()}
                        </p>

                        {/* Action buttons could go here based on status */}
                    </CareCard>
                ))}
            </div>
        </ScreenContainer>
    );
}
