// TO DO:
// Close InfoWindow on search
// List must empty out on new Location set up
// Allow user to create a "route" for pub crawl
// Style Project

var map, marker, bounds;
var infoWindow = new google.maps.InfoWindow();

var CLIENT_ID = 'Q0A4REVEI2V22KG4IS14LYKMMSRQTVSC2R54Y3DQSMN1ZRHZ';
var CLIENT_SECRET = 'NPWADVEQHB54FWUKETIZQJB5M2CRTPGRTSRICLZEQDYMI2JI';
var BAR_ID = '4bf58dd8d48988d116941735';
var DIVEBAR_ID = '4bf58dd8d48988d118941735';
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

	this.clearData = function(){
		self.markers.removeAll(); // should remove all values and return an empty array
		self.locationsList.removeAll();
	};

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
							address: venueLoc.formattedAddress[0],
							rating: venueRating
						};
					locationData.push(obj);
					//console.log(locationData);
				}
				self.initialize(locationData); // callback function to populate locationData with FSdata
			}
		});
	};

	this.searchLocations = ko.computed(function(){ // not sure if i'm using this right.."undefined is logged"
		var location = self.locInput().toLowerCase();
		self.clearData();
		self.loadLocations(location);
	});

	this.initialize = function(locationData){ //takes FS data and for each location in locations list, builds a Location object to be pushed into self.locationsList()
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
				position: new google.maps.LatLng(place.lat(), place.lng()),
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

	this.openFromList = function(data){ // takes in the relevant Location Object
		var listItem = data.name(); // pulls the Location name from clicked list item
		var len = self.markers().length;
		for (var i = 0; i < len; i++){
			if (listItem === self.markers()[i].title){ // If the clicked list item's name matches a relevant marker, then we display the infoWindow
				map.panTo(self.markers()[i].position); // pans to marker
				infoWindow.setContent(data.contentString);
				infoWindow.open(map, self.markers()[i]);
			}
		}
	};

	this.addToRoute = function(place){
		var selectedVenue = place.name();
		console.log(place);
		if (!($.inArray(selectedVenue, self.crawlList()) > -1)){
			self.crawlList.push(selectedVenue);
		} else {
			alert('duplicate');
		}
		console.log(self.crawlList());
	};

	this.removeFromRoute = function(place){
		var selectedVenue = place.name();
		self.crawlList.remove(selectedVenue);
	};

	this.calculateAndDisplayRoute = function(directionsService, directionsDisplay){
		var directionsService = new google.maps.DirectionsService;
		var directionsDisplay = new google.maps.DirectionsRenderer;

		var waypoints = [];
		for (var i = 0; i < self.crawlList().length; i++){
			waypoints.push({
				location: self.crawlList()[i],
				stopover: true
			});
		}

		directionsService.route({
			origin: self.crawlList()[0],
			destination: self.crawlList()[self.crawlList().length - 1],
			waypoints: waypoints,
			optimizeWaypoints: true,
			travelMode: google.maps.TravelMode.WALKING
		}, function(response, status){
			if (status === google.maps.DirectionsStatus.OK){
				directionsDisplay.setDirections(response);
				var route = response.routes[0];
				var summaryPanel = document.getElementById('directions_panel');
				summaryPanel.innerHTML = '';
				for (var i = 0; i < route.legs.length; i++){
					var routeSegment = i + 1;
					summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
					'</b><br>';
					summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
					summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
					summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
				}
			} else {
				alert('Directions request failed due to' + status);
			}
		});
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
			//console.log(self.locationsList());
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