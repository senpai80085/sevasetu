import React, { useState } from 'react';

const API_BASE = 'http://localhost:8002';

function MatchedCaregivers() {
    const [formData, setFormData] = useState({ civilianId: '', skills: '', startTime: '', endTime: '' });
    const [caregivers, setCaregivers] = useState([]);

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE}/civilian/match-caregivers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    civilian_id: parseInt(formData.civilianId),
                    required_skills: formData.skills.split(',').map(s => s.trim()),
                    start_time: formData.startTime,
                    end_time: formData.endTime
                })
            });
            const data = await response.json();
            setCaregivers(data.caregivers || []);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Match Caregivers</h2>
            <form onSubmit={handleSearch} style={{ maxWidth: '400px', marginBottom: '20px' }}>
                <input type="number" placeholder="Civilian ID" value={formData.civilianId} onChange={(e) => setFormData({ ...formData, civilianId: e.target.value })} required style={{ margin: '5px 0', padding: '8px', width: '100%' }} />
                <input type="text" placeholder="Required Skills" value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} required style={{ margin: '5px 0', padding: '8px', width: '100%' }} />
                <input type="datetime-local" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} required style={{ margin: '5px 0', padding: '8px', width: '100%' }} />
                <input type="datetime-local" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} required style={{ margin: '5px 0', padding: '8px', width: '100%' }} />
                <button type="submit" style={{ margin: '10px 0', padding: '10px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>Find Caregivers</button>
            </form>

            <h3>Matched Caregivers:</h3>
            {caregivers.map((cg, idx) => (
                <div key={idx} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0' }}>
                    <p><strong>{cg.name}</strong></p>
                    <p>Skills: {cg.skills.join(', ')}</p>
                    <p>Experience: {cg.experience_years} years | Rating: {cg.rating_average.toFixed(1)} | Match Score: {cg.match_score.toFixed(2)}</p>
                </div>
            ))}
        </div>
    );
}

export default MatchedCaregivers;
