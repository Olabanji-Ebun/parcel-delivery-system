document.addEventListener('DOMContentLoaded', function() {
    const parcelForm = document.getElementById('parcel-form');
    const trackParcelForm = document.getElementById('track-parcel-form');

    parcelForm.addEventListener('submit', submitParcel);
    trackParcelForm.addEventListener('submit', trackParcel);
    
    // Test server connection on page load
    testServerConnection();
});

// Test server connection
async function testServerConnection() {
    try {
        console.log('Testing server connection...');
        const response = await fetch('https://parcel-backend.onrender.com/health');
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
        console.log('Submitting parcel...');
        const formData = {
            name: document.getElementById('parcel-name').value.trim(),
            description: document.getElementById('parcel-description').value.trim()
        };
        console.log('Form data:', formData);

        const response = await fetch('https://parcel-backend.onrender.com/register-parcel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error response:', errorText);
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Success response:', data);
        alert('Success: Parcel registered successfully! Your parcel ID is: ' + data.parcelId);
        event.target.reset();  // Reset the form after successful submission
    } catch (error) {
        console.error('Submission error details:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            alert('Network error: Unable to connect to the server. Please check your internet connection and try again.');
        } else {
            alert('Failed: ' + error.message);
        }
    }
}

// Track parcel
async function trackParcel(event) {
    event.preventDefault();
    const trackingNumber = document.getElementById('tracking-number').value.trim();

    try {
        console.log('Tracking parcel with ID:', trackingNumber);
        const response = await fetch(`https://parcel-backend.onrender.com/track-parcel/${trackingNumber}`);
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error response:', errorText);
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Tracking response:', data);
        displayParcelData(data);
    } catch (error) {
        console.error('Tracking error details:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            alert('Network error: Unable to connect to the server. Please check your internet connection and try again.');
        } else {
            alert('Tracking failed: ' + error.message);
        }
    }
}

// ✅ Show parcel data
function displayParcelData(data) {
    const result = `
      Parcel ID: ${data.id}\n
      Name: ${data.name}\n
      Description: ${data.description || 'N/A'}\n
      Status: ${data.status || 'Unknown'}
    `;
    alert(result);
}
