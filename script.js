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
            L.marker([lat, lng]).addTo(map).bindPopup(`Ubicación Actual: ${address}`).openPopup();
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
        addMarker(loc.lat, loc.lng, loc.date, loc.address);
        addTableRow(loc, index);
    });
}

function addMarker(lat, lng, date, address) {
    const marker = L.marker([lat, lng]).addTo(map).bindPopup(`Guardada: ${date} - ${address}`);
    markers.push(marker);
}

function addTableRow(loc, index) {
    const tbody = document.querySelector('#historial tbody');
    const row = tbody.insertRow();
    row.insertCell(0).textContent = loc.date;
    row.insertCell(1).textContent = loc.address;
    const deleteCell = row.insertCell(2);
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.className = 'delete-btn';
    deleteBtn.onclick = function() {
        deleteLocation(index);
    };
    deleteCell.appendChild(deleteBtn);
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
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const address = await getAddress(lat, lng);
        const date = new Date().toLocaleString();
        const loc = { lat, lng, date, address };
        locations.push(loc);
        localStorage.setItem('locations', JSON.stringify(locations));
        addMarker(lat, lng, date, address);
        addTableRow(loc, locations.length - 1);
    } catch (e) {
        alert('Error obteniendo ubicación');
    }
});

function deleteLocation(index) {
    map.removeLayer(markers[index]);
    markers.splice(index, 1);
    locations.splice(index, 1);
    localStorage.setItem('locations', JSON.stringify(locations));
    loadHistory(); // Reload table
}