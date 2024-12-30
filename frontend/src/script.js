const { getMapData } = require("osm-api");

(async () => {
    // Initialize the OSM client
    const data = await getMapData([
        43, -79, 44, -77
    ]);
})();
