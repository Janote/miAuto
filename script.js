let map;
let markers = [];
let locations = JSON.parse(localStorage.getItem('locations')) || [];

document.addEventListener('DOMContentLoaded', function() {
    initMap();
    loadHistory();
});

function initMap() {
    map = L.map('map').setView([0, 0], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Get current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            map.setView([lat, lng], 13);
            const address = await getAddress(lat, lng);
            addMarker(lat, lng, 'Actual', address, true, -1);
        });
    }
}

async function getAddress(lat, lng) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        const data = await response.json();
        const addr = data.address;
        const houseNumber = addr.house_number || '';
        const road = addr.road || '';
        return `${houseNumber} ${road}`.trim() || 'Ubicación desconocida';
    } catch (e) {
        return 'Error obteniendo dirección';
    }
}

function loadHistory() {
    const tbody = document.querySelector('#historial tbody');
    tbody.innerHTML = '';
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    locations.forEach((loc, index) => {
        addMarker(loc.lat, loc.lng, loc.date, loc.address, false, index);
        addTableRow(loc, index);
    });
}

function addMarker(lat, lng, date, address, isCurrent, index) {
    let marker;
    if (isCurrent) {
        marker = L.marker([lat, lng]).addTo(map).bindPopup(`Ubicación Actual: ${address}`).openPopup();
    } else {
        const icon = L.divIcon({
            html: `<div style="background: #667eea; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid #4c5fd5;">${index + 1}</div>`,
            className: 'custom-marker',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
        marker = L.marker([lat, lng], { icon }).addTo(map).bindPopup(`Guardada: ${date} - ${address}`);
    }
    markers.push(marker);
}

function addTableRow(loc, index) {
    const tbody = document.querySelector('#historial tbody');
    const row = tbody.insertRow();
    row.insertCell(0).textContent = loc.date;
    const addressCell = row.insertCell(1);
    addressCell.textContent = loc.address;
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.className = 'delete-btn';
    deleteBtn.onclick = function() {
        deleteLocation(index);
    };
    addressCell.appendChild(deleteBtn);
}

document.getElementById('guardarUbicacion').addEventListener('click', async function() {
    if (!navigator.geolocation) {
        alert('Geolocalización no soportada');
        return;
    }
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        const lat = Math.round(position.coords.latitude * 10000) / 10000;
        const lng = Math.round(position.coords.longitude * 10000) / 10000;
        const now = new Date();
        const recentLocation = locations.find(loc => {
            const locDate = new Date(loc.date);
            const timeDiff = (now - locDate) / (1000 * 60); // minutes
            return Math.round(loc.lat * 10000) / 10000 === lat && Math.round(loc.lng * 10000) / 10000 === lng && timeDiff < 10;
        });
        if (recentLocation) {
            showMessage('Esta ubicación ya ha sido seleccionada');
            return;
        }
        const address = await getAddress(lat, lng);
        const date = now.toLocaleString();
        const loc = { lat, lng, date, address };
        locations.push(loc);
        localStorage.setItem('locations', JSON.stringify(locations));
        addMarker(lat, lng, date, address, false, locations.length - 1);
        addTableRow(loc, locations.length - 1);
    } catch (e) {
        alert('Error obteniendo ubicación');
    }
});

function showMessage(text) {
    const message = document.createElement('div');
    message.id = 'message';
    message.textContent = text;
    document.body.appendChild(message);
    setTimeout(() => {
        document.body.removeChild(message);
    }, 3000);
}

function deleteLocation(index) {
    map.removeLayer(markers[index]);
    markers.splice(index, 1);
    locations.splice(index, 1);
    localStorage.setItem('locations', JSON.stringify(locations));
    loadHistory(); // Reload table
}