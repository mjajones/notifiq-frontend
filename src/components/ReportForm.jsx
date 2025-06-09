import { useState } from 'react';

export default function ReportForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('https://notifiq-backend-production.up.railway.app/api/incidents/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, description }),
    });

    setStatus(res.ok ? '✅ Incident submitted!' : '❌ Failed to submit');
    if (res.ok) {
      setTitle('');
      setDescription('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2>Submit a New Incident</h2>
      <label>
        Title:<br />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: '100%' }}
        />
      </label>
      <br /><br />
      <label>
        Description:<br />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={5}
          style={{ width: '100%' }}
        />
      </label>
      <br /><br />
      <button type="submit">Submit</button>
      {status && <p>{status}</p>}
    </form>
  );
}
