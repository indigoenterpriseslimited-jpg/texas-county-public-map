import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import MapEditor from './components/MapEditor';
import ControlPanel from './components/ControlPanel';
import CountyDetailsPanel from './components/CountyDetailsPanel';
import CountySpreadsheet from './components/CountySpreadsheet';
import CountyPublicProfile from './components/CountyPublicProfile';
import StatePublicProfile from './components/StatePublicProfile';
import StateDetailsPanel from './components/StateDetailsPanel';
import TexasFlag from './components/TexasFlag';
import texasCounties from './data/texas-counties.json';
import countyReference from './data/county-reference.json';
import { exportCountyCsv, exportPublishedHtml } from './publish-tools';
import { REFERENCE_DISTRICTS, buildReferenceCountyAssignments } from './reference-districts';
import { DEFAULT_STATUS_COLORS, createDefaultStatePage } from './county-schema';
import './styles/app.css';

const STORAGE_KEY = 'texas-county-map-studio-workspace-v3';
const LEGACY_STORAGE_KEY = 'texas-county-map-studio-project-v2';
const ALL_COUNTY_NAMES = texasCounties.features.map((feature) => feature.properties.name);
const buildReferenceCounties = () => {
  const districts = buildReferenceCountyAssignments(ALL_COUNTY_NAMES);
  return Object.fromEntries(ALL_COUNTY_NAMES.map((name) => [name, {
    ...districts[name],
    ...(countyReference[name] || {})
  }]));
};

const createMode = (id, name = 'General map') => ({
  id,
  name,
  title: 'Texas state Republic',
  bannerTitle: 'We the People ARE the Republic',
  baseColor: '#d8c9a7',
  mapStyle: 'flat',
  statusColors: DEFAULT_STATUS_COLORS,
  counties: buildReferenceCounties(),
  districts: REFERENCE_DISTRICTS,
  activeDistrictId: '',
  statePage: createDefaultStatePage()
});

const createDefaultWorkspace = () => {
  const mode = createMode('mode-general', 'General map');
  return { version: 3, activeModeId: mode.id, modes: { [mode.id]: mode } };
};

const normalizeMode = (value, id) => {
  const fallback = createMode(id);
  if (!value || typeof value !== 'object') return fallback;
  const hasSavedDistricts = value.districts && typeof value.districts === 'object'
    && Object.keys(value.districts).length > 0;
  const savedCounties = value.counties && typeof value.counties === 'object' ? value.counties : {};
  const referenceOnly = Object.fromEntries(ALL_COUNTY_NAMES.map((name) => [name, countyReference[name] || {}]));
  const countyDefaults = hasSavedDistricts ? referenceOnly : fallback.counties;
  const counties = Object.fromEntries(ALL_COUNTY_NAMES.map((name) => [name, {
    ...(countyDefaults[name] || {}),
    ...(savedCounties[name] || {})
  }]));
  const defaultStatePage = createDefaultStatePage();
  return {
    ...fallback,
    id,
    name: typeof value.name === 'string' && value.name.trim()
      ? value.name.trim().slice(0, 60)
      : fallback.name,
    title: typeof value.title === 'string' && value.title.trim()
      ? (value.title === 'My Texas County Map' ? fallback.title : value.title.slice(0, 100))
      : fallback.title,
    bannerTitle: typeof value.bannerTitle === 'string' && value.bannerTitle.trim()
      ? value.bannerTitle.slice(0, 120)
      : fallback.bannerTitle,
    baseColor: /^#[0-9a-f]{6}$/i.test(value.baseColor || '')
      ? value.baseColor
      : fallback.baseColor,
    mapStyle: value.mapStyle === 'embossed' ? 'embossed' : 'flat',
    statusColors: { ...DEFAULT_STATUS_COLORS, ...(value.statusColors || {}) },
    counties,
    districts: hasSavedDistricts ? value.districts : fallback.districts,
    activeDistrictId: typeof value.activeDistrictId === 'string' ? value.activeDistrictId : '',
    statePage: value.statePage && typeof value.statePage === 'object'
      ? { ...defaultStatePage, ...value.statePage, offices: { ...defaultStatePage.offices, ...(value.statePage.offices || {}) } }
      : defaultStatePage
  };
};

