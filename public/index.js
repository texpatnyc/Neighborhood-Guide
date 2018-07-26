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



$('.nav').on('click', 'a', (e) => {
	e.preventDefault();
	if ($(e.currentTarget).hasClass('restaurantIcon')) {
		fetch('/restaurants')
			.then(console.log)
			.catch(console.error)
	}
	if ($(e.currentTarget).hasClass('nightlifeIcon')) {
		fetch('/nightlife')
			.then(console.log)
			.catch(console.error)
	}
	if ($(e.currentTarget).hasClass('servicesIcon')) {
		fetch('/services')
			.then(console.log)
			.catch(console.error)
	}


})