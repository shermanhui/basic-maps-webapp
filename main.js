// TO DO:
// Close InfoWindow on search - not working
// List empties out on search, but markers still persist! :(
// Allow user to create a "route" for pub crawl - Add ability to set start/end position to avoid duplication in directions panel
// Style Project
// Stop route maker from making duplicate routes

var map, marker, bounds, directionsService, directionsDisplay;
var infoWindow = new google.maps.InfoWindow();

var CLIENT_ID = 'Q0A4REVEI2V22KG4IS14LYKMMSRQTVSC2R54Y3DQSMN1ZRHZ';
var CLIENT_SECRET = 'NPWADVEQHB54FWUKETIZQJB5M2CRTPGRTSRICLZEQDYMI2JI';
var BAR_ID = '4bf58dd8d48988d116941735';
var DIVEBAR_ID = '4bf58dd8d48988d118941735'; // currently unused
var PUB_ID = '4bf58dd8d48988d11b941735';
var BREWERY_ID = '50327c8591d4c4b30a586d5d';

var locationData = []; //empty array to store data

//make a Location, data to be used for markers and list view
var Location = function(data){
	var self = this;
	this.name = ko.observable(data.name);
	this.lat = ko.observable(data.lat);
	this.lng = ko.observable(data.lng);
	this.address = ko.observable(data.address);
	this.rating = ko.observable(data.rating);
	this.marker = ko.observableArray(data.marker);
	// this.latlng = ko.observable(new google.maps.LatLng(data.lat, data.lng));
	// this.marker = new google.maps.Marker({
	// 	position: self.latlng(),
	// 	map: map,
	// 	title: self.name()
	// });
	// bounds.extend(self.latlng());

	this.contentString = // create content string for infoWindow
		'<div id="content">'+
		'<div id="siteNotice">'+
		'</div>'+
		'<h1 id="firstHeading" class="firstHeading">'+ self.name() +'</h1>'+
		'<div id="bodyContent">'+
		'<p><b>Address and Rating</b></p>'+
		'<p>'+ self.address() + ', Rating: '+ self.rating() + '</p>' +
		'</div>'+
		'</div>';
};

// function to initialize Google map
function initMap() {
	bounds = new google.maps.LatLngBounds();
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 49.2844, lng: -123.1089},
		zoom: 15
	});

	google.maps.event.addDomListener(window, "resize", function() {	// browser resize triggers map resize for responsiveness
		var center = map.getCenter();
		google.maps.event.trigger(map, "resize");
		map.setCenter(center);
	});

	// adds search bars and list view onto map
	map.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById('global-search'));
	map.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById('search-bar'));
	map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(document.getElementById('list'));
}

