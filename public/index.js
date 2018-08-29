const googleApiKey = 'AIzaSyDaTY5FdfkJgHZpvxf9OwEdN6bRlgeS7TY';

//------------------------------------------------------------
//GoogleMaps API
//------------------------------------------------------------

let selectedBusiness;
let placeId;
let photoref;

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
	document.getElementById('photoLink').value = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${photoRef}&key=${googleApiKey}`;
}

function getPlaceDetails(query) {
	console.log(query);
	const service = new google.maps.places.PlacesService(document.querySelector('body').appendChild(document.createElement('div')));
	service.getDetails({
    	placeId: query
  	}, function (place, status) {
  		let googlePhoto = place.photos[0].getUrl({'maxWidth': 600, 'maxHeight': 600});
  		photoRef = googlePhoto.split('?1s')[1].split('&')[0];
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


























