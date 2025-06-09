import { useState } from 'react';

export default function ReportForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('open');
  const [priority, setPriority] = useState('medium');
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('https://notifiq-backend-production.up.railway.app/api/incidents/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
        status,
        priority
      }),
    });

    setFeedback(res.ok ? '✅ Incident submitted!' : '❌ Failed to submit');
    if (res.ok) {
      setTitle('');
      setDescription('');
      setStatus('open');
      setPriority('medium');
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

      <label>
        Status:<br />
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%' }}>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
        </select>
      </label>
      <br /><br />

      <label>
        Priority:<br />
        <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ width: '100%' }}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>
      <br /><br />

      <button type="submit">Submit</button>
      {feedback && <p>{feedback}</p>}
    </form>
  );
}
