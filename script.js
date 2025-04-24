document.addEventListener('DOMContentLoaded', function() {
    const parcelForm = document.getElementById('parcel-form');
    const trackParcelForm = document.getElementById('track-parcel-form');

    if (parcelForm) parcelForm.addEventListener('submit', submitParcel);
    if (trackParcelForm) trackParcelForm.addEventListener('submit', trackParcel);
});

// Enhanced submission function
async function submitParcel(event) {
    event.preventDefault();
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        
        const response = await fetch('https://parcel-delivery-system-zzsz.onrender.com/register-parcel', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                id: document.getElementById('parcel-id').value.trim(),
                name: document.getElementById('parcel-name').value.trim(),
                description: document.getElementById('parcel-description').value.trim()
            })
        });
  
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || data.error || 'Failed to register parcel');
        }
        
        alert(`Success! Parcel ID: ${data.parcelId}`);
        event.target.reset();
    } catch (error) {
        console.error('Submission error:', error);
        alert(`Error: ${error.message}`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
}

// Enhanced tracking function
async function trackParcel(event) {
    event.preventDefault();
    const trackingNumber = document.getElementById('tracking-number').value.trim();
    const resultDiv = document.getElementById('tracking-result');
    const trackBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = trackBtn.textContent;
    
    try {
        trackBtn.disabled = true;
        trackBtn.textContent = 'Searching...';
        resultDiv.innerHTML = '<div class="loading">Loading parcel information...</div>';
        
        const response = await fetch(`https://parcel-delivery-system-zzsz.onrender.com/track-parcel/${trackingNumber}`, {
            headers: { 'Accept': 'application/json' }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || data.error || 'Failed to track parcel');
        }
        
        if (data.message && data.message === 'Parcel not found') {
            resultDiv.innerHTML = `
                <div class="not-found">
                    <p>Parcel not found</p>
                    <p>Tracking number: ${trackingNumber}</p>
                    <p>Please verify the number and try again</p>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="parcel-info">
                    <h3>Parcel Details</h3>
                    <p><strong>Tracking Number:</strong> ${data.id}</p>
                    <p><strong>Recipient:</strong> ${data.name}</p>
                    <p><strong>Description:</strong> ${data.description || 'Not provided'}</p>
                    <p class="status">Status: In transit</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Tracking error:', error);
        resultDiv.innerHTML = `
            <div class="error">
                <p>Error tracking parcel</p>
                <p>${error.message}</p>
                <p>Please try again later</p>
            </div>
        `;
    } finally {
        trackBtn.disabled = false;
        trackBtn.textContent = originalBtnText;
    }
}