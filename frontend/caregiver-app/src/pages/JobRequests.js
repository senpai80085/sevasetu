import React, { useState, useEffect } from 'react';
import ScreenContainer from '../components/ScreenContainer';
import DualText from '../components/DualText';
import CareCard from '../components/CareCard';

export default function JobRequests() {
    const [jobs, setJobs] = useState([]);

    // Polling logic
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await fetch('http://localhost:8001/caregiver/bookings/pending', {
                    headers: {
                        'Authorization': localStorage.getItem('caregiver_session') ? `Bearer ${JSON.parse(localStorage.getItem('caregiver_session')).access_token}` : ''
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setJobs(data);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchJobs(); // Initial call
        const interval = setInterval(fetchJobs, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const handleAction = async (id, status) => {
        try {
            await fetch(`http://localhost:8001/caregiver/bookings/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('caregiver_session') ? `Bearer ${JSON.parse(localStorage.getItem('caregiver_session')).access_token}` : ''
                },
                body: JSON.stringify({ status })
            });
            // Optimistic update
            setJobs(jobs.filter(j => j.id !== id));
            alert(`Booking ${status}!`);
        } catch (err) {
            alert('Action failed');
        }
    };

    return (
        <ScreenContainer>
            <div className="p-4">
                <DualText en="Job Requests" hi="नौकरी के अनुरोध" size="heading" className="mb-6" />

                {jobs.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-txtSecondary">No new requests...</p>
                        <p className="text-sm text-txtSecondary mt-2 animate-pulse">Scanning for nearby jobs...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {jobs.map(job => (
                            <CareCard key={job.id} className="border-l-4 border-primary">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{job.civilian_name}</h3>
                                        <p className="text-sm text-txtSecondary">Elderly Care • 4.2km away</p>
                                    </div>
                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold">
                                        NEW
                                    </span>
                                </div>

                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={() => handleAction(job.id, 'rejected')}
                                        className="flex-1 py-3 border border-divider rounded-xl font-medium text-txtSecondary"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction(job.id, 'accepted')}
                                        className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30"
                                    >
                                        Accept Job
                                    </button>
                                </div>
                            </CareCard>
                        ))}
                    </div>
                )}
            </div>
        </ScreenContainer>
    );
}
