# Maps of real places

Rules for any `visual-*` page that draws real geography: a grid, a network, a route, a region. The reader may know the place. A wrong shape or a wrong position reads as an error before the first word.

## Sources

| Need | Source | Licence | How |
|---|---|---|---|
| Country and region shapes | world-atlas on unpkg (Natural Earth 1:50m or 1:110m), TopoJSON | public domain | `fetch` the JSON, `feature()` from `topojson-client` |
| Infrastructure: power lines, cables, stations, rail, roads, rivers | OpenStreetMap through Overpass | ODbL, credit "OpenStreetMap contributors" | query in a file: `curl -A '<page>/1.0' --data-urlencode "data@q.txt" https://overpass-api.de/api/interpreter`. Body: `[out:json][timeout:900]; way[<tags>](<bbox>); out geom;`. Without a User-Agent the server answers 406. Split a continent into tiles of about 10° of longitude. |
| Elevation, land cover | Natural Earth rasters, Copernicus DEM | check per set | only when the story needs them |

Keep what you fetched. Raw responses go to `.visuals/<name>/sources/`. The queries and the scripts that reduce them go to `.visuals/<name>/build/`. `SOURCES.md` names the URL or query, the fetch date and the licence for every file. The page rebuilds without the network.

## Prepare

1. **Embed the full geometry of the area the story covers.** Size matters for a hosted page, not for a local one. Simplify for readability, not for bytes. A continent of 380 kV lines is a few MB and loads from disk in under a second.
2. **Simplify with Douglas-Peucker** to the width of one line on screen at the closest camera pose, and round to 3 decimals (about 100 m). Less and the lines wobble. More and they lose the bends the reader knows.
3. **Strip the closing point of every ring before you triangulate.** GeoJSON rings repeat their first point at the end, and earcut (inside Three.js `Shape`) then drops a whole triangle in some countries: Belgium lost its coast. Remove consecutive duplicates too.
4. **Project once.** One function from lon/lat to scene units, used by every shape, line, label and disc. Equirectangular with `cos(mid latitude)` on x is enough for a country or a continent. Name the projection and the centre in the assumptions block.
5. **Build a graph when things flow.** Merge way endpoints within about 600 m into one node: lines end at different portals inside one substation, and exact matching leaves the graph in pieces. Make an adjacency list. Route with Dijkstra on length. Flows then run along real lines. A place with no path is a data gap: the build script prints it, and the page draws a straight line and names it as an assumption.
6. **Filter by tag, never by eye.** Voltage, operator, name, ref. Record the filter in `SOURCES.md`.

## Quantities on a map

Two symbols only.

- **Flow is a dashed line** along the real path. The dash offset is a value from the model (cumulative energy, a count, time). Direction and speed then mean something, and scrubbing back reverses them. Dots are for discrete things only.
- **A quantity at a place is a flat disc** at its real location. Area follows the value, so radius is its square root. A disc that goes dark is a thing that stopped.
- Everything else goes to the HUD or the inset: a frequency, a price, a total for an area. Nothing stands up from the map. Columns, bars and towers hide the lines and the labels.

## Camera and labels

- At every reading frame the map is readable: borders visible, lines distinguishable, the smallest label line at least 13 CSS px. If the lines merge into a blur, move in or show fewer lines.
- A label sits beside its place, not on the line. Real things keep their real names (NorNed, Maasvlakte), spelled as the source spells them.
- Colour by meaning, not by country. Tiles stay one neutral colour unless a tile carries a model value.
