// ============================================
// SMART MAP MODULE - Premium
// ============================================

let map = null;
let routePolyline = null;
let markers = [];
let vehicleMarker = null;
let simulationInterval = null;
let routeCoordinates = [];
let stops = [];
let isMapReady = false;

// ============================================
// CONFIGURATION
// ============================================
const MAP_CONFIG = {
    center: [35.6992, 51.4000],
    zoom: 13,
    tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    tileAttribution: '© OpenStreetMap contributors',
    vehicleIcon: '🚌',
    colors: {
        route: '#4F46E5',
        routeGlow: 'rgba(79, 70, 229, 0.3)',
        stop: '#10B981',
        school: '#EF4444',
        home: '#F59E0B'
    }
};

// Mock route data (Tehran area)
const MOCK_ROUTES = {
    north: {
        name: 'مسیر شمال',
        coordinates: [
            [35.6892, 51.3890], // Start
            [35.6950, 51.3950],
            [35.7000, 51.4000],
            [35.7050, 51.4050],
            [35.7100, 51.4100]  // End
        ],
        stops: [
            { name: 'خانه سارا', coords: [35.6900, 51.3900], icon: '🏠', type: 'home' },
            { name: 'میدان آزادی', coords: [35.6960, 51.3960], icon: '📍', type: 'stop' },
            { name: 'خیابان ولیعصر', coords: [35.7020, 51.4020], icon: '📍', type: 'stop' },
            { name: 'مدرسه', coords: [35.7100, 51.4100], icon: '🏫', type: 'school' }
        ],
        eta: '۸ دقیقه',
        speed: '۳۵ km/h'
    },
    south: {
        name: 'مسیر جنوب',
        coordinates: [
            [35.6800, 51.3850],
            [35.6850, 51.3900],
            [35.6900, 51.3950],
            [35.6950, 51.4000],
            [35.7000, 51.4050]
        ],
        stops: [
            { name: 'خانه محمد', coords: [35.6810, 51.3860], icon: '🏠', type: 'home' },
            { name: 'پارک شهر', coords: [35.6870, 51.3920], icon: '📍', type: 'stop' },
            { name: 'خیابان انقلاب', coords: [35.6920, 51.3970], icon: '📍', type: 'stop' },
            { name: 'مدرسه', coords: [35.7000, 51.4050], icon: '🏫', type: 'school' }
        ],
        eta: '۱۰ دقیقه',
        speed: '۳۰ km/h'
    }
};

// ============================================
// INITIALIZE MAP
// ============================================
function initMap(containerId = 'liveMap', routeId = 'north') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Map container not found:', containerId);
        return null;
    }
    
    // Clear existing map
    if (map) {
        map.remove();
        map = null;
    }
    
    // Create map
    map = L.map(containerId, {
        center: MAP_CONFIG.center,
        zoom: MAP_CONFIG.zoom,
        zoomControl: false,
        fadeAnimation: true,
        zoomAnimation: true,
        markerZoomAnimation: true
    });
    
    // Add tile layer
    L.tileLayer(MAP_CONFIG.tileLayer, {
        attribution: MAP_CONFIG.tileAttribution,
        maxZoom: 19,
        minZoom: 10
    }).addTo(map);
    
    // Add zoom control
    L.control.zoom({
        position: 'topleft'
    }).addTo(map);
    
    // Load route
    loadRoute(routeId);
    
    // Add map controls
    addMapControls();
    
    isMapReady = true;
    
    // Fit bounds
    if (routeCoordinates.length > 0) {
        map.fitBounds(routeCoordinates, { padding: [50, 50] });
    }
    
    return map;
}

// ============================================
// LOAD ROUTE
// ============================================
function loadRoute(routeId) {
    const route = MOCK_ROUTES[routeId] || MOCK_ROUTES.north;
    routeCoordinates = route.coordinates;
    stops = route.stops;
    
    // Draw route
    drawRoute(routeCoordinates);
    
    // Add stops
    addStops(stops);
    
    // Add vehicle
    addVehicle(routeCoordinates[0]);
    
    // Start simulation
    startSimulation(routeCoordinates);
    
    // Update info panel
    updateInfoPanel(route);
}

