// TO DO:
// Filter map markers on search or link listview search to marker search
// Link API data to original hard coded locations i.e address and contact for now
//
var map, marker;
var infowindow = new google.maps.InfoWindow();
var locationData = [
	{
		name: "The Lamplighter",
		lat: 49.283846,
		lng: -123.106120
	},{
		name: "The Pint",
		lat: 49.281399,
		lng: -123.107622
	},{
		name: "Six Acres",
		lat: 49.283388,
		lng: -123.104271
	}
];
//var markers = [];

//make a Location, data to be used for markers and list view
var Location = function(data){
	var self = this;
	this.name = data.name;
	this.lat = data.lat;
	this.lng = data.lng;
	this.address = "";
	this.contact = "";
	this.marker = "";
	this.isVisible = ko.observable(true);

	this.contentString = contentInfo(data);
};

// function to make infoWindow content
var contentInfo = function(data){
	var contentString =
		'<div id="content">'+
		'<div id="siteNotice">'+
		'</div>'+
		'<h1 id="firstHeading" class="firstHeading">'+ data.name +'</h1>'+
		'<div id="bodyContent">'+
		'<p><b>Address and Contact</b></p>'+
		'<p>'+ data.address + ' '+ data.contact + '</p>' +
		'</div>'+
		'</div>';
	return contentString;
}

// function to initialize map
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 49.2844, lng: -123.1089},
		zoom: 15
	});
}

function viewModel(){
	var self = this;
	var CLIENT_ID = 'Q0A4REVEI2V22KG4IS14LYKMMSRQTVSC2R54Y3DQSMN1ZRHZ';
	var CLIENT_SECRET = 'NPWADVEQHB54FWUKETIZQJB5M2CRTPGRTSRICLZEQDYMI2JI';
	var fsURL = 'https://api.foursquare.com/v2/venues/search'+
						'?near=Vancouver,BC'+
						'&categoryId=4bf58dd8d48988d116941735'+
						'&client_id='+CLIENT_ID+
						'&client_secret='+CLIENT_SECRET+
						'&v=20150825';

	this.locationsList = ko.observableArray();
	this.markers = ko.observableArray();
	this.filter = ko.observable(''); 	// the filter for search bar

	// uses hardcoded location data to make an observable array of Locations
	locationData.forEach(function(place){
		self.locationsList.push(new Location(place));
	});

	// for each Location plant a marker at the given lat,lng and on click show the info window
	this.locationsList().forEach(function(place){
		marker = new google.maps.Marker({
			position: new google.maps.LatLng(place.lat, place.lng),
			map: map,
			title: place.name
		});

		place.marker = marker;
		self.markers.push(place.marker);

		google.maps.event.addListener(marker, 'click', (function(marker, place) {
			return function() {
				infowindow.setContent(place.contentString);
				infowindow.open(map, marker);
			};
		})(marker, place));
	});

	console.log(self.markers());
	this.show = function(){

	}

	// search functionality for list view
	this.searchFilter = ko.computed(function(){
		var filter = self.filter().toLowerCase();
		if (!filter){
			return self.locationsList();
		} else {
			return ko.utils.arrayFilter(self.locationsList(), function(place){
				for (var i = 0; i < self.markers().length; i++){
					if (self.markers()[i].title.toLowerCase().indexOf(filter) !== -1){
						self.markers()[i].setVisible(true)
					} else {
						self.markers()[i].setVisible(false);
					}
				}
				return place.name.toLowerCase().indexOf(filter) !== -1;
			});
		}
	});
	console.log(self.markers()[1].title);
	console.log(self.locationsList()[0].name, self.locationsList()[1].name, self.locationsList()[2].name);

	// ajax call for FourSquare API data, currently just logs the whole thing
	$.ajax(fsURL,{
		dataType: 'json',
		type: 'GET'
	}).done(function(data){
		var response = data.response.venues;
		// response.forEach(function(response){
		// 	console.log(response.name);
		// 	console.log(response.location.address);
		// })
	});

}
// initialize the map
initMap();

// bind KO
ko.applyBindings(new viewModel());