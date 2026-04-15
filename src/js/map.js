import L from 'leaflet';

const MAP_STYLES = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap contributors',
    maxZoom: 17
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 20
  }
};

const registry = new Map();

function sanitizeStyle(style) {
  return Object.prototype.hasOwnProperty.call(MAP_STYLES, style) ? style : 'street';
}

function ensureMap(id, center, zoom) {
  const host = document.getElementById(id);
  if (!host) {
    const previous = registry.get(id);
    if (previous) {
      previous.map.remove();
      registry.delete(id);
    }
    return null;
  }

  let entry = registry.get(id);
  if (entry && entry.map.getContainer() !== host) {
    entry.map.remove();
    registry.delete(id);
    entry = null;
  }

  if (!entry) {
    const map = L.map(host, {
      zoomControl: true,
      attributionControl: true
    }).setView(center, zoom);

    entry = {
      map,
      styleKey: null,
      tileLayer: null,
      featureLayer: L.layerGroup().addTo(map),
      hasUserViewControl: false,
      hasAutoFramed: false
    };

    map.on('movestart zoomstart', (event) => {
      if (event?.originalEvent) {
        entry.hasUserViewControl = true;
      }
    });

    registry.set(id, entry);
  }

  return entry;
}

function applyStyle(entry, styleKey) {
  if (entry.styleKey === styleKey) {
    return;
  }

  if (entry.tileLayer) {
    entry.map.removeLayer(entry.tileLayer);
  }

  const style = MAP_STYLES[styleKey];
  entry.tileLayer = L.tileLayer(style.url, {
    attribution: style.attribution,
    maxZoom: style.maxZoom
  }).addTo(entry.map);
  entry.styleKey = styleKey;
}

function extractUserPoint(state) {
  const lat = Number(state?.userLocation?.lat);
  const lng = Number(state?.userLocation?.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return [lat, lng];
  }
  return [13.1294, 123.7462];
}

function extractCenterPoints(state) {
  return (state?.data?.centers || [])
    .filter((center) => Number.isFinite(center?.lat) && Number.isFinite(center?.lng))
    .map((center) => ({
      name: center.name,
      status: center.status,
      point: [center.lat, center.lng]
    }));
}

function extractSosPoints(state) {
  return (state?.sosLog || [])
    .filter((entry) => Number.isFinite(entry?.lat) && Number.isFinite(entry?.lng))
    .map((entry) => ({
      at: entry.at,
      name: entry.name || 'Resident',
      method: entry.method || 'SMS',
      status: entry.status || 'Active',
      message: entry.message || 'No message',
      point: [entry.lat, entry.lng]
    }));
}

function renderUserRouteMap(styleKey, state) {
  const user = extractUserPoint(state);
  const entry = ensureMap('user-route-map', user, 14);
  if (!entry) {
    return;
  }

  applyStyle(entry, styleKey);
  entry.featureLayer.clearLayers();

  const centers = extractCenterPoints(state);
  const nearestName = state?.routeRecommendation?.center?.name;
  const nearestCenter = centers.find((center) => center.name === nearestName) || centers[0] || null;
  const fallbackCenter = centers.find((center) => center.name !== nearestCenter?.name) || nearestCenter;
  const zoneA = [14.1338, 123.7443];
  const zoneB = [14.1375, 123.7365];

  if (nearestCenter) {
    const routeTarget = L.latLng(nearestCenter.point[0], nearestCenter.point[1]);
    const userPoint = L.latLng(user[0], user[1]);
    const lineTarget = userPoint.distanceTo(routeTarget) < 35 && fallbackCenter ? fallbackCenter.point : nearestCenter.point;

    L.polyline([user, lineTarget], {
      color: '#0ea5e9',
      weight: 5,
      opacity: 0.9,
      dashArray: '8,6'
    }).addTo(entry.featureLayer);

    if (!entry.hasUserViewControl || !entry.hasAutoFramed) {
      const bounds = L.latLngBounds([user, lineTarget]);
      entry.map.fitBounds(bounds.pad(0.35), { animate: false });
      entry.hasAutoFramed = true;
    }
  }

  L.circleMarker(user, {
    radius: 8,
    color: '#ffffff',
    weight: 2,
    fillColor: '#0ea5e9',
    fillOpacity: 1
  }).bindPopup('Your GPS location').addTo(entry.featureLayer);

  centers.forEach((center) => {
    const isNearest = nearestCenter?.name === center.name;
    L.circleMarker(center.point, {
      radius: 8,
      color: '#ffffff',
      weight: 2,
      fillColor: '#10b981',
      fillOpacity: 1
    })
      .bindPopup(`${center.name}${isNearest ? ' (Nearest)' : ''} | ${center.status}`)
      .addTo(entry.featureLayer);
  });

  [zoneA, zoneB].forEach((point) => {
    L.circleMarker(point, {
      radius: 8,
      color: '#ffffff',
      weight: 2,
      fillColor: '#ef4444',
      fillOpacity: 1
    }).bindPopup('Flood danger zone').addTo(entry.featureLayer);
  });
}

function renderAdminIncidentMap(styleKey, state) {
  const user = extractUserPoint(state);
  const entry = ensureMap('admin-incident-map', user, 13);
  if (!entry) {
    return;
  }

  applyStyle(entry, styleKey);
  if (!entry.hasAutoFramed) {
    entry.map.setView(user, 13, { animate: false });
    entry.hasAutoFramed = true;
  }
  entry.featureLayer.clearLayers();

  const sosPins = extractSosPoints(state);
  const users = sosPins.length
    ? sosPins.map((pin) => pin.point)
    : [
        user,
        [14.1288, 123.7441]
      ];
  const incidents = [
    [14.1334, 123.7415],
    [14.1372, 123.7489]
  ];
  const centers = extractCenterPoints(state);

  users.forEach((point, index) => {
    const sos = sosPins[index];
    const isSelected = sos && sos.at === state?.selectedSosAt;
    const label = sos
      ? `SOS pin: ${sos.name} | ${sos.method} | ${sos.status}<br>${sos.message}`
      : 'Shared user location';
    const marker = L.circleMarker(point, {
      radius: 7,
      color: '#ffffff',
      weight: 2,
      fillColor: isSelected ? '#f59e0b' : '#0ea5e9',
      fillOpacity: 1
    }).bindPopup(label).addTo(entry.featureLayer);

    if (isSelected) {
      if (entry.lastFocusedSosAt !== sos.at) {
        entry.map.setView(point, 15, { animate: true });
        entry.lastFocusedSosAt = sos.at;
      }
      marker.openPopup();
    }
  });

  incidents.forEach((point) => {
    L.circleMarker(point, {
      radius: 7,
      color: '#ffffff',
      weight: 2,
      fillColor: '#ef4444',
      fillOpacity: 1
    }).bindPopup('Active incident report').addTo(entry.featureLayer);
  });

  centers.forEach((center) => {
    L.circleMarker(center.point, {
      radius: 8,
      color: '#ffffff',
      weight: 2,
      fillColor: '#10b981',
      fillOpacity: 1
    }).bindPopup(`Evacuation center: ${center.name}`).addTo(entry.featureLayer);
  });
}

export function renderMaps(state) {
  const styleKey = sanitizeStyle(state?.mapStyle);
  renderUserRouteMap(styleKey, state);
  renderAdminIncidentMap(styleKey, state);
}
