// TO DO:
// Be able to click link in list view to open InfoWindow
// Close InfoWindow on search
// Be able to use user defined Location to populate list
// List must empty out on new search
//
var map, marker;
var infowindow = new google.maps.InfoWindow();
var locationData = []; //empty array to store data

//make a Location, data to be used for markers and list view
var Location = function(data){
	var self = this;
	this.name = ko.observable(data.name);
	this.lat = ko.observable(data.lat);
	this.lng = ko.observable(data.lng);
	this.address = ko.observable(data.address);
	this.rating = ko.observable(data.rating);

	this.contentString = // create content string for infoWindow
		'<div id="content">'+
		'<div id="siteNotice">'+
		'</div>'+
		'<h1 id="firstHeading" class="firstHeading">'+ self.name() +'</h1>'+
		'<div id="bodyContent">'+
		'<p><b>Address and Rating</b></p>'+
		'<p>'+ self.address() + ', '+ self.rating() + '</p>' +
		'</div>'+
		'</div>';
};

// function to initialize Google map
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
	$.ajax({
		url: 'https://api.foursquare.com/v2/venues/explore?',
		dataType: 'json',
		data: 'limit=5&near=' + 'Vancouver,BC' +
			'&categoryId=4d4b7105d754a06376d81259' +
			'&client_id=' + CLIENT_ID +
			'&client_secret=' + CLIENT_SECRET +
			'&v=20150806&m=foursquare',
		success: function(fsData){
			var response = fsData.response.groups[0].items;
			for (var i = 0; i < response.length; i++) {
					var venue = response[i].venue;
					var venueName = venue.name;
					var venueLoc = venue.location;
					var venueRating = venue.rating;
					var obj = {
						name: venueName,
						lat: venueLoc.lat,
						lng: venueLoc.lng,
						address: venueLoc.formattedAddress[0],
						rating: venueRating
					};
				locationData.push(obj);
				console.log(locationData);
			}
			self.cb(locationData);
		}
	});
	this.locationsList = ko.observableArray(); // list to keep track of Locations
	this.markers = ko.observableArray(); // list of markers
	this.filter = ko.observable(''); 	// the filter for search bar

	// uses hardcoded location data to make an observable array of Locations

	this.cb = function(locationData){ //takes FS data and for each location in locations list, adds the address and rating for that location
		locationData.forEach(function(place){
			self.locationsList.push(new Location(place));
		});
		self.makeMarkers();
	};

	this.makeMarkers = function(){
		// for each Location plant a marker at the given lat,lng and on click show the info window
		self.locationsList().forEach(function(place){
			marker = new google.maps.Marker({
				position: new google.maps.LatLng(place.lat(), place.lng()),
				map: map,
				title: place.name()
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
	};

	console.log(self.locationsList());
	this.setMarker = function(){
		for (var i = 0; i < self.markers().length; i++){
			self.markers()[i].setVisible(true);
		}
	};
	// filters out list and markers
	this.searchFilter = ko.computed(function(){
		var filter = self.filter().toLowerCase();
		if (!filter){ // if false return the list as normal
			self.setMarker();
			return self.locationsList();
		} else {
			return ko.utils.arrayFilter(self.locationsList(), function(place){
				for (var i = 0; i < self.markers().length; i++){ // for every marker if the title of the marker matches the filter set markers to visible
					if (self.markers()[i].title.toLowerCase().indexOf(filter) !== -1){
						self.markers()[i].setVisible(true);
					} else { // everything else, set it to false
						self.markers()[i].setVisible(false);
					}
				}
				return place.name().toLowerCase().indexOf(filter) !== -1; // returns matched list names
			});
		}
	});
}
// initialize the map
initMap();

// bind KO
var viewModel = new viewModel();
ko.applyBindings(viewModel);