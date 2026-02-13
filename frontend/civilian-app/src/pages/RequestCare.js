// Civilian App - Request Care Page
// This is a minimal functional component for requesting care services

import React, { useState } from 'react';

const API_BASE = 'http://localhost:8002';

function RequestCare() {
  const [formData, setFormData] = useState({
    civilianId: '',
    skills: '',
    startTime: '',
    endTime: ''
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const skillsArray = formData.skills.split(',').map(s => s.trim());
    
    try {
      const response = await fetch(`${API_BASE}/civilian/request-care`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          civilian_id: parseInt(formData.civilianId),
          required_skills: skillsArray,
          start_time: formData.startTime,
          end_time: formData.endTime
        })
      });
      
      const data = await response.json();
      setMessage('Care request submitted successfully!');
      console.log(data);
    } catch (error) {
      setMessage('Error submitting request');
      console.error(error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Request Care Service</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: '400px' }}>
        <input
          type="number"
          placeholder="Civilian ID"
          value={formData.civilianId}
          onChange={(e) => setFormData({ ...formData, civilianId: e.target.value })}
          required
          style={{ margin: '5px 0', padding: '8px' }}
        />
        <input
          type="text"
          placeholder="Required Skills (comma-separated)"
          value={formData.skills}
          onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
          required
          style={{ margin: '5px 0', padding: '8px' }}
        />
        <input
          type="datetime-local"
          value={formData.startTime}
          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          required
          style={{ margin: '5px 0', padding: '8px' }}
        />
        <input
          type="datetime-local"
          value={formData.endTime}
          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          required
          style={{ margin: '5px 0', padding: '8px' }}
        />
        <button type="submit" style={{ margin: '10px 0', padding: '10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          Submit Request
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default RequestCare;
