const map = L.map('map').setView([2, 2], 3);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

const nodeLayer = L.layerGroup().addTo(map);
const edgeLayer = L.layerGroup().addTo(map);
const labelLayer = L.layerGroup().addTo(map);

let nodeCoords = {};
let graph = {};
let edges = {};
let markers = {};

// For new features
let centerMarker = null;
let selectionSquare = null;
const radiusSlider = document.getElementById('radius');
const radiusLabel = document.getElementById('radiusLabel');

// Track if center selection is enabled
let centerSelectionEnabled = false;

// Function to enable center selection mode
function enableCenterSelection() {
    centerSelectionEnabled = true;
    document.getElementById('centerStatus').textContent = "🟢";
    logMessage("Center selection enabled. Click on map to set center.");
}

// Function to disable center selection mode
function disableCenterSelection() {
    centerSelectionEnabled = false;
    document.getElementById('centerStatus').innerHTML = "🔴<br><i>(clear map to re-enable)</i>";
    if (centerMarker) {
        map.removeLayer(centerMarker);
        centerMarker = null;
    }
    if (selectionSquare) {
        map.removeLayer(selectionSquare);
        selectionSquare = null;
    }
    logMessage("Center selection disabled.");
}


/**
 * Calculates the bounding box for a square centered at a lat/lng.
 * @param {L.LatLng} center - The center point.
 * @param {number} distance - The distance in meters from the center to each side.
 * @returns {L.LatLngBounds} The calculated Leaflet bounds.
 */
function getSquareBounds(center, distance) {
    const lat = center.lat;
    const lng = center.lng;

    const R = 6378137; // Earth's radius in meters

    const latOffset = (distance / R) * (180 / Math.PI);
    const lngOffset = (distance / (R * Math.cos(Math.PI * lat / 180))) * (180 / Math.PI);
    
    const southWest = L.latLng(lat - latOffset, lng - lngOffset);
    const northEast = L.latLng(lat + latOffset, lng + lngOffset);

    return L.latLngBounds(southWest, northEast);
}


/**
 * Updates the visual selection square on the map.
 */
function updateSelectionSquare() {
    const radius = radiusSlider.value;
    if (centerMarker) {
        const center = centerMarker.getLatLng();
        const bounds = getSquareBounds(center, radius);

        if (selectionSquare) {
            selectionSquare.setBounds(bounds);
        } else {
            selectionSquare = L.rectangle(bounds, {
                weight: 2,
                color: '#0172BB',
                opacity: 0.8,
                fillColor: '#0172BB',
                fillOpacity: 0.1,
                interactive: false
            }).addTo(map);
        }
    }
}

// Event listener for the radius slider
radiusSlider.addEventListener('input', (event) => {
    radiusLabel.textContent = event.target.value;
    updateSelectionSquare();
});

map.on('click', function(e) {
    if (!centerSelectionEnabled) return;
    
    if (centerMarker) {
        centerMarker.setLatLng(e.latlng);
    } else {
        centerMarker = L.marker(e.latlng, { draggable: true }).addTo(map);
        centerMarker.on('dragend', updateSelectionSquare);
    }
    updateSelectionSquare();
});


/**
 * Renders a graph on the map.
 * @param {object} graphData - The graph data with 'nodes' and 'edges'.
 */
function renderGraph(graphData) {
    nodeLayer.clearLayers();
    edgeLayer.clearLayers();
    labelLayer.clearLayers();
    edges = {};
    markers = {};

    nodeCoords = graphData.nodes;
    graph = graphData.edges;

    for (const [id, coords] of Object.entries(nodeCoords)) {
        markers[id] = L.circleMarker(coords, {
            radius: 8,
            color: 'gray',
            fillColor: 'transparent',
            fillOpacity: 1
        }).addTo(nodeLayer).bindPopup(`Node ${id}`);
    }

    // --- EDGE RENDERING LOGIC REVERTED TO ORIGINAL STATE ---
    for (const [from, neighbors] of Object.entries(graph)) {
        for (const neighbor of neighbors) {
            const to = neighbor.node;
            
            // Use the simple, sorted key to identify unique edges.
            const key = [from, to].sort().join('-');

            if (!edges[key] && nodeCoords[from] && nodeCoords[to]) {
                const latlngs = [nodeCoords[from], nodeCoords[to]];
                const polyline = L.polyline(latlngs, { color: 'gray', weight: 4 }).addTo(edgeLayer);
                edges[key] = polyline;

                // The arrow/decorator logic has been completely removed.

                const midLat = (nodeCoords[from][0] + nodeCoords[to][0]) / 2;
                const midLng = (nodeCoords[from][1] + nodeCoords[to][1]) / 2;
                L.marker([midLat, midLng], {
                    icon: L.divIcon({
                        className: 'weight-label',
                        html: `<div style="font-size: 7px; color: black; opacity: 0.4;">${neighbor.weight.toFixed(0)}</div>`
                    }),
                    interactive: false
                }).addTo(labelLayer);
            }
        }
    }
}

function clearMapFromGraph() {
    resetMapWithoutRemovingGraph();
    nodeLayer.clearLayers();
    edgeLayer.clearLayers();
    labelLayer.clearLayers();
    edges = {};
    markers = {};
    enableCenterSelection();
}

// Fetch and render the initial default graph
fetch('./map_graph.json')
    .then(response => response.json())
    .then(data => {
        renderGraph(data);
    })
    .catch(error => console.error('Error loading initial graph:', error));

/**
 * Fetches new graph data from the server and renders it.
 */
async function generateGraph() {
    if (!centerMarker) {
        alert("Please choose a center point by clicking on the map first.");
        return;
    }

    logMessage("Generating new graph from server...");
    const graphType = document.getElementById('graphType').value;
    const center = centerMarker.getLatLng();
    const radius = parseInt(radiusSlider.value, 10);

    try {
        const response = await fetch('/create_graph', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                graph_type: graphType,
                center: [center.lat, center.lng],
                radius: radius
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const newGraphData = await response.json();
        logMessage("Successfully received and rendered new graph.");
        
        renderGraph(newGraphData);
        map.setView(center, map.getZoom());

        // Hide pin and square after successful graph generation
        if (centerMarker) {
            map.removeLayer(centerMarker);
            centerMarker = null;
        }
        if (selectionSquare) {
            map.removeLayer(selectionSquare);
            selectionSquare = null;
        }
        disableCenterSelection();

    } catch (error) {
        console.error('Error generating graph:', error);
        logMessage(`Failed to generate graph. Check console for details. Error: ${error.message}`);
    }
}

enableCenterSelection();