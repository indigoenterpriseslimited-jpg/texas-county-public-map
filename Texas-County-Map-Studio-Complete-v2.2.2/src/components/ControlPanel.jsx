import React, { useRef, useState } from 'react';
import { COUNTY_STATUSES } from '../county-schema';
import '../styles/control-panel.css';

const DISTRICT_COLORS = ['#b8473e', '#2f6f68', '#ce8b2f', '#66538d', '#3d6d9b', '#8a5d3b'];

function ControlPanel({
  workspace,
  project,
  viewMode,
  onViewModeChange,
  onModeSwitch,
  onModeCreate,
  onModeDuplicate,
  onModeRemove,
  countyNames,
  customizedCount,
  districtMode,
  onDistrictModeChange,
  onProjectChange,
  onCountySelect,
  onStateEdit,
  onAddDistrict,
  onRemoveDistrict,
  onExport,
  onExportCsv,
  onExportImage,
  onPublish,
  onImport,
  onClear,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) {
  const [countyQuery, setCountyQuery] = useState('');
  const [newModeName, setNewModeName] = useState('');
  const [districtName, setDistrictName] = useState('');
  const [districtColor, setDistrictColor] = useState(DISTRICT_COLORS[0]);
  const fileInputRef = useRef(null);

  const findCounty = (event) => {
    event.preventDefault();
    const query = countyQuery.trim().toLowerCase();
    if (!query) return;
    const match = countyNames.find((name) => name.toLowerCase() === query)
      || countyNames.find((name) => name.toLowerCase().startsWith(query))
      || countyNames.find((name) => name.toLowerCase().includes(query));
    if (match) {
      setCountyQuery(match);
      onCountySelect(match);
    }
  };

  const createDistrict = (event) => {
    event.preventDefault();
    const name = districtName.trim();
    if (!name) return;
    onAddDistrict({ name: name.slice(0, 60), color: districtColor });
    setDistrictName('');
    setDistrictColor(DISTRICT_COLORS[(Object.keys(project.districts).length + 1) % DISTRICT_COLORS.length]);
  };

  return (
    <div className="control-panel">
      <section className="control-section mode-library">
        <p className="section-kicker">Back office</p>
        <h2>Map modes</h2>
        <div className="view-toggle three-way" role="group" aria-label="Workspace view">
          <button
            type="button"
            className={viewMode === 'edit' ? 'is-active' : ''}
            onClick={() => onViewModeChange('edit')}
            aria-pressed={viewMode === 'edit'}
          >
            Map editor
          </button>
          <button type="button" className={viewMode === 'sheet' ? 'is-active' : ''} onClick={() => onViewModeChange('sheet')} aria-pressed={viewMode === 'sheet'}>Spreadsheet</button>
          <button
            type="button"
            className={viewMode === 'preview' ? 'is-active' : ''}
            onClick={() => onViewModeChange('preview')}
            aria-pressed={viewMode === 'preview'}
          >
            Visitor preview
          </button>
        </div>

        <label htmlFor="activeMode">Current mode</label>
        <select
          id="activeMode"
          value={workspace.activeModeId}
          onChange={(event) => onModeSwitch(event.target.value)}
        >
          {Object.values(workspace.modes).map((mode) => (
            <option key={mode.id} value={mode.id}>{mode.name}</option>
          ))}
        </select>

        {viewMode === 'edit' && (
          <>
            <form
              className="mode-create-row"
              onSubmit={(event) => {
                event.preventDefault();
                const name = newModeName.trim();
                if (!name) return;
                onModeCreate(name);
                setNewModeName('');
              }}
            >
              <input
                value={newModeName}
                onChange={(event) => setNewModeName(event.target.value)}
                placeholder="New mode name"
                aria-label="New map mode name"
                maxLength={60}
              />
              <button type="submit" className="btn btn-secondary">New</button>
            </form>
            <div className="mode-actions">
              <button
                type="button"
                className="btn btn-quiet"
                onClick={() => onModeDuplicate(`${project.name} copy`)}
              >
                Duplicate
              </button>
              <button
                type="button"
                className="btn btn-danger-text"
                disabled={Object.keys(workspace.modes).length === 1}
                onClick={() => {
                  if (window.confirm(`Delete the “${project.name}” mode?`)) {
                    onModeRemove(workspace.activeModeId);
                  }
                }}
              >
                Delete mode
              </button>
            </div>
          </>
        )}
      </section>

      {viewMode === 'preview' ? (
        <section className="control-section preview-guide">
          <h2>Visitor preview</h2>
          <p>Click counties to see exactly what visitors will see. Counties disabled in the back office will not open.</p>
        </section>
      ) : (
        <>
      <section className="control-section project-section">
        <label htmlFor="modeName" className="section-kicker">Mode settings</label>
        <div className="field-stack compact-field">
          <label htmlFor="bannerTitle">Public banner</label>
          <input id="bannerTitle" value={project.bannerTitle} onChange={(event) => onProjectChange({ ...project, bannerTitle: event.target.value })} maxLength={120} />
        </div>
        <div className="field-stack compact-field">
          <label htmlFor="modeName">Back-office mode name</label>
          <input
            id="modeName"
            value={project.name}
            onChange={(event) => onProjectChange({ ...project, name: event.target.value })}
            maxLength={60}
          />
        </div>
        <div className="field-stack compact-field">
          <label htmlFor="projectTitle">Public map title</label>
        <input
          id="projectTitle"
          className="project-title-input"
          value={project.title}
          onChange={(event) => onProjectChange({ ...project, title: event.target.value })}
          maxLength={100}
        />
        </div>
        <div className="history-actions" aria-label="Edit history">
          <button type="button" className="btn btn-quiet" onClick={onUndo} disabled={!canUndo}>Undo</button>
          <button type="button" className="btn btn-quiet" onClick={onRedo} disabled={!canRedo}>Redo</button>
        </div>
      </section>

      <section className="control-section">
        <h2>Find a county</h2>
        <form className="search-row" onSubmit={findCounty}>
          <input
            type="search"
            list="countyNames"
            value={countyQuery}
            onChange={(event) => setCountyQuery(event.target.value)}
            placeholder="Example: Travis"
            aria-label="County name"
          />
          <datalist id="countyNames">
            {countyNames.map((name) => <option key={name} value={name} />)}
          </datalist>
          <button type="submit" className="btn btn-primary">Open</button>
        </form>
        <button type="button" className="btn btn-primary btn-block" onClick={onStateEdit}>Edit State page</button>
      </section>

      <section className="control-section">
        <h2>Map appearance</h2>
        <div className="field-row">
          <label htmlFor="baseColor">Unassigned counties</label>
          <input
            id="baseColor"
            type="color"
            value={project.baseColor}
            onChange={(event) => onProjectChange({ ...project, baseColor: event.target.value })}
            className="color-picker"
          />
        </div>
        <div className="field-stack">
          <label htmlFor="mapStyle">Map treatment</label>
          <select
            id="mapStyle"
            value={project.mapStyle}
            onChange={(event) => onProjectChange({ ...project, mapStyle: event.target.value })}
          >
            <option value="flat">Crisp and flat</option>
            <option value="embossed">Raised with shadow</option>
          </select>
        </div>
      </section>

      <section className="control-section">
        <h2>Public status color scale</h2>
        <p>Choose the map and office-text color for each status.</p>
        <div className="status-color-list">
          {COUNTY_STATUSES.map((status) => (
            <div className="field-row" key={status.value}>
              <label htmlFor={`status-color-${status.value}`}>{status.label}</label>
              <input id={`status-color-${status.value}`} type="color" className="color-picker" value={project.statusColors?.[status.value] || status.color} onChange={(event) => onProjectChange({ ...project, statusColors: { ...project.statusColors, [status.value]: event.target.value } })} />
            </div>
          ))}
        </div>
      </section>

      <section className="control-section">
        <div className="section-heading-row">
          <div>
            <h2>Districts</h2>
            <p>Show the three reference district outlines.</p>
          </div>
          <label className="switch-label">
            <input
              type="checkbox"
              checked={districtMode}
              onChange={(event) => onDistrictModeChange(event.target.checked)}
            />
            <span>Paint</span>
          </label>
        </div>

        <form className="district-form" onSubmit={createDistrict}>
          <input
            type="text"
            value={districtName}
            onChange={(event) => setDistrictName(event.target.value)}
            placeholder="New district name"
            aria-label="New district name"
            maxLength={60}
          />
          <input
            type="color"
            value={districtColor}
            onChange={(event) => setDistrictColor(event.target.value)}
            aria-label="New district color"
            className="color-picker"
          />
          <button type="submit" className="btn btn-secondary">Add</button>
        </form>

        {Object.keys(project.districts).length > 0 ? (
          <div className="district-list">
            {Object.values(project.districts).map((district) => (
              <div
                className={`district-item ${project.activeDistrictId === district.id ? 'is-active' : ''}`}
                key={district.id}
              >
                <button
                  type="button"
                  className="district-select"
                  onClick={() => onProjectChange({ ...project, activeDistrictId: district.id })}
                  aria-pressed={project.activeDistrictId === district.id}
                >
                  <span className="district-swatch" style={{ background: district.color }} />
                  <span>{district.name}</span>
                </button>
                <button
                  type="button"
                  className="district-remove"
                  onClick={() => onRemoveDistrict(district.id)}
                  aria-label={`Delete ${district.name}`}
                  title={`Delete ${district.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-note">Create a district, switch on Paint, then click counties.</p>
        )}
      </section>

      <section className="control-section">
        <h2>Download and publish</h2>
        <div className="stat-line">
          <span>County records</span>
          <strong>{customizedCount} / 254</strong>
        </div>
        <button type="button" onClick={onExport} className="btn btn-primary btn-block">Export workspace</button>
        <button type="button" onClick={onExportCsv} className="btn btn-secondary btn-block">Download county spreadsheet (CSV)</button>
        <div className="export-image-row"><button type="button" onClick={() => onExportImage('jpeg')} className="btn btn-secondary">Map JPEG</button><button type="button" onClick={() => onExportImage('png')} className="btn btn-secondary">Map PNG</button></div>
        <button type="button" onClick={onPublish} className="btn btn-primary btn-block">Publishable interactive webpage</button>
        <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-secondary btn-block">Import workspace</button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImport(file);
            event.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Clear all county, district, and styling changes?')) onClear();
          }}
          className="btn btn-danger-text btn-block"
        >
          Clear current map
        </button>
      </section>
        </>
      )}
    </div>
  );
}

export default ControlPanel;
