document.addEventListener('DOMContentLoaded', function() {
    const parcelForm = document.getElementById('parcel-form');
    const trackParcelForm = document.getElementById('track-parcel-form');

    parcelForm.addEventListener('submit', submitParcel);
    trackParcelForm.addEventListener('submit', trackParcel);
});

// Submit parcel
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

        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        alert('Success: ' + data.message);
        event.target.reset();
    } catch (error) {
        console.error('Submission error:', error);
        alert('Failed: ' + error.message);
    }
}

// Track parcel
async function trackParcel(event) {
    event.preventDefault();
    const trackingNumber = document.getElementById('tracking-number').value.trim();

    try {
        const response = await fetch(`https://parcel-delivery-system-zzsz.onrender.com/track-parcel/${trackingNumber}`);
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        displayParcelData(data);
    } catch (error) {
        console.error('Tracking error:', error);
        alert('Tracking failed: ' + error.message);
    }
}

// ✅ Show parcel data
function displayParcelData(data) {
    const result = `
      Parcel ID: ${data.id}\n
      Name: ${data.name}\n
      Description: ${data.description || 'N/A'}
    `;
    alert(result);
}
