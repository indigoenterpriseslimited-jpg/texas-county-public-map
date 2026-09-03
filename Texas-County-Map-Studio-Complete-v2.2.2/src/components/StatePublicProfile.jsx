import React from 'react';
import { STATE_OFFICE_ROLES, statusDefinition } from '../county-schema';

function StatePublicProfile({ statePage, statusColors, onClose }) {
  return (
    <article className="county-public-profile state-public-profile">
      <div className="public-profile-heading">
        {statePage.sealImage && <img className="public-seal" src={statePage.sealImage} alt="Texas state seal" />}
        <h2>{statePage.title || 'Texas state Republic'}</h2>
        {onClose && <button type="button" className="public-close" onClick={onClose} aria-label="Return to county map">×</button>}
      </div>
      <div className="state-facts">
        <p>Population: <strong>{statePage.population || '—'}</strong></p>
        <p>Admitted: <strong>{statePage.admitted || '—'}</strong></p>
        <p>Settled on Land: <strong>{statePage.settledOnLand || '—'}</strong></p>
      </div>
      <h3>State Offices (interim)</h3>
      <div className="office-list state-office-list">
        {STATE_OFFICE_ROLES.map(([key, label]) => {
          const office = statePage.offices?.[key] || { status: 'not-filled', holder: '' };
          const status = statusDefinition(office.status);
          const value = office.holder || (office.status === 'filled' ? 'Office Filled' : status.label);
          return <p key={key}><span>{label}:</span>{' '}<strong style={{ color: statusColors?.[status.value] || status.color }}>{value}</strong></p>;
        })}
      </div>
      <p className="last-update"><em>Last updated on</em> <strong>{statePage.lastUpdated || 'Not yet updated'}</strong></p>
    </article>
  );
}

export default StatePublicProfile;
