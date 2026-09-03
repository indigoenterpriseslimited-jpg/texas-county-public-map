import React from 'react';
import { OFFICE_ROLES, countyDisplayName, statusDefinition } from '../county-schema';

function CountyPublicProfile({ county, countyData, statusColors, onClose }) {
  const offices = countyData.offices || {};
  const facts = [
    ['Population', countyData.population],
    ['Established', countyData.established],
    ['County Seat', countyData.countySeat],
    ['Redeemed', countyData.redeemed],
    ['Settled', countyData.settled],
    ['Re-Inhabited', countyData.reInhabited]
  ];

  return (
    <article className="county-public-profile">
      <div className="public-profile-heading">
        {countyData.sealImage && <img className="public-seal" src={countyData.sealImage} alt={`${countyDisplayName(county, countyData)} seal`} />}
        <h2>{countyDisplayName(county, countyData)}</h2>
        {onClose && (
          <button type="button" className="public-close" onClick={onClose} aria-label="Return to county map">×</button>
        )}
      </div>
      <dl className="county-facts">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt>{label}:</dt>
            <dd>{value || '—'}</dd>
          </div>
        ))}
      </dl>
      <h3>County Offices</h3>
      <div className="office-list">
        {OFFICE_ROLES.map(([key, label]) => {
          const office = offices[key] || { status: 'not-filled', holder: '' };
          const status = statusDefinition(office.status);
          return (
            <p key={key}>
              <span>{label}:</span>{' '}
              <strong style={{ color: statusColors?.[status.value] || status.color }}>{office.holder || status.label}</strong>
            </p>
          );
        })}
      </div>
      {countyData.description && <p className="county-public-description">{countyData.description}</p>}
      <p className="last-update"><em>Last Update:</em> <strong>{countyData.lastUpdated || 'Not yet updated'}</strong></p>
    </article>
  );
}

export default CountyPublicProfile;
