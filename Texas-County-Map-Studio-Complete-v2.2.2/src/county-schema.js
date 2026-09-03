export const COUNTY_STATUSES = [
  { value: 'unassigned', label: 'Not Set', color: '#d8c9a7' },
  { value: 'not-filled', label: 'Not Filled', color: '#c81919' },
  { value: 'filled', label: 'Filled', color: '#238443' },
  { value: 'in-progress', label: 'In Progress', color: '#e0a21a' },
  { value: 'not-applicable', label: 'Not Applicable', color: '#8b9397' }
];

export const DEFAULT_STATUS_COLORS = Object.fromEntries(
  COUNTY_STATUSES.map(({ value, color }) => [value, color])
);

export const OFFICE_ROLES = [
  ['assemblyChair', 'Assembly Chair/State Assembly Representative'],
  ['chiefJustice', 'County Chief Justice'],
  ['associateJustice1', 'County Associate Justice (Seat 1)'],
  ['associateJustice2', 'County Associate Justice (Seat 2)'],
  ['sheriff', 'County Sheriff (Bailiff)'],
  ['countyClerk', 'County Clerk (Scribe/Record Keeper)'],
  ['courtClerk', 'County Court Clerk']
];

export const STATE_OFFICE_ROLES = [
  ['governor', 'Governor'],
  ['lieutenantGovernor', 'Lieutenant Governor'],
  ['chaplin', 'Chaplin'],
  ['chiefJustice', 'Chief Justice (1/3)'],
  ['associateJustice2', 'Associate/District Justice (2/3)'],
  ['associateJustice3', 'Associate/District Justice (3/3)'],
  ['secretaryOfState', 'Secretary of State'],
  ['attorneyGeneral', 'Attorney General'],
  ['treasurer', 'Treasurer'],
  ['supremeCourtClerk', 'Clerk of the Supreme Court'],
  ['assemblyClerk', 'Clerk of the Texas Legislative Assembly'],
  ['senator1', 'Senator (1/2)'],
  ['senator2', 'Senator (2/2)'],
  ['representative', 'Representative']
];

export const createDefaultStatePage = () => ({
  title: 'Texas state Republic',
  population: '29,168,331',
  admitted: '12/29/1845',
  settledOnLand: '',
  sealImage: '/texas-state-seal.png',
  offices: Object.fromEntries(STATE_OFFICE_ROLES.map(([key]) => [key, {
    status: ['assemblyClerk', 'senator2'].includes(key) ? 'not-filled' : 'filled',
    holder: ''
  }])),
  lastUpdated: ''
});

export const statusDefinition = (value) => (
  COUNTY_STATUSES.find((status) => status.value === value) || COUNTY_STATUSES[0]
);

export const countyDisplayName = (county, data = {}) => data.customName || `${county} County`;

export const blankOfficeStatuses = () => Object.fromEntries(
  OFFICE_ROLES.map(([key]) => [key, { status: 'not-filled', holder: '' }])
);
