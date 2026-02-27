(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/node_modules/@capacitor/geolocation/dist/esm/web.js [app-client] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "static/chunks/node_modules_@capacitor_geolocation_dist_esm_web_ce8f8f7e.js",
  "static/chunks/node_modules_@capacitor_geolocation_dist_esm_web_0838638a.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/node_modules/@capacitor/geolocation/dist/esm/web.js [app-client] (ecmascript)");
    });
});
}),
"[project]/src/components/GPSMap.jsx [app-client] (ecmascript, next/dynamic entry, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "static/chunks/node_modules_14ecf956._.js",
  "static/chunks/src_components_GPSMap_jsx_4e9f7206._.js",
  {
    "path": "static/chunks/node_modules_leaflet_dist_leaflet_ef5f0413.css",
    "included": [
      "[project]/node_modules/leaflet/dist/leaflet.css [app-client] (css)"
    ]
  },
  "static/chunks/src_components_GPSMap_jsx_2d3b69a1._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/src/components/GPSMap.jsx [app-client] (ecmascript, next/dynamic entry)");
    });
});
}),
]);