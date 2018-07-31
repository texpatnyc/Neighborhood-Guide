// Maps API Key = AIzaSyDaTY5FdfkJgHZpvxf9OwEdN6bRlgeS7TY

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
    	console.log(selectedBusiness);
			autoFillForm(selectedBusiness);
			placeId = selectedBusiness.place_id;
			console.log(placeId);
    });
};

function autoFillForm(jsonObj) {
	document.getElementById('name').value = jsonObj.name;
	document.getElementById('building').value = jsonObj.address_components[0].short_name;
	document.getElementById('street').value = jsonObj.address_components[1].short_name;
	document.getElementById('borough').value = jsonObj.address_components[2].short_name;
	document.getElementById('zipCode').value = jsonObj.address_components[7].short_name;
} 





function getPlaceDetails(query) {
	const settings = {
		url: 'https://maps.googleapis.com/maps/api/place/details/json',
		data: {
			placeid: query,
			// fields: 'address_component,name,photo,place_id,type,url',
			key: 'AIzaSyDaTY5FdfkJgHZpvxf9OwEdN6bRlgeS7TY'
		},
		dataType: 'json',
		type: 'GET',
		success: function(data) {
			console.log(data);
			let photoRef = data.result.photos[0].photo_reference;
			console.log(photoRef) 
		}
	}
	$.ajax(settings);
}

// function getPlacePhoto(ref) {
// 	const settings = {
// 		url: 'https://maps.googleapis.com/maps/api/place/photo',
// 		data: {
// 			key = 'AIzaSyDaTY5FdfkJgHZpvxf9OwEdN6bRlgeS7TY',
// 			maxwidth = 400,
// 			photoreference = 
// 		}
// 	}
// }


// submit

(function () {
	$('#search-form').submit(e => {
		e.preventDefault();
		getPlaceDetails(placeId);
	})	
})();


























