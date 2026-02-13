import React, { useState } from 'react';

const API_BASE = 'http://localhost:8002';

function ConfirmBooking() {
    const [formData, setFormData] = useState({ civilianId: '', caregiverId: '', startTime: '', endTime: '' });
    const [message, setMessage] = useState('');

    const handleConfirm = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE}/civilian/confirm-booking`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    civilian_id: parseInt(formData.civilianId),
                    caregiver_id: parseInt(formData.caregiverId),
                    start_time: formData.startTime,
                    end_time: formData.endTime
                })
            });
            const data = await response.json();
            setMessage(`Booking confirmed! Booking ID: ${data.booking_id}`);
        } catch (error) {
            setMessage('Error confirming booking');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Confirm Booking</h2>
            <form onSubmit={handleConfirm} style={{ maxWidth: '400px' }}>
                <input type="number" placeholder="Civilian ID" value={formData.civilianId} onChange={(e) => setFormData({ ...formData, civilianId: e.target.value })} required style={{ margin: '5px 0', padding: '8px', width: '100%' }} />
                <input type="number" placeholder="Caregiver ID" value={formData.caregiverId} onChange={(e) => setFormData({ ...formData, caregiverId: e.target.value })} required style={{ margin: '5px 0', padding: '8px', width: '100%' }} />
                <input type="datetime-local" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} required style={{ margin: '5px 0', padding: '8px', width: '100%' }} />
                <input type="datetime-local" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} required style={{ margin: '5px 0', padding: '8px', width: '100%' }} />
                <button type="submit" style={{ margin: '10px 0', padding: '10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>Confirm Booking</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

export default ConfirmBooking;
