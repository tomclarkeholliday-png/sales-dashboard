import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const SUPABASE_URL = 'https://sojlmigvbtmmnadlmncc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iHF5MBS5CWgJc1ED8bSZug_ZZoFcrCK';
const userId = 'shared-dashboard';

export default function Dashboard() {
  const [opportunities, setOpportunities] = useState([]);
  const [visits, setVisits] = useState({});
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ accountName: '', opportunityName: '', value: '', stage: 'Discovery', product: '', notes: '' });
  const [visitForm, setVisitForm] = useState({ account: '' });

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Prefer': 'return=representation'
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/opportunities?user_id=eq.${userId}`, { headers });
      const data = await res.json();
      setOpportunities(data);
      setReady(true);
      setError(null);
    } catch (err) {
      console.error('Load error:', err);
      setError(err.message);
      setReady(true);
    }
  };

  const handleAddEdit = async () => {
    if (!formData.accountName || !formData.value || !formData.product) {
      alert('Required: Account, Value, Product');
      return;
    }

    try {
      if (editingId) {
        await fetch(`${SUPABASE_URL}/rest/v1/opportunities?id=eq.${editingId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            account_name: formData.accountName,
            opportunity_name: formData.opportunityName,
            value: parseInt(formData.value),
            stage: formData.stage,
            product: formData.product,
            notes: formData.notes
          })
        });
      } else {
        await fetch(`${SUPABASE_URL}/rest/v1/opportunities`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            user_id: userId,
            account_name: formData.accountName,
            opportunity_name: formData.opportunityName,
            value: parseInt(formData.value),
            stage: formData.stage,
            product: formData.product,
            notes: formData.notes
          })
        });
      }
      setLastSaved(new Date().toLocaleTimeString());
      setShowModal(false);
      setFormData({ accountName: '', opportunityName: '', value: '', stage: 'Discovery', product: '', notes: '' });
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message);
    }
  };

  const handleAddVisit = () => {
    if (!visitForm.account) {
      alert('Please select an account');
      return;
    }
    const dateStr = selectedDate.toISOString().split('T')[0];
    const existing = visits[dateStr] || [];
    setVisits({ ...visits, [dateStr]: [...existing, visitForm.account] });
    setVisitForm({ account: '' });
    setShowVisitModal(false);
  };

  const handleEdit = (opp) => {
    setFormData({ accountName: opp.account_name, opportunityName: opp.opportunity_name, value: opp.value, stage: opp.stage, product: opp.product, notes: opp.notes });
    setEditingId(opp.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/opportunities?id=eq.${id}`, { method: 'DELETE', headers });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteVisit = (date, account) => {
    const dateStr = date.toISOString().split('T')[0];
    const updated = visits[dateStr].filter(a => a !== account);
    if (updated.length === 0) {
      const newVisits = { ...visits };
      delete newVisits[dateStr];
      setVisits(newVisits);
    } else {
      setVisits({ ...visits, [dateStr]: updated });
    }
  };

  const getUniqueAccounts = () => [...new Set(opportunities.map(opp => opp.account_name))];

  return (
    <div className="dashboard">
      <div className="container">
        <div className="header">
          <h1>Sales Dashboard</h1>
          <p>Status: <span style={{ color: ready ? '#22c55e' : '#facc15' }}>{ready ? '✅ Connected' : '⏳ Loading...'}</span> | Opportunities: {opportunities.length}</p>
          {error && <p style={{ color: '#ef4444' }}>❌ {error}</p>}
          {lastSaved && <p style={{ color: '#22c55e' }}>✅ Saved: {lastSaved}</p>}
        </div>

        <div className="opportunities-card">
          <div className="card-header">
            <h2 style={{ color: '#ff0000' }}>All Opportunities</h2>
            <button onClick={() => { setFormData({ accountName: '', opportunityName: '', value: '', stage: 'Discovery', product: '', notes: '' }); setEditingId(null); setShowModal(true); }} className="btn-add">Add</button>
          </div>

          {opportunities.length === 0 ? (<p className="empty">No opportunities</p>) : (
            <div className="opp-list">
              {opportunities.map(opp => (
                <div key={opp.id} className="opp-item">
                  <div>
                    <p className="opp-name">{opp.account_name}</p>
                    <p className="opp-product">{opp.product}</p>
                  </div>
                  <div className="opp-actions">
                    <p className="opp-value">£{parseInt(opp.value).toLocaleString()}</p>
                    <button onClick={() => handleEdit(opp)} className="btn-edit">Edit</button>
                    <button onClick={() => handleDelete(opp.id)} className="btn-delete">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="opportunities-card" style={{ marginTop: '20px' }}>
          <h2>Calendar - Click Date to Add Visit</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginTop: '15px' }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
              <div key={day} style={{ textAlign: 'center', fontWeight: 'bold', color: '#999', fontSize: '12px', padding: '8px' }}>{day}</div>
            ))}
            {(() => {
              const year = new Date().getFullYear();
              const month = new Date().getMonth();
              const firstDay = new Date(year, month, 1).getDay();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const days = [];
              for (let i = 0; i < firstDay; i++) days.push(null);
              for (let day = 1; day <= daysInMonth; day++) days.push(day);
              return days.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} style={{ aspectRatio: '1' }}></div>;
                const dateStr = new Date(year, month, day).toISOString().split('T')[0];
                const hasVisit = visits[dateStr] && visits[dateStr].length > 0;
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                return (
                  <button key={day} type="button" onClick={() => { setSelectedDate(new Date(year, month, day)); setShowVisitModal(true); }} style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', backgroundColor: hasVisit ? '#06b6d4' : isToday ? '#242d47' : 'transparent', color: hasVisit ? '#1a1f3a' : isToday ? '#06b6d4' : '#ffffff', border: isToday ? '2px solid #06b6d4' : 'none', padding: 0, margin: 0, fontFamily: 'inherit' }}>
                    {day}
                  </button>
                );
              });
            })()}
          </div>
        </div>

        {Object.keys(visits).length > 0 && (
          <div className="opportunities-card" style={{ marginTop: '20px' }}>
            <h2>Scheduled Visits</h2>
            <div className="opp-list">
              {Object.entries(visits).sort().map(([date, accounts]) =>
                accounts.map((account, idx) => (
                  <div key={`${date}-${idx}`} className="opp-item">
                    <div>
                      <p className="opp-name">{account}</p>
                      <p className="opp-product">{new Date(date).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => handleDeleteVisit(new Date(date), account)} className="btn-delete">Remove</button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingId ? 'Edit' : 'Add'}</h2>
              <button onClick={() => setShowModal(false)} className="btn-close">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Account *</label><input type="text" value={formData.accountName} onChange={(e) => setFormData({...formData, accountName: e.target.value})} /></div>
              <div className="form-group"><label>Name</label><input type="text" value={formData.opportunityName} onChange={(e) => setFormData({...formData, opportunityName: e.target.value})} /></div>
              <div className="form-group"><label>Value (£) *</label><input type="number" value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})} /></div>
              <div className="form-group"><label>Stage</label><select value={formData.stage} onChange={(e) => setFormData({...formData, stage: e.target.value})}><option>Discovery</option><option>In Progress</option><option>Pre Demo</option><option>Demo</option><option>Trial</option><option>Stock Ordered</option></select></div>
              <div className="form-group"><label>Product *</label><input type="text" value={formData.product} onChange={(e) => setFormData({...formData, product: e.target.value})} /></div>
              <div className="form-group"><label>Notes</label><textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows="3" /></div>
            </div>
            <div className="modal-footer">
              <button onClick={handleAddEdit} className="btn-primary">{editingId ? 'Update' : 'Add'}</button>
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showVisitModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add Visit - {selectedDate?.toLocaleDateString()}</h2>
              <button onClick={() => setShowVisitModal(false)} className="btn-close">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select Account *</label>
                <select value={visitForm.account} onChange={(e) => setVisitForm({...visitForm, account: e.target.value})}>
                  <option value="">Choose an account...</option>
                  {getUniqueAccounts().map(account => (
                    <option key={account} value={account}>{account}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleAddVisit} className="btn-primary">Add Visit</button>
              <button onClick={() => setShowVisitModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
