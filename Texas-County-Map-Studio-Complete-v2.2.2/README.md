# Texas County Map Studio

Texas County Map Studio is a standalone, local-first back office for building multiple interactive Texas county maps. Each map mode keeps its own styling, districts, county settings, and visitor-facing click content.

The application includes all 254 Texas counties using generalized 2025 boundaries from the U.S. Census Bureau TIGERweb service.

## Start the finished local app

On Windows, double-click:

`Start Texas County Map Studio.cmd`

The launcher opens the built application at `http://127.0.0.1:4173`. If that address is already being used, it automatically tries the next available address through `4193`. Keep the small launcher window open while using the studio. Node.js is required, but the finished build does not need an internet connection or an npm install.

## Back-office workflow

1. Create a new map mode or duplicate an existing one.
2. Give the mode an internal name and a public map title.
3. Search for a county or click it on the map.
4. Use **Spreadsheet** to set each county to Not Set, Not Filled, Filled, In Progress, or Not Applicable.
5. Select **Edit page** to open that county's Back Office on the right side and enter county facts and officeholders.
6. Assign districts; county status controls the fill color and district membership controls the outline.
7. Switch to **Visitor preview** to test the map, county-name directory, and blue county information pages.
8. Download a JPEG/PNG for a static map, or download the self-contained interactive HTML page for a website.

## Main capabilities

- Multiple independent map modes in one workspace
- Accurate boundaries for all 254 Texas counties
- Per-county clickable on/off setting
- Spreadsheet-style status management for all 254 counties
- District 01, District 02, and District 03 preassigned from the supplied reference map and shown on every spreadsheet row
- Right-side County Back Office drawer for easier editing
- Red Not Filled, green Filled, amber In Progress, and gray Not Applicable status colors
- Editable county facts and seven county-office records
- Preloaded 2020 population, establishment date, and researched county seat for all 254 counties
- County seal upload with automatic image resizing and public display
- Blue public county information page with automatic last-update date
- Larger public-page and spreadsheet type for readability
- State Offices button, State Back Office, and the 14 interim state positions
- Edit State Page button directly in Spreadsheet Mode
- Adjustable color picker for every public status
- Correctly proportioned Texas flag in the preview and published page
- Included gold-and-crimson Texas State seal
- Corrected published-page county routing for map clicks, county-name buttons, and State Offices
- Clickable county-name directory below the public map
- Editable visitor title, description, link, and button text
- Private internal notes for every county
- Status fill colors and reusable district outline colors
- District paint mode for fast grouping
- County search
- Undo and redo history
- Automatic local saving in the browser
- Full workspace import and export as JSON
- County data export as an Excel-compatible CSV
- Static map download as JPEG or PNG
- One-file interactive HTML export that can be uploaded to another website
- Responsive desktop, tablet, and mobile layout
- Keyboard-accessible county selection

## Data ownership and privacy

The app stores its working workspace in the current browser's local storage. It does not require an account or send project information to a server. Export the workspace regularly to create a portable backup or move it to another computer.

Private notes stay out of the visitor preview. They remain in local storage and exported workspace files.

## Editing the source

Requirements:

- Node.js 20.19 or newer
- npm

Install and run the development version:

```text
npm install
npm run dev
```

Create a fresh finished build:

```text
npm run check:data
npm run build
```

## Project structure

```text
src/
  components/
    ControlPanel.jsx          Back office, mode manager, districts, import/export
    CountyDetailsPanel.jsx    County facts and offices editor
    CountyPublicProfile.jsx   Blue visitor-facing county page
    CountySpreadsheet.jsx     All-county status management grid
    MapEditor.jsx             D3 county map and keyboard interaction
  data/
    texas-counties.json       All 254 generalized Texas county boundaries
  styles/                     Application, controls, county card, and map styling
scripts/
  serve-local.mjs             Dependency-free local server for the finished build
  validate-data.mjs           County count, FIPS, name, and geometry validation
```

## Boundary attribution

County geometry is derived from the U.S. Census Bureau TIGERweb Generalized ACS 2025 Counties 5M layer. County geometry is geographic reference data; map-mode content and styling belong to the workspace author.
