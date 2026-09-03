import React, { useState } from 'react';
import { COUNTY_STATUSES, OFFICE_ROLES, blankOfficeStatuses } from '../county-schema';
import CountyPublicProfile from './CountyPublicProfile';
import { resizeImageFile } from '../image-tools';
import '../styles/county-details.css';

function CountyDetailsPanel({ preview, county, fips, countyData, districts, baseColor, onClose, onSave }) {
  const [draft, setDraft] = useState({
    clickable: countyData.clickable !== false, status: countyData.status || 'unassigned',
    color: countyData.color || '', customName: countyData.customName || '',
    population: countyData.population || '', established: countyData.established || '',
    countySeat: countyData.countySeat || '', redeemed: countyData.redeemed || '',
    settled: countyData.settled || '', reInhabited: countyData.reInhabited || '',
    description: countyData.description || '', linkedPage: countyData.linkedPage || '',
    linkLabel: countyData.linkLabel || 'Learn more', districtId: countyData.districtId || '',
    offices: { ...blankOfficeStatuses(), ...(countyData.offices || {}) }, notes: countyData.notes || '',
    sealImage: countyData.sealImage || ''
  });
  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const updateOffice = (key, patch) => setDraft((current) => ({ ...current, offices: { ...current.offices, [key]: { ...current.offices[key], ...patch } } }));

  if (preview) return <CountyPublicProfile county={county} countyData={countyData} onClose={onClose} />;

  return (
    <form className="county-details-panel" onSubmit={(event) => {
      event.preventDefault();
      onSave({ ...draft, customName: draft.customName.trim(), description: draft.description.trim(), linkedPage: draft.linkedPage.trim(), linkLabel: draft.linkLabel.trim(), notes: draft.notes.trim(), lastUpdated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) });
    }}>
      <div className="panel-header"><div><p className="panel-kicker">County Back Office · FIPS {fips}</p><h2>{county} County</h2></div><button type="button" onClick={onClose} className="close-btn" aria-label="Close county editor">×</button></div>
      <div className="panel-content">
        <section className="detail-section visibility-setting"><label className="clickable-toggle"><input type="checkbox" checked={draft.clickable} onChange={(event) => update('clickable', event.target.checked)} /><span><strong>County is clickable</strong><small>Visitors can open its information page.</small></span></label></section>
        <section className="detail-section">
          <h3>Map status and district</h3>
          <div className="field-stack"><label htmlFor="countyStatus">Public status</label><select id="countyStatus" value={draft.status} onChange={(event) => update('status', event.target.value)}>{COUNTY_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></div>
          <div className="field-stack"><label htmlFor="countyDistrict">District outline</label><select id="countyDistrict" value={draft.districtId} onChange={(event) => update('districtId', event.target.value)}><option value="">No district</option>{Object.values(districts).map((district) => <option key={district.id} value={district.id}>{district.name}</option>)}</select></div>
          <div className="field-row"><label htmlFor="countyColor">Custom fill override</label><input id="countyColor" type="color" value={draft.color || baseColor} onChange={(event) => update('color', event.target.value)} className="color-picker" /></div>
          {draft.color && <button type="button" className="text-action" onClick={() => update('color', '')}>Use the status color</button>}
        </section>
        <section className="detail-section"><h3>County facts</h3><div className="field-stack"><label htmlFor="customName">Display title</label><input id="customName" value={draft.customName} onChange={(event) => update('customName', event.target.value)} placeholder={`${county} County`} maxLength={100} /></div><div className="facts-edit-grid">{[['population','Population'],['established','Established'],['countySeat','County Seat'],['redeemed','Redeemed'],['settled','Settled'],['reInhabited','Re-Inhabited']].map(([key,label]) => <div className="field-stack" key={key}><label htmlFor={key}>{label}</label><input id={key} value={draft[key]} onChange={(event) => update(key, event.target.value)} maxLength={80} /></div>)}</div></section>
        <section className="detail-section"><h3>County seal</h3><p className="field-help">Upload a JPG, PNG, or other image. It will be resized and stored with this county.</p>{draft.sealImage && <img className="seal-preview" src={draft.sealImage} alt={`${county} County seal preview`} />}<input type="file" accept="image/*" aria-label="Upload county seal" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; try { update('sealImage', await resizeImageFile(file)); } catch (error) { window.alert(error.message); } event.target.value = ''; }} />{draft.sealImage && <button type="button" className="text-action" onClick={() => update('sealImage', '')}>Remove seal</button>}</section>
        <section className="detail-section"><h3>County offices</h3><p className="field-help">Choose the status and optionally enter the person’s name.</p><div className="office-editor">{OFFICE_ROLES.map(([key, label]) => <div className="office-edit-row" key={key}><label>{label}</label><select value={draft.offices[key]?.status || 'not-filled'} onChange={(event) => updateOffice(key, { status: event.target.value })}>{COUNTY_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select><input value={draft.offices[key]?.holder || ''} onChange={(event) => updateOffice(key, { holder: event.target.value })} placeholder="Name (optional)" maxLength={100} /></div>)}</div></section>
        <section className="detail-section"><h3>Additional public information</h3><div className="field-stack"><label htmlFor="description">Short description</label><textarea id="description" value={draft.description} onChange={(event) => update('description', event.target.value)} rows={4} maxLength={1000} /></div><div className="field-stack"><label htmlFor="linkedPage">Optional outside webpage</label><input id="linkedPage" type="url" value={draft.linkedPage} onChange={(event) => update('linkedPage', event.target.value)} placeholder="https://example.com/county-page" /></div><div className="field-stack"><label htmlFor="linkLabel">Button text</label><input id="linkLabel" value={draft.linkLabel} onChange={(event) => update('linkLabel', event.target.value)} maxLength={40} /></div></section>
        <section className="detail-section"><h3>Internal notes</h3><div className="field-stack"><label htmlFor="notes">Private working notes</label><textarea id="notes" value={draft.notes} onChange={(event) => update('notes', event.target.value)} rows={3} /></div></section>
        <button type="submit" className="btn btn-primary btn-block save-county">Save county page</button>
      </div>
    </form>
  );
}

export default CountyDetailsPanel;
