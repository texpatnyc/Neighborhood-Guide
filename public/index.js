const googleApiKey = 'AIzaSyDaTY5FdfkJgHZpvxf9OwEdN6bRlgeS7TY';

//------------------------------------------------------------
//GoogleMaps API
//------------------------------------------------------------

let selectedBusiness;
let placeId;

function activatePlacesSearch() {
    const input = document.getElementById('search-term');
    const options = {
    	types: ['establishment'],
    	// location: google.maps.LatLng(40.4332, 73.592),
    	// radius: 5000,
    	// strictbounds: true
    };
    let autocomplete = new google.maps.places.Autocomplete(input, options);
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
  		const selectedBusiness = autocomplete.getPlace();
		placeId = selectedBusiness.place_id;
    });
};

function autoFillForm(jsonObj) {
	document.getElementById('name').value = jsonObj.name;
	document.getElementById('address').value = jsonObj.formatted_address;
	document.getElementById('phone').value = jsonObj.formatted_phone_number;
	document.getElementById('webUrl').value = jsonObj.website;
	document.getElementById('photoLink').value = jsonObj.photos[0].getUrl({'maxWidth': 600, 'maxHeight': 600});
}

function getPlaceDetails(query) {
	console.log(query);
	const service = new google.maps.places.PlacesService(document.querySelector('body').appendChild(document.createElement('div')));
	service.getDetails({
    	placeId: query
  	}, function (place, status) {
	autoFillForm(place);
  });
}


// submit

(function () {
	$('.search-form').submit(e => {
		e.preventDefault();
		getPlaceDetails(placeId);
	})	
})();


























