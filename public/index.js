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
    	console.log(selectedBusiness);
			placeId = selectedBusiness.place_id;
			console.log(placeId);
    });
};

function autoFillForm(jsonObj, ref) {
	document.getElementById('name').value = jsonObj.result.name;
	document.getElementById('address').value = jsonObj.result.formatted_address;
	document.getElementById('phone').value = jsonObj.result.formatted_phone_number;
	document.getElementById('webUrl').value = jsonObj.result.website;
	document.getElementById('photoLink').value = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${ref}&key=${googleApiKey}`;
} 





function getPlaceDetails(query) {
	const settings = {
		url: 'https://maps.googleapis.com/maps/api/place/details/json',
		data: {
			placeid: query,
			// fields: 'address_component,name,photo,place_id,type,url',
			key: googleApiKey
		},
		dataType: 'json',
		type: 'GET',
		success: function(data) {
			console.log(data);
			let photoRef = data.result.photos[0].photo_reference;
			autoFillForm(data, photoRef);
		}
	}
	$.ajax(settings);
}

// function getPlacePhoto(ref) {
// 	const settings = {
// 		url: 'https://maps.googleapis.com/maps/api/place/photo',
// 		data: {
// 			key: googleApiKey,
// 			maxwidth: 400,
// 			photoreference: ref
// 		},
// 		type: 'GET',
// 		success: function(link) {
// 			console.log(link);
// 			document.getElementById('photoLink').value = link;
// 		}
// 	}
// 	$.ajax(settings);
// }


// submit

(function () {
	$('#search-form').submit(e => {
		e.preventDefault();
		getPlaceDetails(placeId);
	})	
})();


























