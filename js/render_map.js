const map = L.map('map').setView([37.94952, 23.678294], 16);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

let nodeCoords = {};
let graph = {};
let edges = {};
let markers = {};

fetch('./map_graph.json')
.then(response => response.json())
.then(data => {
    nodeCoords = data.nodes;
    graph = data.edges;

    for (const [id, coords] of Object.entries(nodeCoords)) {
        markers[id] = L.circleMarker(coords, {
            radius: 8,
            color: 'gray',
            fillColor: 'transparent',
            fillOpacity: 1
            }).addTo(map).bindPopup(`Node ${id}`);
    }

    for (const [from, neighbors] of Object.entries(graph)) {
        for (const neighbor of neighbors) {
            const to = neighbor.node;
            const key = [from, to].sort().join('-');
            if (!edges[key]) {
                const latlngs = [nodeCoords[from], nodeCoords[to]];
                edges[key] = L.polyline(latlngs, {color: 'gray', weight: 4}).addTo(map);
                const midLat = (nodeCoords[from][0] + nodeCoords[to][0]) / 2;
                const midLng = (nodeCoords[from][1] + nodeCoords[to][1]) / 2;
                L.marker([midLat, midLng], {
                icon: L.divIcon({
                className: 'weight-label',
                html: `<div style="font-size: 7px; color: black; opacity: 0.4;">${neighbor.weight.toFixed(0)}</div>`
                }),
                interactive: false
                }).addTo(map);
            }
        }
    }
});