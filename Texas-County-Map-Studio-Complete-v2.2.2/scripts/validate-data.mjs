import { readFile } from 'node:fs/promises';

const file = new URL('../src/data/texas-counties.json', import.meta.url);
const data = JSON.parse(await readFile(file, 'utf8'));
const reference = JSON.parse(await readFile(new URL('../src/data/county-reference.json', import.meta.url), 'utf8'));
const features = Array.isArray(data.features) ? data.features : [];
const fipsCodes = new Set(features.map((feature) => feature.properties?.fips));

if (data.type !== 'FeatureCollection') throw new Error('County data must be a FeatureCollection.');
if (features.length !== 254) throw new Error(`Expected 254 counties; found ${features.length}.`);
if (fipsCodes.size !== 254) throw new Error('County FIPS codes must be unique.');
if (features.some((feature) => !feature.properties?.name || !feature.geometry)) {
  throw new Error('Every county must have a name and geometry.');
}
const missingReference = features.map((feature) => feature.properties.name).filter((name) => {
  const item = reference[name];
  return !item?.population || !item?.established || !item?.countySeat;
});
if (missingReference.length) throw new Error(`Missing county reference data: ${missingReference.join(', ')}`);

console.log('County data validated: 254 boundaries plus population, establishment date, and county seat.');
