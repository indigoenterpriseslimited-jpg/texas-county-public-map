import React, { useState } from 'react';
import { COUNTY_STATUSES, STATE_OFFICE_ROLES, createDefaultStatePage } from '../county-schema';
import { resizeImageFile } from '../image-tools';
import '../styles/county-details.css';

function StateDetailsPanel({ statePage, onClose, onSave }) {
  const defaults = createDefaultStatePage();
  const [draft, setDraft] = useState({ ...defaults, ...statePage, offices: { ...defaults.offices, ...(statePage.offices || {}) } });
  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const updateOffice = (key, patch) => setDraft((current) => ({ ...current, offices: { ...current.offices, [key]: { ...current.offices[key], ...patch } } }));
  return (
    <form className="county-details-panel" onSubmit={(event) => { event.preventDefault(); onSave({ ...draft, lastUpdated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }); }}>
      <div className="panel-header"><div><p className="panel-kicker">State Back Office</p><h2>Texas State Page</h2></div><button type="button" onClick={onClose} className="close-btn" aria-label="Close state editor">×</button></div>
      <div className="panel-content">
        <section className="detail-section"><h3>State facts</h3>{[['title','Page title'],['population','Population'],['admitted','Admitted'],['settledOnLand','Settled on Land']].map(([key,label]) => <div className="field-stack" key={key}><label htmlFor={`state-${key}`}>{label}</label><input id={`state-${key}`} value={draft[key] || ''} onChange={(event) => update(key, event.target.value)} /></div>)}</section>
        <section className="detail-section"><h3>State seal</h3>{draft.sealImage && <img className="seal-preview" src={draft.sealImage} alt="State seal preview" />}<input type="file" accept="image/*" aria-label="Upload state seal" onChange={async (event) => { const file=event.target.files?.[0]; if(!file) return; try { update('sealImage', await resizeImageFile(file)); } catch(error) { window.alert(error.message); } event.target.value=''; }} />{draft.sealImage && <button type="button" className="text-action" onClick={() => update('sealImage','')}>Remove seal</button>}</section>
        <section className="detail-section"><h3>State Offices (interim)</h3><div className="office-editor">{STATE_OFFICE_ROLES.map(([key,label]) => <div className="office-edit-row" key={key}><label>{label}</label><select value={draft.offices[key]?.status || 'not-filled'} onChange={(event) => updateOffice(key,{status:event.target.value})}>{COUNTY_STATUSES.map((status)=><option key={status.value} value={status.value}>{status.label}</option>)}</select><input value={draft.offices[key]?.holder || ''} onChange={(event)=>updateOffice(key,{holder:event.target.value})} placeholder="Name (optional)" /></div>)}</div></section>
        <button type="submit" className="btn btn-primary btn-block save-county">Save State page</button>
      </div>
    </form>
  );
}

export default StateDetailsPanel;