// ============================================
// DRAW ROUTE
// ============================================
function drawRoute(coordinates) {
    if (!map) return;
    
    // Remove existing route
    if (routePolyline) {
        map.removeLayer(routePolyline);
    }
    
    // Main route
    routePolyline = L.polyline(coordinates, {
        color: MAP_CONFIG.colors.route,
        weight: 4,
        opacity: 0.8,
        smoothFactor: 1,
        lineJoin: 'round',
        lineCap: 'round'
    }).addTo(map);
    
    // Glow effect
    const glowLine = L.polyline(coordinates, {
        color: MAP_CONFIG.colors.routeGlow,
        weight: 12,
        opacity: 0.2,
        smoothFactor: 1
    }).addTo(map);
    
    // Animated dash line
    const dashLine = L.polyline(coordinates, {
        color: MAP_CONFIG.colors.route,
        weight: 2,
        opacity: 0.3,
        dashArray: '10 15',
        smoothFactor: 1
    }).addTo(map);
    
    // Animate dash
    let offset = 0;
    setInterval(() => {
        offset = (offset + 2) % 20;
        dashLine.setStyle({
            dashOffset: offset
        });
    }, 100);
    
    // Add route label
    const midPoint = coordinates[Math.floor(coordinates.length / 2)];
    const label = L.divIcon({
        html: `<div style="background: var(--glass-bg); backdrop-filter: blur(10px); padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; color: var(--text-primary); border: 1px solid var(--border-color);">
            🚌 مسیر فعال
        </div>`,
        className: 'route-label',
        iconSize: [80, 30],
        iconAnchor: [40, 15]
    });
    L.marker(midPoint, { icon: label, interactive: false }).addTo(map);
}

// ============================================
// ADD STOPS
// ============================================
function addStops(stopsData) {
    if (!map) return;
    
    // Clear existing markers
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    
    stopsData.forEach((stop, index) => {
        const isStart = index === 0;
        const isEnd = index === stopsData.length - 1;
        const color = stop.type === 'home' ? MAP_CONFIG.colors.home :
                     stop.type === 'school' ? MAP_CONFIG.colors.school :
                     MAP_CONFIG.colors.stop;
        
        // Create custom icon
        const icon = L.divIcon({
            html: `<div style="
                background: ${color};
                color: white;
                width: ${isStart || isEnd ? '40px' : '32px'};
                height: ${isStart || isEnd ? '40px' : '32px'};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: ${isStart || isEnd ? '18px' : '14px'};
                border: 3px solid white;
                box-shadow: 0 4px 16px rgba(0,0,0,0.2);
                animation: ${isStart ? 'map-marker-bounce 2s infinite' : 'none'};
                transition: transform 0.3s ease;
            ">${stop.icon}</div>`,
            className: 'stop-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
        
        // Create popup
        const popupContent = `
            <div style="text-align: center; padding: 4px;">
                <div style="font-size: 24px;">${stop.icon}</div>
                <strong style="font-size: 14px;">${stop.name}</strong>
                <br>
                <span style="font-size: 11px; color: #6B7280;">
                    ${index === 0 ? '🚀 نقطه شروع' : index === stopsData.length - 1 ? '🏁 مقصد' : '📍 ایستگاه'}
                    ${stop.type === 'home' ? '🏠 منزل' : stop.type === 'school' ? '🏫 مدرسه' : ''}
                </span>
                <br>
                <span style="font-size: 12px; color: #4F46E5; font-weight: 600;">
                    ⏱ ${Math.floor(Math.random() * 5) + 1} دقیقه
                </span>
            </div>
        `;
        
        const marker = L.marker(stop.coords, { icon })
            .addTo(map)
            .bindPopup(popupContent, {
                maxWidth: 200,
                className: 'custom-popup'
            });
        
        // Add click animation
        marker.on('click', function() {
            const el = this._icon;
            if (el) {
                el.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    el.style.transform = 'scale(1)';
                }, 300);
            }
        });
        
        markers.push(marker);
    });
}

