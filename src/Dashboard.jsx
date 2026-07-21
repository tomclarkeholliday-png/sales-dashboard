import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const SHEET_ID = '17-nUalBcZOsLgLR2r3C6dt_LC1YMGRklQG2aYFYGJjs';

export default function Dashboard() {
  const [opportunities, setOpportunities] = useState([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    accountName: '', 
    opportunityName: '', 
    value: '', 
    stage: 'Discovery', 
    product: '', 
    notes: '' 
  });

  // Load data from Google Sheet
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/query?tqx=out:json`;
      const res = await fetch(url);
      const text = await res.text();
      const json = JSON.parse(text.substring(47).slice(0, -2));
      
      if (!json.table) {
        setOpportunities([]);
        setReady(true);
        return;
      }

      const rows = json.table.rows || [];
      const data = rows.map((row, idx) => ({
        id: idx,
        account_name: row.c[1]?.v || '',
        opportunity_name: row.c[2]?.v || '',
        value: parseInt(row.c[3]?.v || 0),
        stage: row.c[4]?.v || 'Discovery',
        product: row.c[5]?.v || '',
        notes: row.c[6]?.v || ''
      })).filter(opp => opp.account_name);

      setOpportunities(data);
      setReady(true);
      setError(null);
    } catch (err) {
      console.error('Load error:', err);
      setError('Failed to load data');
      setReady(true);
    }
  };

  const handleAddEdit = async () => {
    if (!formData.accountName || !formData.value || !formData.product) {
      alert('Required: Account Name, Value, Product');
      return;
    }

    try {
      const values = [
        ['', formData.accountName, formData.opportunityName, formData.value, formData.stage, formData.product, formData.notes]
      ];

      const body = {
        values: values
      };

      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A${opportunities.length + 2}:G${opportunities.length + 2}?key=AIzaSyAqwzKb8zJ3Q0z3Z8Z8Z8Z8Z8Z8Z8Z8Z8`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }
      ).catch(() => null);

      setLastSaved(new Date().toLocaleTimeString());
      setShowModal(false);
      setFormData({ accountName: '', opportunityName: '', value: '', stage: 'Discovery', product: '', notes: '' });
      setEditingId(null);
      
      setTimeout(() => loadData(), 1000);
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message);
    }
  };

  const handleEdit = (opp) => {
    setFormData({
      accountName: opp.account_name,
      opportunityName: opp.opportunity_name,
      value: opp.value,
      stage: opp.stage,
      product: opp.product,
      notes: opp.notes
    });
    setEditingId(opp.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this opportunity?')) return;
    try {
      alert('To delete, please remove the row manually from the Google Sheet');
    } catch (err) {
      setError(err.message);
    }
  };

  const getTotalValue = () => opportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);

  return (
    <div className="dashboard">
      <div className="container">
        <div className="header">
          <h1>Sales Dashboard</h1>
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginTop: '15px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Status</p>
              <p style={{ margin: '5px 0 0 0', color: ready ? '#22c55e' : '#facc15' }}>
                {ready ? '✅ Connected' : '⏳ Loading...'}
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Opportunities</p>
              <p style={{ margin: '5px 0 0 0', color: '#06b6d4' }}>{opportunities.length}</p>
            </div>
            {lastSaved && (
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Last Saved</p>
                <p style={{ margin: '5px 0 0 0', color: '#22c55e' }}>{lastSaved}</p>
              </div>
            )}
            {error && (
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#ef4444' }}>Error</p>
                <p style={{ margin: '5px 0 0 0', color: '#ef4444', fontSize: '12px' }}>{error}</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div style={{ backgroundColor: '#242d47', padding: '20px', borderRadius: '8px' }}>
            <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>TOTAL PIPELINE</p>
            <p style={{ fontSize: '28px', color: '#06b6d4', margin: '10px 0 0 0' }}>£{getTotalValue().toLocaleString()}</p>
          </div>
          <div style={{ backgroundColor: '#242d47', padding: '20px', borderRadius: '8px' }}>
            <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>OPPORTUNITIES</p>
            <p style={{ fontSize: '28px', color: '#22c55e', margin: '10px 0 0 0' }}>{opportunities.length}</p>
          </div>
        </div>

        <div style={{ backgroundColor: '#242d47', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ margin: 0, color: '#fff' }}>All Opportunities</h2>
            <button
              onClick={() => {
                setFormData({ accountName: '', opportunityName: '', value: '', stage: 'Discovery', product: '', notes: '' });
                setEditingId(null);
                setShowModal(true);
              }}
              style={{
                backgroundColor: '#06b6d4',
                color: '#1a1f3a',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              + Add
            </button>
          </div>

          {opportunities.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', padding: '40px 0' }}>No opportunities yet</p>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {opportunities.map(opp => (
                <div key={opp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1a1f3a', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #06b6d4' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#fff' }}>{opp.account_name}</p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>{opp.product}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ backgroundColor: '#242d47', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', color: '#06b6d4' }}>{opp.stage}</span>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#06b6d4' }}>£{opp.value.toLocaleString()}</p>
                    <button onClick={() => handleEdit(opp)} style={{ backgroundColor: 'transparent', border: 'none', color: '#999', cursor: 'pointer' }}>Edit</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p style={{ fontSize: '12px', color: '#666', marginTop: '15px' }}>📝 <a href="https://docs.google.com/spreadsheets/d/17-nUalBcZOsLgLR2r3C6dt_LC1YMGRklQG2aYFYGJjs" target="_blank" rel="noreferrer" style={{ color: '#06b6d4' }}>Edit data in Google Sheet</a></p>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#242d47', padding: '30px', borderRadius: '8px', maxWidth: '500px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#fff' }}>Add Opportunity</h2>
              <button onClick={() => setShowModal(false)} style={{ backgroundColor: 'transparent', border: 'none', color: '#999', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#999', marginBottom: '5px' }}>Account Name *</label>
                <input type="text" value={formData.accountName} onChange={(e) => setFormData({...formData, accountName: e.target.value})} style={{ width: '100%', padding: '8px', backgroundColor: '#1a1f3a', border: '1px solid #444', borderRadius: '4px', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#999', marginBottom: '5px' }}>Opportunity Name</label>
                <input type="text" value={formData.opportunityName} onChange={(e) => setFormData({...formData, opportunityName: e.target.value})} style={{ width: '100%', padding: '8px', backgroundColor: '#1a1f3a', border: '1px solid #444', borderRadius: '4px', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#999', marginBottom: '5px' }}>Value (£) *</label>
                <input type="number" value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})} style={{ width: '100%', padding: '8px', backgroundColor: '#1a1f3a', border: '1px solid #444', borderRadius: '4px', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#999', marginBottom: '5px' }}>Stage</label>
                <select value={formData.stage} onChange={(e) => setFormData({...formData, stage: e.target.value})} style={{ width: '100%', padding: '8px', backgroundColor: '#1a1f3a', border: '1px solid #444', borderRadius: '4px', color: '#fff' }}>
                  <option>Discovery</option>
                  <option>In Progress</option>
                  <option>Pre Demo</option>
                  <option>Demo</option>
                  <option>Trial</option>
                  <option>Stock Ordered</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#999', marginBottom: '5px' }}>Product *</label>
                <input type="text" value={formData.product} onChange={(e) => setFormData({...formData, product: e.target.value})} style={{ width: '100%', padding: '8px', backgroundColor: '#1a1f3a', border: '1px solid #444', borderRadius: '4px', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#999', marginBottom: '5px' }}>Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} style={{ width: '100%', padding: '8px', backgroundColor: '#1a1f3a', border: '1px solid #444', borderRadius: '4px', color: '#fff', minHeight: '80px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleAddEdit} style={{ flex: 1, backgroundColor: '#06b6d4', color: '#1a1f3a', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                Add
              </button>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, backgroundColor: '#444', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '15px', marginBottom: 0 }}>💡 Tip: You can also edit data directly in the Google Sheet</p>
          </div>
        </div>
      )}
    </div>
  );
}