const normalizeWorkspace = (value) => {
  if (value?.modes && typeof value.modes === 'object' && Object.keys(value.modes).length) {
    const modes = Object.fromEntries(
      Object.entries(value.modes).map(([id, mode]) => [id, normalizeMode(mode, id)])
    );
    const activeModeId = modes[value.activeModeId] ? value.activeModeId : Object.keys(modes)[0];
    return { version: 3, activeModeId, modes };
  }

  if (value && typeof value === 'object') {
    const id = 'mode-imported';
    return { version: 3, activeModeId: id, modes: { [id]: normalizeMode(value, id) } };
  }

  return createDefaultWorkspace();
};

const loadSavedWorkspace = () => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) return normalizeWorkspace(JSON.parse(saved));
    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    return legacy ? normalizeWorkspace(JSON.parse(legacy)) : createDefaultWorkspace();
  } catch {
    return createDefaultWorkspace();
  }
};

const historyReducer = (state, action) => {
  switch (action.type) {
    case 'EDIT':
      if (JSON.stringify(action.next) === JSON.stringify(state.present)) return state;
      return {
        past: [...state.past.slice(-49), state.present],
        present: action.next,
        future: []
      };
    case 'UNDO':
      if (!state.past.length) return state;
      return {
        past: state.past.slice(0, -1),
        present: state.past[state.past.length - 1],
        future: [state.present, ...state.future]
      };
    case 'REDO':
      if (!state.future.length) return state;
      return {
        past: [...state.past, state.present],
        present: state.future[0],
        future: state.future.slice(1)
      };
    case 'LOAD':
      return { past: [], present: normalizeWorkspace(action.workspace), future: [] };
    default:
      return state;
  }
};