function viewModel(){
	var self = this;
	this.locationsList = ko.observableArray(); // list to keep track of Locations
	this.markers = ko.observableArray(); // list of markers
	this.crawlList = ko.observableArray(); // list of user selected venues
	this.filter = ko.observable(''); 	// the filter for search bar
	this.locInput = ko.observable('Vancouver, BC');  // user defined location input

	this.loadLocations = function(location){ // takes a user defined location; Vancouver, BC to start with
		$.ajax({
			url: 'https://api.foursquare.com/v2/venues/explore?',
			dataType: 'json',
			data: 'limit=30&near=' + location +
				'&categoryId=' + BAR_ID +
				',' + PUB_ID +
				',' + BREWERY_ID +
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
							address: venueLoc.address,
							rating: venueRating
						};
					locationData.push(obj);
				}
				self.initialize(); // callback function to populate locationData with FSdata
			},
			error: function(error){
				alert('There was an error: ' + error);
			}
		});
	};

	this.clearData = function(){
		locationData.length = 0;
		self.locationsList.removeAll();
		self.crawlList.removeAll();
		self.markers.removeAll(); // this doesn't do anything right now...Intended use is to remove all markers from the map
	};

	this.searchLocations = ko.computed(function(){ // not sure if i'm using this right.."undefined is logged"
		var location = self.locInput().toLowerCase();
		self.clearData();
		self.loadLocations(location);
	});

	this.initialize = function(){ //takes FS data and for each location in locations list, builds a Location object to be pushed into self.locationsList()
		locationData.forEach(function(place){
			self.locationsList.push(new Location(place));
		});
		self.makeMarkers(); // calls function that makes markers on map
	};

	this.makeMarkers = function(){
		// for each Location plant a marker at the given lat,lng and on click show the info window
		self.locationsList().forEach(function(place){
			var myLatLng = new google.maps.LatLng(place.lat(), place.lng());
			marker = new google.maps.Marker({
				position: myLatLng,
				map: map,
				title: place.name()
			});
			bounds.extend(myLatLng); // extends map bounds to make markers fit on map
			place.marker = marker; // makes a marker property for each place
			self.markers.push(place.marker); // pushes a marker into the array of markers to be tracked on search

			google.maps.event.addListener(marker, 'click', (function(marker, place) {
				return function() {
					infoWindow.setContent(place.contentString);
					infoWindow.open(map, marker);
				};
			})(marker, place));
			map.fitBounds(bounds);
		});
	};

	this.openFromList = function(place){ // takes in the relevant Location Object
		var listItem = place.name(); // pulls the Location name from clicked list item
		var len = self.markers().length;
		for (var i = 0; i < len; i++){
			if (listItem === self.markers()[i].title){ // If the clicked list item's name matches a relevant marker, then we display the infoWindow
				map.panTo(self.markers()[i].position); // pans to marker
				map.setZoom(15);
				infoWindow.setContent(place.contentString);
				infoWindow.open(map, self.markers()[i]);
			}
		}
	};

	this.addToRoute = function(place){ // takes in a location object and adds it to crawlList so user can create a route
		if (!($.inArray(place, self.crawlList()) > -1)){  // checks for duplicate locations
			self.crawlList.push(place);
		} else {
			alert('duplicate');
		}
	};

	this.removeFromRoute = function(place){ // removes location from list
		if ($.inArray(place, self.crawlList()) > -1){  // checks for duplicate locations
			self.crawlList.remove(place);
		} else {
			alert('Nothing to Remove');
		}
	};

	this.calculateAndDisplayRoute = function(directionsService, directionsDisplay){
		directionsService = new google.maps.DirectionsService();
		directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});

		var waypoints = [];
		for (var i = 0; i < self.crawlList().length; i++){
			var venueLat = self.crawlList()[i].lat(); // takes each added location's latlng to be added into waypoints
			var venueLng = self.crawlList()[i].lng();
			waypoints.push({
				location: {lat: venueLat, lng: venueLng},
				stopover: true
			});
			console.log(waypoints);
		}

		directionsService.route({
			origin: waypoints[0].location,// sets origin as first way point, this is causing the directions panel bug
			destination: waypoints[waypoints.length - 1].location, // set last waypoint as destination, causing duplicate location on directions panel
			waypoints: waypoints,
			optimizeWaypoints: false,
			travelMode: google.maps.TravelMode.WALKING
		}, function(response, status){
			if (status === google.maps.DirectionsStatus.OK){
				directionsDisplay.setDirections(response);
				var route = response.routes[0];
				console.log(response);
			} else {
				alert('Directions request failed due to ' + status);
			}
		});

		directionsDisplay.setMap(map);
		directionsDisplay.setPanel(document.getElementById('directions-panel'));
	};

	this.makeRoute = function(directionsService, directionsDisplay){
		self.calculateAndDisplayRoute(directionsService, directionsDisplay);
	};

	this.setMarker = function(){ // for each marker in the list set it to be visible
		for (var i = 0; i < self.markers().length; i++){
			self.markers()[i].setVisible(true);
		}
	};

	// filters out list and markers
	this.searchFilter = ko.computed(function(){
		var filter = self.filter().toLowerCase();
		if (!filter){ // if false return the list as normal
			self.setMarker();
			infoWindow.close();
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