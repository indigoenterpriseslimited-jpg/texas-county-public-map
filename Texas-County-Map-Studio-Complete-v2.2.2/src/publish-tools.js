import { OFFICE_ROLES, STATE_OFFICE_ROLES } from './county-schema';

const download = (contents, type, filename) => {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export const exportCountyCsv = (countyNames, counties) => {
  const headers = ['County','Status','Clickable','District ID','Population','Established','County Seat','Redeemed','Settled','Re-Inhabited','Description','Last Updated'];
  OFFICE_ROLES.forEach(([, label]) => headers.push(`${label} Status`, `${label} Name`));
  const rows = countyNames.map((name) => {
    const data = counties[name] || {};
    const values = [name, data.status || 'unassigned', data.clickable !== false ? 'Yes' : 'No', data.districtId || '', data.population, data.established, data.countySeat, data.redeemed, data.settled, data.reInhabited, data.description, data.lastUpdated];
    OFFICE_ROLES.forEach(([key]) => values.push(data.offices?.[key]?.status || 'not-filled', data.offices?.[key]?.holder || ''));
    return values.map(escapeCsv).join(',');
  });
  download([headers.map(escapeCsv).join(','), ...rows].join('\r\n'), 'text/csv;charset=utf-8', 'texas-county-back-office.csv');
};

const safeScriptJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

const inlineImage = async (source) => {
  if (!source || source.startsWith('data:')) return source || '';
  const blob = await fetch(source).then((response) => response.blob());
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const exportPublishedHtml = async ({ project, countyNames, svgMarkup }) => {
  const publicCounties = Object.fromEntries(countyNames.map((name) => {
    const { notes, ...publicData } = project.counties[name] || {};
    return [name, publicData];
  }));
  const statePage = { ...project.statePage, sealImage: await inlineImage(project.statePage?.sealImage) };
  const data = safeScriptJson({ project: { title: project.title, bannerTitle: project.bannerTitle, counties: publicCounties, statePage, statusColors: project.statusColors }, countyNames, officeRoles: OFFICE_ROLES, stateOfficeRoles: STATE_OFFICE_ROLES });
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${String(project.title).replace(/[<>&"]/g, '')}</title><style>
*{box-sizing:border-box}body{margin:0;background:#e6f5fa;color:#092a3c;font-family:Arial,sans-serif}.banner{display:grid;grid-template-columns:90px 1fr;margin:6px;background:#970000;color:#fff}.flag{background:linear-gradient(#fff 0 50%,#cf1747 50%);border-left:34px solid #06275a}.banner h1,.map-title,h2,h3{font-family:Georgia,serif;font-style:italic}.banner h1{margin:.5rem;text-align:center;font-size:clamp(1.5rem,4vw,3rem)}.map-title{margin:2rem 1rem 0;padding:1.5rem;background:#08a4e8;color:#fff;text-align:center;font-size:clamp(1.5rem,3vw,2.3rem)}main{max-width:1200px;margin:auto}.map-wrap{padding:1rem;background:#eee9de}.map-wrap svg{display:block;width:100%;height:auto;max-height:720px}.county-shape{cursor:pointer}.county-shape:hover,.county-shape:focus{opacity:.75;stroke:#001b2e;stroke-width:2.5}.county-shape.is-disabled{cursor:not-allowed;opacity:.45}.prompt{margin:.7rem 0 0;padding:.65rem 1rem;border:2px solid #062c40;border-radius:9px;background:#e2d5b4;font-size:1.05rem}.directory{display:flex;flex-wrap:wrap;justify-content:center;gap:.15rem .75rem;padding:1rem;border-block:18px solid #a90000;background:#dff4fa}.directory button{padding:.15rem;border:0;background:transparent;color:#092a3c;cursor:pointer}.directory button:hover{text-decoration:underline}.directory button:disabled{opacity:.35;cursor:not-allowed}.profile{display:none;min-height:520px;padding:2rem;color:#fff;background:#09a5ec;text-align:center}.profile.open{display:block}.profile h2{margin:0 0 1.5rem;font-size:2rem}.facts{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;text-align:left}.fact b{margin-left:.35rem}.profile h3{font-size:1.65rem}.offices p{margin:.45rem}.unassigned{color:#d8c9a7}.not-filled{color:#d00000}.filled{color:#126d35}.in-progress{color:#ffdf46}.not-applicable{color:#d8e0e4}.updated{margin-top:1.5rem;color:#dce66c}.back{border:1px solid #fff;border-radius:6px;padding:.55rem .8rem;background:#087db4;color:#fff;cursor:pointer}@media(max-width:650px){.banner{grid-template-columns:54px 1fr}.banner h1{font-size:1.25rem}.facts{grid-template-columns:1fr}.profile{padding:1.2rem}}
</style></head><body><header class="banner"><div class="flag" aria-hidden="true"></div><h1>${String(project.bannerTitle || 'We the People ARE the Republic').replace(/[<>&]/g, '')}</h1></header><main><h2 class="map-title">${String(project.title).replace(/[<>&]/g, '')}</h2><section id="mapSection"><div class="map-wrap">${svgMarkup}<p class="prompt" id="prompt">Point to a county to identify it or select from below</p></div><nav class="directory" id="directory" aria-label="Texas counties"><button id="stateButton" style="flex-basis:100%;padding:.7rem;background:#08a4e8;color:white;font-weight:bold;border-radius:8px">State Offices</button></nav></section><article class="profile" id="profile"><button class="back" id="back">← Back to the Texas map</button><img id="seal" style="display:none;width:120px;height:120px;object-fit:contain;margin:1rem auto;border-radius:50%;background:white"><h2 id="countyTitle"></h2><div class="facts" id="facts"></div><h3 id="officesTitle">County Offices</h3><div class="offices" id="offices"></div><p id="description"></p><p class="updated" id="updated"></p></article></main><script>
const DATA=${data};const map=document.getElementById('mapSection'),profile=document.getElementById('profile'),prompt=document.getElementById('prompt');const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const labels={'unassigned':'Not Set','not-filled':'Not Filled','filled':'Filled','in-progress':'In Progress','not-applicable':'Not Applicable'};function setSeal(src){const s=document.getElementById('seal');s.src=src||'';s.style.display=src?'block':'none'}function showProfile(){map.style.display='none';profile.classList.add('open')}function openCounty(name){const d=DATA.project.counties[name]||{};if(d.clickable===false)return;setSeal(d.sealImage);document.getElementById('countyTitle').textContent=d.customName||name+' County';document.getElementById('officesTitle').textContent='County Offices';const fields=[['Population',d.population],['Established',d.established],['County Seat',d.countySeat],['Redeemed',d.redeemed],['Settled',d.settled],['Re-Inhabited',d.reInhabited]];document.getElementById('facts').innerHTML=fields.map(x=>'<div class="fact">'+esc(x[0])+': <b>'+esc(x[1]||'—')+'</b></div>').join('');document.getElementById('offices').innerHTML=DATA.officeRoles.map(x=>{const o=(d.offices||{})[x[0]]||{status:'not-filled'};return '<p>'+esc(x[1])+': <strong class="'+esc(o.status)+'">'+esc(o.holder||labels[o.status]||'Not Filled')+'</strong></p>'}).join('');const desc=document.getElementById('description');desc.textContent=d.description||'';desc.hidden=!d.description;document.getElementById('updated').textContent='Last Update: '+(d.lastUpdated||'Not yet updated');showProfile();location.hash='county/'+encodeURIComponent(name)}function openState(){const d=DATA.project.statePage||{};setSeal(d.sealImage);document.getElementById('countyTitle').textContent=d.title||'Texas state Republic';document.getElementById('officesTitle').textContent='State Offices (interim)';document.getElementById('facts').innerHTML=[['Population',d.population],['Admitted',d.admitted],['Settled on Land',d.settledOnLand]].map(x=>'<div class="fact">'+esc(x[0])+': <b>'+esc(x[1]||'—')+'</b></div>').join('');document.getElementById('offices').innerHTML=DATA.stateOfficeRoles.map(x=>{const o=(d.offices||{})[x[0]]||{status:'not-filled'};return '<p>'+esc(x[1])+': <strong class="'+esc(o.status)+'">'+esc(o.holder||(o.status==='filled'?'Office Filled':labels[o.status]||'Not Filled'))+'</strong></p>'}).join('');document.getElementById('description').hidden=true;document.getElementById('updated').textContent='Last updated on '+(d.lastUpdated||'Not yet updated');showProfile();location.hash='state'}function showMap(){map.style.display='block';profile.classList.remove('open');history.replaceState(null,'',location.pathname+location.search)}document.getElementById('stateButton').onclick=openState;DATA.countyNames.forEach(name=>{const b=document.createElement('button');b.textContent=name;b.disabled=DATA.project.counties[name]?.clickable===false;b.onclick=()=>openCounty(name);document.getElementById('directory').appendChild(b)});document.querySelectorAll('[data-county]').forEach(p=>{const name=p.getAttribute('data-county');p.onclick=()=>openCounty(name);p.onmouseenter=()=>prompt.textContent=name+' County';p.onmouseleave=()=>prompt.textContent='Point to a county to identify it or select from below'});document.getElementById('back').onclick=showMap;if(location.hash==='#state')openState();else{const match=decodeURIComponent(location.hash).match(/^#county\/(.+)$/);if(match&&DATA.countyNames.includes(match[1]))openCounty(match[1])}
</script></body></html>`;
  const color = (key, fallback) => /^#[0-9a-f]{6}$/i.test(project.statusColors?.[key] || '') ? project.statusColors[key] : fallback;
  const overrides = `<style>.flag{border:0!important;background:none!important}.county-shape:hover,.county-shape:focus{opacity:1!important;stroke:#ffcc00!important;stroke-width:3.5!important}.unassigned{color:${color('unassigned','#d8c9a7')}}.not-filled{color:${color('not-filled','#c81919')}}.filled{color:${color('filled','#238443')}}.in-progress{color:${color('in-progress','#e0a21a')}}.not-applicable{color:${color('not-applicable','#8b9397')}}</style>`;
  const flag = `<svg class="flag" viewBox="0 0 3 2" aria-label="Flag of Texas"><rect width="1" height="2" fill="#002868"/><rect x="1" width="2" height="1" fill="#fff"/><rect x="1" y="1" width="2" height="1" fill="#bf0a30"/><polygon fill="#fff" points="0.5,0.56 0.603,0.858 0.918,0.864 0.667,1.055 0.759,1.357 0.5,1.177 0.241,1.357 0.333,1.055 0.082,0.864 0.397,0.858"/></svg>`;
  const publishedHtml = html
    .replace('</head>', `${overrides}</head>`)
    .replace('<div class="flag" aria-hidden="true"></div>', flag)
    .replace('match(/^#county/(.+)$/)', 'match(/^#county\\/(.+)$/)');
  download(publishedHtml, 'text/html;charset=utf-8', `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'texas-map'}-published.html`);
};
