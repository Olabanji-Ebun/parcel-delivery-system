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

    fetch('http://localhost:3000/register-parcel', {
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
    .then(response => response.json())
    .then(data => {
        alert(data.message || 'Error registering parcel');
        if (data.message) {
            parcelForm.reset();
        }else {
            alert('Error registering parcel');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to submit parcel');
    });
}

function trackParcel(event) {
    event.preventDefault();

    const trackingNumber = document.getElementById('tracking-number').value.trim();

    fetch(`http://localhost:3000/track-parcel/${trackingNumber}`)
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
            } else {
                alert(`Parcel Found:\nID: ${data.id}\nName: ${data.name}\nDescription: ${data.description}`);
            }
            trackParcelForm.reset();
        })
        .catch(error => console.error('Error:', error));
}