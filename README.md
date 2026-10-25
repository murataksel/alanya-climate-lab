# Alanya Climate Lab · 1.1

A bilingual, browser-local planning game using the supplied Alanya Climate Risk Atlas v11 geography. Build and compare explicit hypothetical interventions on a real 1 km² study area. Three presets and a custom area picker are included.

## Run

Open `index.html` directly (source repository: `dist/index.html`), or serve `dist` with any static HTTP server. No installation, API key or model service is required. Source data, Leaflet and the calculation engine are bundled. The separate GitHub Pages site is public. The application stores scenarios in the current browser; JSON export is required to transfer work to another device or origin.

## Street basemap

The web version starts with an OpenStreetMap street map served by OpenStreetMap France. The **Basemap** selector switches between streets and the bundled offline data background. **Land-cover visibility** adjusts the WorldCover overlay from 0–100%; proposed objects, geometric shadows and selected hazards remain separate layers. Basemap and visibility preferences survive reloads in this browser. Opening `index.html` as a local file uses the offline background. Online tiles require an internet connection; if they fail to load, the data background remains available.

Basemap buildings and roads are visual context only. They are not automatically imported as calculation inventory and do not change any model input or result.

Street tiles: data © OpenStreetMap contributors (ODbL); cartography © OpenStreetMap France (CC BY-SA 2.0). Attribution is visible on the map. No street tiles are bundled, bulk-downloaded or prefetched. This public, non-commercial academic site uses the service for interactive viewing under its moderate-traffic policy: https://www.openstreetmap.fr/usage/.

## Interact

Choose a tool. Trees use one point; buildings and shade canopies use two opposite rectangle corners; parks, permeable surfaces, rain gardens and storage use at least three vertices and **Finish**; roads use at least two vertices and **Finish**. Select an object through the map or object list to edit it, drag its centre handle, or remove it. Undo/redo is available within the current session. Saved scenarios survive reloads.

Keyboard: focus the map, use arrows for 20 m steps or Shift+arrows for 5 m, Space to add a point, Enter to finish, and Escape to cancel. Conditions and object lists collapse on small screens; a map-jump button is provided.

Save alternatives, compare them, export scenario JSON, design GeoJSON or comparison CSV. Source building inventories can be imported as WGS84 GeoJSON Polygon/MultiPolygon with `height` in metres and `building:levels` or `floors`. Missing values are explicitly assumed. Imported source buildings are read-only; their removal is a scenario action. No built-in individual-building or tree-height inventory is supplied.

## What is calculated

- Flat-ground geometric shade from idealised spherical tree crowns, vertical building prisms and shade canopies. Solar position follows NOAA's general equations with UTC+3. Shadows are sampled at 5 m cell centres. No air-temperature, UTCI, evapotranspiration or wind response is computed.
- Event runoff potential: `Q = P * sum(C_i A_i) / 1000`, with rainfall in mm, area in m² and volume in m³. The runoff coefficients are editable assumptions. Storage retains `min(effective capacity, Q * connected fraction)`. This is a lumped water balance; routing, drainage capacity, timing and flood depths are not solved. There is no assigned rainfall return period.
- Surface-conversion area, effective storage, assumed cost, gross floor-area change of known buildings, and daily gross water demand of newly designed greenery. Costs and water coefficients are illustrative game parameters, not locally calibrated estimates or price quotations. Tree planting alone does not change the ground runoff coefficient. Removed known buildings expose assumed bare ground.
- Footprint overlap with fixed raw JRC historical river T100 or CLIMAAX/Deltares coastal T100 2018/2050 RCP8.5 layers. Empty hazard cells remain unknown; permanent-water and suspicious-depth flags are retained. Interventions never change these source flood depths.

Baseline coefficients and surfaces use supplied ESA WorldCover 2021 v200 classes already reprojected to 20 m. A 5 m calculation grid adds no source land-cover detail. Imported footprints and drawn objects have their own geometric support. Quantities are sampled within the study area; water and nodata are excluded from land intervention accounting. Overlapping surface conversions are counted once, with the last conversion taking precedence. Active building footprints override surface edits. Geometric shade is conditional on the known and proposed objects only.

Wildfire weather cells, inherited drought cells, population imagery and infrastructure are read-only context. The failed/unavailable validation of inherited fire RF and drought-method audit issues prevent their use as causal intervention models. No wildfire-spread or crop-yield model is executed.

## Data and checks

`dist/data/manifest.json` records source support and provenance. `dist/VALIDATION.json` records independent projection, source raster and water-balance checks plus browser QA. These are software checks, not scientific validation. Global source classes are losslessly run-length encoded for offline operation. The custom picker samples them and the original projected flood geometries at cell centres. Overview imagery is nearest-neighbour projected to Web Mercator; the calculation grid remains UTM 36N.

Run `node tests/engine.cjs` for meaningful engine and data-transformation checks. No npm dependency installation or build step is needed.

## References and attribution

- OpenStreetMap copyright: https://www.openstreetmap.org/copyright
- OpenStreetMap France cartography and licence: https://www.openstreetmap.fr/open-data/
- NOAA, General Solar Position Calculations: https://gml.noaa.gov/grad/solcalc/solareqns.PDF
- ESA WorldCover data, licence and citation: https://esa-worldcover.org/en/data-access
- UMEP/SOLWEIG reference implementation (future model integration; not run here): https://umep-docs.readthedocs.io/en/latest/OtherManuals/SOLWEIG.html
- SFINCS (future hydraulic integration; not run here): https://sfincs.readthedocs.io/en/stable/overview.html

© ESA WorldCover project 2021 / Contains modified Copernicus Sentinel data (2021) processed by ESA WorldCover consortium. WorldCover: CC BY 4.0. Other geography retains the supplied atlas v11 source scope and limitations. Leaflet 1.9.4 licence is bundled in `dist/assets/LEAFLET-LICENSE.txt`.

Original analytical atlas outputs are not overwritten or recalculated. See `github-integration` for the separate v11 integration patch. Updates to this separate GitHub Pages repository are published from its main branch.
