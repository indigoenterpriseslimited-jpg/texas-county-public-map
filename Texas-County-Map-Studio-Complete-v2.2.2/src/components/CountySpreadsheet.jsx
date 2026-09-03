import React, { useMemo, useState } from 'react';
import { COUNTY_STATUSES, statusDefinition } from '../county-schema';
import '../styles/county-spreadsheet.css';

function CountySpreadsheet({ countyNames, counties, districts, statusColors, onUpdate, onOpen, onStateOpen }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const rows = useMemo(() => countyNames.filter((name) => {
    const data = counties[name] || {};
    const matchesName = name.toLowerCase().includes(query.trim().toLowerCase());
    const matchesStatus = statusFilter === 'all' || (data.status || 'unassigned') === statusFilter;
    return matchesName && matchesStatus;
  }), [counties, countyNames, query, statusFilter]);

  return (
    <section className="county-sheet" aria-label="County status spreadsheet">
      <div className="sheet-heading">
        <div>
          <p className="section-kicker">Back office spreadsheet</p>
          <h2>All 254 counties</h2>
          <p>Change the public status here, then use Edit page for the county facts and offices.</p>
        </div>
        <div className="sheet-filters">
          <button type="button" className="btn btn-primary" onClick={onStateOpen}>Edit State Page</button>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a county" aria-label="Find a county" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
            <option value="all">All statuses</option>
            {COUNTY_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
          </select>
        </div>
      </div>
      <div className="sheet-table-wrap">
        <table>
          <thead><tr><th>County</th><th>Public status</th><th>District outline</th><th>Clickable</th><th>County page</th></tr></thead>
          <tbody>
            {rows.map((name) => {
              const data = counties[name] || {};
              const status = statusDefinition(data.status);
              return (
                <tr key={name}>
                  <th scope="row"><span className="status-swatch" style={{ background: statusColors?.[status.value] || status.color }} />{name}</th>
                  <td>
                    <select value={data.status || 'unassigned'} onChange={(event) => onUpdate(name, { status: event.target.value })}>
                      {COUNTY_STATUSES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </td>
                  <td>
                    <select value={data.districtId || ''} onChange={(event) => onUpdate(name, { districtId: event.target.value || null })}>
                      <option value="">No district</option>
                      {Object.values(districts).map((district) => <option key={district.id} value={district.id}>{district.name}</option>)}
                    </select>
                  </td>
                  <td><input type="checkbox" checked={data.clickable !== false} onChange={(event) => onUpdate(name, { clickable: event.target.checked })} aria-label={`${name} County is clickable`} /></td>
                  <td><button type="button" className="btn btn-secondary sheet-edit" onClick={() => onOpen(name)}>Edit page</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="sheet-count">Showing {rows.length} of 254 counties</p>
    </section>
  );
}

export default CountySpreadsheet;