// ============================================
// ADD VEHICLE
// ============================================
function addVehicle(startPosition) {
    if (!map) return;
    
    // Remove existing vehicle
    if (vehicleMarker) {
        map.removeLayer(vehicleMarker);
    }
    
    const vehicleIcon = L.divIcon({
        html: `<div style="
            background: linear-gradient(135deg, #4F46E5, #7C3AED);
            color: white;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            border: 3px solid white;
            box-shadow: 0 4px 24px rgba(79, 70, 229, 0.5);
            animation: pulse-glow 2s infinite;
            transition: all 0.3s ease;
        ">${MAP_CONFIG.vehicleIcon}</div>`,
        className: 'vehicle-marker',
        iconSize: [48, 48],
        iconAnchor: [24, 24]
    });
    
    vehicleMarker = L.marker(startPosition, { icon })
        .addTo(map)
        .bindPopup(`
            <div style="text-align: center; padding: 8px;">
                <div style="font-size: 32px;">🚌</div>
                <strong>سرویس در حال حرکت</strong>
                <br>
                <span style="font-size: 12px; color: #6B7280;">
                    ⏱ ${MOCK_ROUTES.north.eta}
                </span>
                <br>
                <span style="font-size: 12px; color: #10B981;">
                    🟢 وضعیت: فعال
                </span>
            </div>
        `, {
            maxWidth: 200,
            className: 'custom-popup'
        });
}

// ============================================
// SIMULATE VEHICLE MOVEMENT
// ============================================
function startSimulation(coordinates) {
    if (simulationInterval) {
        clearInterval(simulationInterval);
    }
    
    if (!vehicleMarker) return;
    
    let currentIndex = 0;
    let progress = 0;
    const totalPoints = coordinates.length;
    
    simulationInterval = setInterval(() => {
        if (!vehicleMarker) return;
        
        // Move to next point
        progress += 0.015;
        if (progress >= 1) {
            progress = 0;
            currentIndex = (currentIndex + 1) % (totalPoints - 1);
            
            // Loop back to start
            if (currentIndex === 0) {
                currentIndex = 0;
                progress = 0;
            }
        }
        
        const current = coordinates[currentIndex];
        const next = coordinates[Math.min(currentIndex + 1, totalPoints - 1)];
        
        const lat = current[0] + (next[0] - current[0]) * progress;
        const lng = current[1] + (next[1] - current[1]) * progress;
        
        vehicleMarker.setLatLng([lat, lng]);
        
        // Update ETA and speed randomly
        updateDynamicInfo();
        
    }, 600);
}

// ============================================
// UPDATE DYNAMIC INFO
// ============================================
function updateDynamicInfo() {
    const etaElement = document.getElementById('etaTime');
    const speedElement = document.getElementById('speedDisplay');
    const statusElement = document.querySelector('.map-status .status-text');
    
    if (etaElement) {
        const times = ['۳ دقیقه تا رسیدن', '۵ دقیقه تا رسیدن', '۷ دقیقه تا رسیدن', '۹ دقیقه تا رسیدن'];
        etaElement.textContent = times[Math.floor(Math.random() * times.length)];
    }
    
    if (speedElement) {
        const speeds = ['۳۵ km/h', '۴۲ km/h', '۲۸ km/h', '۴۸ km/h', '۳۰ km/h'];
        speedElement.textContent = speeds[Math.floor(Math.random() * speeds.length)];
    }
    
    if (statusElement) {
        const statuses = ['در حال حرکت', 'نزدیک به ایستگاه', 'در مسیر', 'به مقصد نزدیک می‌شود'];
        statusElement.textContent = statuses[Math.floor(Math.random() * statuses.length)];
    }
}

// ============================================
// UPDATE INFO PANEL
// ============================================
function updateInfoPanel(route) {
    const driverName = document.querySelector('.driver-info h4');
    const driverRole = document.querySelector('.driver-info p');
    const vehicleInfo = document.querySelector('.detail-item:first-child span');
    const etaInfo = document.querySelector('.detail-item:nth-child(2) span');
    const speedInfo = document.querySelector('.detail-item:last-child span');
    
    if (driverName) driverName.textContent = 'علی رضایی';
    if (driverRole) driverRole.textContent = 'راننده';
    if (vehicleInfo) vehicleInfo.textContent = 'سمند — ۱۲۳۴۵ ایران ۱۱';
    if (etaInfo) etaInfo.textContent = route.eta || '۸ دقیقه تا رسیدن';
    if (speedInfo) speedInfo.textContent = route.speed || '۳۵ km/h';
}

