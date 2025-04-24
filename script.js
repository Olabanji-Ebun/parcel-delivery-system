document.addEventListener('DOMContentLoaded', function() {
    const parcelForm = document.getElementById('parcel-form');
    const trackParcelForm = document.getElementById('track-parcel-form');

    parcelForm.addEventListener('submit', submitParcel);
    trackParcelForm.addEventListener('submit', trackParcel);
});

// For submission
async function submitParcel(event) {
    event.preventDefault();
    
    try {
        const response = await fetch('https://parcel-delivery-system-zzsz.onrender.com/register-parcel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: document.getElementById('parcel-id').value.trim(),
                name: document.getElementById('parcel-name').value.trim(),
                description: document.getElementById('parcel-description').value.trim()
            })
        });
  
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to register parcel');
        }
        const data = await response.json();
        alert('Success: ' + data.message);
        event.target.reset();
    } catch (error) {
        console.error('Submission error:', error);
        alert('Failed to register parcel: ' + error.message);
    }
}

// For tracking
async function trackParcel(event) {
    event.preventDefault();
    const trackingNumber = document.getElementById('tracking-number').value.trim();
    const resultDiv = document.getElementById('tracking-result');
    resultDiv.innerHTML = 'Loading...';

    try {
        const response = await fetch(`https://parcel-delivery-system-zzsz.onrender.com/track-parcel/${trackingNumber}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to track parcel');
        }
        const data = await response.json();
        if (data.message) {
            resultDiv.innerHTML = `<p>${data.message}</p>`;
        } else {
            resultDiv.innerHTML = `
                <p><strong>Parcel Found:</strong></p>
                <p>ID: ${data.id}</p>
                <p>Name: ${data.name}</p>
                <p>Description: ${data.description || 'N/A'}</p>
            `;
        }
    } catch (error) {
        console.error('Tracking error:', error);
        resultDiv.innerHTML = `<p>Tracking failed: ${error.message}</p>`;
    }
}