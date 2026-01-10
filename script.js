const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://parcel-backend.onrender.com';

document.addEventListener('DOMContentLoaded', function() {
    const parcelForm = document.getElementById('parcel-form');
    const trackParcelForm = document.getElementById('track-parcel-form');
    const refreshButton = document.getElementById('refresh-parcels');

    if (parcelForm) parcelForm.addEventListener('submit', submitParcel);
    if (trackParcelForm) trackParcelForm.addEventListener('submit', trackParcel);
    if (refreshButton) refreshButton.addEventListener('click', loadParcels);

    // Load parcels on page load
    loadParcels();
    
    // Test server connection on page load
    testServerConnection();
});

function showMessage(message, type = 'info') {
    const container = document.getElementById('message-container');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    msgDiv.textContent = message;

    // Basic styling for the message
    msgDiv.style.padding = '10px';
    msgDiv.style.margin = '10px 0';
    msgDiv.style.borderRadius = '5px';
    if (type === 'error') {
        msgDiv.style.backgroundColor = '#ffcccc';
        msgDiv.style.color = '#cc0000';
    } else if (type === 'success') {
        msgDiv.style.backgroundColor = '#ccffcc';
        msgDiv.style.color = '#006600';
    } else {
        msgDiv.style.backgroundColor = '#e6f7ff';
        msgDiv.style.color = '#0066cc';
    }

    container.appendChild(msgDiv);

    // Remove after 5 seconds
    setTimeout(() => {
        msgDiv.remove();
    }, 5000);
}

// Test server connection
async function testServerConnection() {
    try {
        console.log('Testing server connection to:', API_URL);
        const response = await fetch(`${API_URL}/health`);
        console.log('Server health check response:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Server is healthy:', data);
        } else {
            console.warn('Server health check failed:', response.status);
        }
    } catch (error) {
        console.error('Server connection test failed:', error);
        console.error('This might indicate the server is not running or there are network issues.');
    }
}

// Submit parcel
async function submitParcel(event) {
    event.preventDefault();

    try {
        const formData = {
            name: document.getElementById('parcel-name').value.trim(),
            description: document.getElementById('parcel-description').value.trim()
        };

        const response = await fetch(`${API_URL}/register-parcel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        showMessage(`Success: Parcel registered! ID: ${data.parcelId}`, 'success');
        event.target.reset();
        loadParcels(); // Reload the list
    } catch (error) {
        console.error('Submission error:', error);
        showMessage('Failed: ' + error.message, 'error');
    }
}

// Track parcel
async function trackParcel(event) {
    event.preventDefault();
    const trackingNumber = document.getElementById('tracking-number').value.trim();
    if (!trackingNumber) {
        showMessage('Please enter a tracking number', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/track-parcel/${trackingNumber}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(response.status === 404 ? 'Parcel not found' : `Server error: ${response.status}`);
        }
        
        const data = await response.json();
        displayParcelData(data);
    } catch (error) {
        showMessage('Tracking failed: ' + error.message, 'error');
    }
}

// Show parcel data
function displayParcelData(data) {
    const result = `
      Parcel ID: ${data.id}
      Name: ${data.name}
      Description: ${data.description || 'N/A'}
      Status: ${data.status || 'Unknown'}
    `;
    alert(result); // Keeping alert for the specific track request as it was before, or we could use a modal.
}

// Load all parcels
async function loadParcels() {
    const listContainer = document.getElementById('parcels-list');
    listContainer.innerHTML = '<p>Loading...</p>';

    try {
        const response = await fetch(`${API_URL}/parcels`);
        if (!response.ok) throw new Error('Failed to load parcels');

        const parcels = await response.json();

        if (parcels.length === 0) {
            listContainer.innerHTML = '<p>No parcels found.</p>';
            return;
        }

        let html = '<table class="parcel-table"><thead><tr><th>ID</th><th>Name</th><th>Status</th><th>Actions</th></tr></thead><tbody>';

        parcels.forEach(parcel => {
            html += `
                <tr>
                    <td>${parcel.id}</td>
                    <td>${parcel.name}</td>
                    <td>${parcel.status}</td>
                    <td>
                        <button onclick="updateStatus(${parcel.id}, 'delivered')">Mark Delivered</button>
                        <button onclick="deleteParcel(${parcel.id})" class="delete-btn">Delete</button>
                    </td>
                </tr>
            `;
        });
        html += '</tbody></table>';
        listContainer.innerHTML = html;
    } catch (error) {
        console.error('Load error:', error);
        listContainer.innerHTML = '<p style="color:red">Error loading parcels. Is the server running?</p>';
    }
}

// Update status
window.updateStatus = async function(id, status) {
    try {
        const response = await fetch(`${API_URL}/parcels/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });

        if (!response.ok) throw new Error('Failed to update status');

        showMessage('Status updated successfully', 'success');
        loadParcels();
    } catch (error) {
        showMessage('Update failed: ' + error.message, 'error');
    }
};

// Delete parcel
window.deleteParcel = async function(id) {
    if (!confirm('Are you sure you want to delete this parcel?')) return;

    try {
        const response = await fetch(`${API_URL}/parcels/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete parcel');

        showMessage('Parcel deleted successfully', 'success');
        loadParcels();
    } catch (error) {
        showMessage('Delete failed: ' + error.message, 'error');
    }
};