// ============================================
// ADD MAP CONTROLS
// ============================================
function addMapControls() {
    if (!map) return;
    
    // Custom control for fullscreen
    const fullscreenControl = L.Control.extend({
        options: {
            position: 'topleft'
        },
        onAdd: function() {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            container.innerHTML = `
                <button onclick="toggleFullscreen()" style="
                    width: 34px;
                    height: 34px;
                    border: none;
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    cursor: pointer;
                    font-size: 18px;
                    border-radius: 4px;
                    transition: all 0.3s ease;
                ">
                    <i class="fas fa-expand"></i>
                </button>
            `;
            return container;
        }
    });
    
    map.addControl(new fullscreenControl());
    
    // Custom control for recenter
    const recenterControl = L.Control.extend({
        options: {
            position: 'topleft'
        },
        onAdd: function() {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            container.innerHTML = `
                <button onclick="recenterMap()" style="
                    width: 34px;
                    height: 34px;
                    border: none;
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    cursor: pointer;
                    font-size: 18px;
                    border-radius: 4px;
                    transition: all 0.3s ease;
                    margin-top: 4px;
                ">
                    <i class="fas fa-crosshairs"></i>
                </button>
            `;
            return container;
        }
    });
    
    map.addControl(new recenterControl());
}

// ============================================
// MAP UTILITY FUNCTIONS
// ============================================
function toggleFullscreen() {
    const container = document.querySelector('.map-container');
    if (!container) return;
    
    if (!document.fullscreenElement) {
        container.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function recenterMap() {
    if (!map || routeCoordinates.length === 0) return;
    map.fitBounds(routeCoordinates, { padding: [50, 50] });
}

function stopSimulation() {
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }
}

function resumeSimulation() {
    if (!simulationInterval && vehicleMarker && routeCoordinates.length > 0) {
        startSimulation(routeCoordinates);
    }
}

function cleanupMap() {
    stopSimulation();
    if (map) {
        map.remove();
        map = null;
    }
    vehicleMarker = null;
    markers = [];
    isMapReady = false;
}

// ============================================
// ROUTE SWITCHER
// ============================================
function switchRoute(routeId) {
    stopSimulation();
    loadRoute(routeId);
    if (map && routeCoordinates.length > 0) {
        map.fitBounds(routeCoordinates, { padding: [50, 50] });
    }
    showToast(`مسیر "${MOCK_ROUTES[routeId]?.name || routeId}" بارگذاری شد`, 'success');
}

// ============================================
// EXPOSE GLOBALS
// ============================================
window.initMap = initMap;
window.switchRoute = switchRoute;
window.recenterMap = recenterMap;
window.toggleFullscreen = toggleFullscreen;
window.stopSimulation = stopSimulation;
window.resumeSimulation = resumeSimulation;
window.cleanupMap = cleanupMap;
window.MAP_CONFIG = MAP_CONFIG;
window.MOCK_ROUTES = MOCK_ROUTES;

// ============================================
// AUTO INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Wait for Leaflet to load
    if (typeof L !== 'undefined') {
        const mapContainer = document.getElementById('liveMap');
        if (mapContainer) {
            setTimeout(() => {
                initMap('liveMap', 'north');
            }, 500);
        }
        
        const driverMapContainer = document.getElementById('driverRouteMap');
        if (driverMapContainer) {
            setTimeout(() => {
                initMap('driverRouteMap', 'north');
            }, 500);
        }
    }
});

// Add custom styles for map
const mapStyles = document.createElement('style');
mapStyles.textContent = `
    .custom-popup .leaflet-popup-content-wrapper {
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        border: 1px solid var(--glass-border);
        font-family: 'Vazirmatn', sans-serif;
    }
    .custom-popup .leaflet-popup-tip {
        background: var(--glass-bg);
    }
    .leaflet-control-zoom a {
        background: var(--bg-secondary) !important;
        color: var(--text-primary) !important;
        font-family: 'Vazirmatn', sans-serif !important;
    }
    .leaflet-control-zoom a:hover {
        background: var(--hover-bg) !important;
    }
    .leaflet-touch .leaflet-control-zoom {
        border: 1px solid var(--border-color) !important;
        border-radius: 8px !important;
        overflow: hidden;
        background: var(--glass-bg) !important;
        backdrop-filter: blur(10px) !important;
    }
    .leaflet-touch .leaflet-control-zoom a {
        border-color: var(--border-color) !important;
    }
    .route-label {
        background: transparent !important;
        border: none !important;
    }
    .vehicle-marker {
        z-index: 1000 !important;
    }
    .stop-marker {
        z-index: 100 !important;
    }
`;
document.head.appendChild(mapStyles);