function App() {
  const mapRef = useRef(null);
  const [history, dispatch] = useReducer(historyReducer, null, () => ({
    past: [],
    present: loadSavedWorkspace(),
    future: []
  }));
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [stateOpen, setStateOpen] = useState(false);
  const [districtMode, setDistrictMode] = useState(false);
  const [viewMode, setViewMode] = useState('edit');
  const [notice, setNotice] = useState('Ready');

  const workspace = history.present;
  const project = workspace.modes[workspace.activeModeId];
  const countyNames = useMemo(
    () => texasCounties.features.map((feature) => feature.properties.name).sort(),
    []
  );
  const countyByName = useMemo(
    () => Object.fromEntries(texasCounties.features.map((feature) => [
      feature.properties.name,
      feature.properties
    ])),
    []
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
        setNotice(`Saved locally at ${new Date().toLocaleTimeString([], {
          hour: 'numeric', minute: '2-digit'
        })}`);
      } catch {
        setNotice('Local picture storage is full — export the workspace before closing');
      }
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [workspace]);

  const editWorkspace = (updater) => {
    const next = typeof updater === 'function' ? updater(workspace) : updater;
    dispatch({ type: 'EDIT', next: normalizeWorkspace(next) });
  };

  const editProject = (updater) => {
    editWorkspace((currentWorkspace) => {
      const current = currentWorkspace.modes[currentWorkspace.activeModeId];
      const nextMode = typeof updater === 'function' ? updater(current) : updater;
      return {
        ...currentWorkspace,
        modes: {
          ...currentWorkspace.modes,
          [currentWorkspace.activeModeId]: normalizeMode(nextMode, currentWorkspace.activeModeId)
        }
      };
    });
  };

  const updateCounty = (countyName, patch) => {
    editProject((current) => {
      const nextCounty = { ...(current.counties[countyName] || {}), ...patch };
      Object.keys(nextCounty).forEach((key) => {
        if (nextCounty[key] === '' || nextCounty[key] === null || nextCounty[key] === undefined) {
          delete nextCounty[key];
        }
      });
      const counties = { ...current.counties };
      if (Object.keys(nextCounty).length) counties[countyName] = nextCounty;
      else delete counties[countyName];
      return { ...current, counties };
    });
  };

  const handleCountyActivate = useCallback((countyName) => {
    const countyData = project.counties[countyName] || {};
    if (viewMode === 'preview') {
      if (countyData.clickable === false) return;
      setSelectedCounty(countyName);
      setStateOpen(false);
      return;
    }

    if (districtMode && project.activeDistrictId) {
      updateCounty(countyName, {
        districtId: countyData.districtId === project.activeDistrictId
          ? null
          : project.activeDistrictId
      });
    }
    setSelectedCounty(countyName);
    setStateOpen(false);
  }, [districtMode, project, viewMode]);

  const addMode = (name, duplicateCurrent = false) => {
    const id = `mode-${Date.now()}`;
    const source = duplicateCurrent
      ? { ...project, name: name || `${project.name} copy` }
      : createMode(id, name || 'New map');
    const mode = normalizeMode(source, id);
    editWorkspace((current) => ({
      ...current,
      activeModeId: id,
      modes: { ...current.modes, [id]: mode }
    }));
    setSelectedCounty(null);
    setDistrictMode(false);
    setViewMode('edit');
  };

  const removeMode = (modeId) => {
    if (Object.keys(workspace.modes).length === 1) return;
    editWorkspace((current) => {
      const modes = { ...current.modes };
      delete modes[modeId];
      return { ...current, modes, activeModeId: Object.keys(modes)[0] };
    });
    setSelectedCounty(null);
  };

  const addDistrict = ({ name, color }) => {
    const id = `district-${Date.now()}`;
    editProject((current) => ({
      ...current,
      districts: { ...current.districts, [id]: { id, name, color } },
      activeDistrictId: id
    }));
    setDistrictMode(true);
  };

  const removeDistrict = (districtId) => {
    editProject((current) => {
      const districts = { ...current.districts };
      delete districts[districtId];
      const counties = Object.fromEntries(
        Object.entries(current.counties).map(([name, data]) => [
          name,
          data.districtId === districtId ? { ...data, districtId: undefined } : data
        ])
      );
      return {
        ...current,
        districts,
        counties,
        activeDistrictId: current.activeDistrictId === districtId ? '' : current.activeDistrictId
      };
    });
  };

  const exportWorkspace = () => {
    const payload = {
      kind: 'texas-county-map-studio-workspace',
      exportedAt: new Date().toISOString(),
      countyDataset: texasCounties.source,
      workspace
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'texas-county-map-studio-workspace.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice('Workspace exported');
  };

  const importWorkspace = async (file) => {
    try {
      const parsed = JSON.parse(await file.text());
      dispatch({ type: 'LOAD', workspace: parsed.workspace || parsed });
      setSelectedCounty(null);
      setNotice(`Imported ${file.name}`);
    } catch {
      setNotice('That file is not a valid Map Studio workspace');
    }
  };

  const clearMode = () => {
    editProject(createMode(project.id, project.name));
    setSelectedCounty(null);
    setDistrictMode(false);
    setNotice('Current map cleared');
  };

  const exportMapImage = async (format) => {
    try {
      await mapRef.current?.downloadImage(format);
      setNotice(`${format.toUpperCase()} map downloaded`);
    } catch { setNotice('The map image could not be created'); }
  };

  const exportPublicPage = async () => {
    const svgMarkup = mapRef.current?.getSvgMarkup();
    if (!svgMarkup) { setNotice('Open the map editor or visitor preview before publishing'); return; }
    try {
      await exportPublishedHtml({ project, countyNames, svgMarkup });
      setNotice('Interactive public webpage downloaded');
    } catch { setNotice('The interactive webpage could not be created'); }
  };

  return (
    <div className={`app-shell view-${viewMode} ${(selectedCounty || stateOpen) && viewMode !== 'preview' ? 'editor-open' : ''}`}>
      <header className="app-header">
        <div>
          <p className="eyebrow">{viewMode === 'preview' ? 'Visitor preview' : 'Map back office'}</p>
          <h1>Texas County Map Studio</h1>
        </div>
        <div className="save-status" role="status" aria-live="polite">
          <span className="status-dot" />
          {notice}
        </div>
      </header>

      <div className={`studio-grid ${selectedCounty || stateOpen ? 'has-details' : ''}`}>
        <aside className="control-panel-sidebar" aria-label="Map controls">
          <ControlPanel
            workspace={workspace}
            project={project}
            viewMode={viewMode}
            onViewModeChange={(mode) => {
              setViewMode(mode);
              setDistrictMode(false);
              setSelectedCounty(null);
              setStateOpen(false);
            }}
            onModeSwitch={(modeId) => {
              editWorkspace({ ...workspace, activeModeId: modeId });
              setSelectedCounty(null);
              setStateOpen(false);
              setDistrictMode(false);
            }}
            onModeCreate={(name) => addMode(name, false)}
            onModeDuplicate={(name) => addMode(name, true)}
            onModeRemove={removeMode}
            countyNames={countyNames}
            customizedCount={Object.keys(project.counties).length}
            districtMode={districtMode}
            onDistrictModeChange={setDistrictMode}
            onProjectChange={editProject}
            onCountySelect={(name) => { setStateOpen(false); setSelectedCounty(name); }}
            onStateEdit={() => { setStateOpen(true); setSelectedCounty(null); setViewMode('edit'); }}
            onAddDistrict={addDistrict}
            onRemoveDistrict={removeDistrict}
            onExport={exportWorkspace}
            onExportCsv={() => exportCountyCsv(countyNames, project.counties)}
            onExportImage={exportMapImage}
            onPublish={exportPublicPage}
            onImport={importWorkspace}
            onClear={clearMode}
            onUndo={() => dispatch({ type: 'UNDO' })}
            onRedo={() => dispatch({ type: 'REDO' })}
            canUndo={history.past.length > 0}
            canRedo={history.future.length > 0}
          />
        </aside>

        <main className="map-stage">
          {viewMode === 'sheet' ? (
            <CountySpreadsheet countyNames={countyNames} counties={project.counties} districts={project.districts} statusColors={project.statusColors} onUpdate={updateCounty} onOpen={(name) => { setViewMode('edit'); setStateOpen(false); setSelectedCounty(name); }} onStateOpen={() => { setViewMode('edit'); setStateOpen(true); setSelectedCounty(null); }} />
          ) : viewMode === 'preview' && stateOpen ? (
            <StatePublicProfile statePage={project.statePage} statusColors={project.statusColors} onClose={() => setStateOpen(false)} />
          ) : viewMode === 'preview' && selectedCounty ? (
            <CountyPublicProfile county={selectedCounty} countyData={project.counties[selectedCounty] || {}} statusColors={project.statusColors} onClose={() => setSelectedCounty(null)} />
          ) : (
          <>
          {viewMode === 'preview' && <div className="republic-banner"><TexasFlag /><h2>{project.bannerTitle}</h2></div>}
          <div className="map-toolbar">
            <div>
              <p className="map-title">{project.title}</p>
              <p className="map-subtitle">{project.name} · 254 official county boundaries</p>
            </div>
            {viewMode === 'edit' && districtMode && (
              <div className="mode-badge">
                District paint mode
                {project.activeDistrictId && project.districts[project.activeDistrictId]
                  ? `: ${project.districts[project.activeDistrictId].name}`
                  : ' — choose a district'}
              </div>
            )}
          </div>
          <MapEditor
            ref={mapRef}
            counties={project.counties}
            districts={project.districts}
            selectedCounty={selectedCounty}
            onCountyActivate={handleCountyActivate}
            baseColor={project.baseColor}
            mapStyle={project.mapStyle}
            statusColors={project.statusColors}
            preview={viewMode === 'preview'}
          />
          {viewMode === 'preview' && (
            <nav className="county-directory" aria-label="Choose a county">
              <button type="button" className="state-directory-button" onClick={() => { setStateOpen(true); setSelectedCounty(null); }}>State Offices</button>
              {countyNames.map((name) => <button type="button" key={name} disabled={project.counties[name]?.clickable === false} onClick={() => handleCountyActivate(name)}>{name}</button>)}
            </nav>
          )}
          <p className="source-note">Boundary source: U.S. Census Bureau TIGERweb, generalized 2025 county geography.</p>
          </>
          )}
        </main>

        {stateOpen && viewMode !== 'preview' && (
          <aside className="details-panel-sidebar" aria-label="State Back Office">
            <StateDetailsPanel key={`${workspace.activeModeId}-state`} statePage={project.statePage} onClose={() => setStateOpen(false)} onSave={(data) => { editProject((current) => ({ ...current, statePage: data })); setNotice('State page saved'); }} />
          </aside>
        )}

        {selectedCounty && !stateOpen && viewMode !== 'preview' && (
          <aside className="details-panel-sidebar" aria-label={`${selectedCounty} County details`}>
            <CountyDetailsPanel
              key={`${workspace.activeModeId}-${selectedCounty}-${viewMode}`}
              preview={viewMode === 'preview'}
              county={selectedCounty}
              fips={countyByName[selectedCounty]?.fips}
              countyData={project.counties[selectedCounty] || {}}
              districts={project.districts}
              baseColor={project.baseColor}
              onClose={() => setSelectedCounty(null)}
              onSave={(data) => {
                updateCounty(selectedCounty, data);
                setNotice(`${selectedCounty} County saved`);
              }}
            />
          </aside>
        )}
      </div>
    </div>
  );
}

export default App;
