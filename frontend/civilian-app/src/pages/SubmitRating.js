import React, { useState } from 'react';

const API_BASE = 'http://localhost:8002';

function SubmitRating() {
    const [formData, setFormData] = useState({ caregiverId: '', rating: '', review: '' });
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE}/civilian/submit-rating`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caregiver_id: parseInt(formData.caregiverId),
                    rating: parseFloat(formData.rating),
                    review_text: formData.review || null
                })
            });
            const data = await response.json();
            setMessage(data.message);
        } catch (error) {
            setMessage('Error submitting rating');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Rate Caregiver</h2>
            <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
                <input type="number" placeholder="Caregiver ID" value={formData.caregiverId} onChange={(e) => setFormData({ ...formData, caregiverId: e.target.value })} required style={{ margin: '5px 0', padding: '8px', width: '100%' }} />
                <input type="number" step="0.1" min="1" max="5" placeholder="Rating (1-5)" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} required style={{ margin: '5px 0', padding: '8px', width: '100%' }} />
                <textarea placeholder="Review (optional)" value={formData.review} onChange={(e) => setFormData({ ...formData, review: e.target.value })} style={{ margin: '5px 0', padding: '8px', width: '100%', minHeight: '80px' }} />
                <button type="submit" style={{ margin: '10px 0', padding: '10px', background: '#ffc107', color: 'black', border: 'none', cursor: 'pointer' }}>Submit Rating</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

export default SubmitRating;
