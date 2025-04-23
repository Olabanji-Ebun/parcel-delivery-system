document.addEventListener('DOMContentLoaded', function() {
    const parcelForm = document.getElementById('parcel-form');
    const trackParcelForm = document.getElementById('track-parcel-form');

    parcelForm.addEventListener('submit', submitParcel);
    trackParcelForm.addEventListener('submit', trackParcel);
});

function submitParcel(event) {
    event.preventDefault();

    const parcelForm = document.getElementById('parcel-form');
    const parcelID = document.getElementById('parcel-id').value.trim();
    const parcelName = document.getElementById('parcel-name').value.trim();
    const parcelDescription = document.getElementById('parcel-description').value.trim();

    // CORRECTED ENDPOINT: Added '/register-parcel'
    fetch('https://parcel-delivery-system-zzsz.onrender.com/register-parcel', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: parcelID,
            name: parcelName,
            description: parcelDescription
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        alert(data.message || 'Parcel registered successfully!');
        parcelForm.reset();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to submit parcel. Please try again.');
    });
}

function trackParcel(event) {
    event.preventDefault();
    const trackParcelForm = document.getElementById('track-parcel-form');
    const trackingNumber = document.getElementById('tracking-number').value.trim();

    // CORRECTED ENDPOINT: Already correct, but added error handling
    fetch(`https://parcel-delivery-system-zzsz.onrender.com/track-parcel/${trackingNumber}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Parcel not found or server error');
            }
            return response.json();
        })
        .then(data => {
            if (data.id) {  // Check for actual parcel data
                alert(`Parcel Found:\nID: ${data.id}\nName: ${data.name}\nDescription: ${data.description}`);
            } else {
                alert(data.message || 'No parcel data received');
            }
            trackParcelForm.reset();
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message || 'Failed to track parcel');
        });
}