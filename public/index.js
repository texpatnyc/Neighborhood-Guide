// Maps API Key = AIzaSyDaTY5FdfkJgHZpvxf9OwEdN6bRlgeS7TY

//------------------------------------------------------------
//GoogleMaps API
//------------------------------------------------------------

function activatePlacesSearch() {
    const input = document.getElementById('search-term');
    const options = {
    	types: ['establishment'],
    	// location: google.maps.LatLng(40.4332, 73.592),
    	// radius: 5000,
    	// strictbounds: true
    };
    let autocomplete = new google.maps.places.Autocomplete(input, options);
};