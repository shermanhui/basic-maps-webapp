// TO DO:
// Link API data to original hard coded locations i.e address and contact for now
// Be able to use user defined Location to populate list
var map, marker;
var infowindow = new google.maps.InfoWindow();
var locationData = [ // hardcoded locations for testing
	{
		name: "The Lamplighter",
		lat: 49.283846,
		lng: -123.106120,
		address: '',
		rating: ''
	},{
		name: "The Pint",
		lat: 49.281399,
		lng: -123.107622,
		address: '',
		rating: ''
	},{
		name: "Six Acres",
		lat: 49.283388,
		lng: -123.104271,
		address: '',
		rating: ''
	}
];

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
		//'<p>'+ self.address() + ', '+ self.rating() + '</p>' +
		'</div>'+
		'</div>';
};

// // function to make infoWindow content
// var contentInfo = function(data){
// 	var contentString =
// 		'<div id="content">'+
// 		'<div id="siteNotice">'+
// 		'</div>'+
// 		'<h1 id="firstHeading" class="firstHeading">'+ data.name +'</h1>'+
// 		'<div id="bodyContent">'+
// 		'<p><b>Address and Rating</b></p>'+
// 		'<p>'+ data.address + ', '+ data.rating + '</p>' +
// 		'</div>'+
// 		'</div>';
// 	return contentString;
// }

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

	this.locationsList = ko.observableArray(); // list to keep track of Locations
	this.markers = ko.observableArray(); // list of markers
	this.filter = ko.observable(''); 	// the filter for search bar

	// uses hardcoded location data to make an observable array of Locations
	locationData.forEach(function(place){
		// $.ajax({
		// 	url: 'https://api.foursquare.com/v2/venues/explore?',
		// 	dataType: 'json',
		// 	data: 'limit=1&ll=' + place.lat +
		// 		',' + place.lng +
		// 		'&query=' + place.name +
		// 		'&client_id=' + CLIENT_ID +
		// 		'&client_secret=' + CLIENT_SECRET +
		// 		'&v=20150806&m=foursquare',
		// 	success: function(data){ // I want to update the hardcoded locations with FS data about their address and rating, then eventually all data regarding the top 10 spots for a certain type of venue
		// 		cb(data);
		// 		//self.locationsList.push(new Location(place));
		// 	},
		// 	error: function(data){
		// 		console.log('boo');
		// 	}
		// });
		// function cb(data){
		// 	var venue = data.response.groups[0].items[0].venue;
		// 	place.address = venue.location.formattedAddress[0];
		// 	place.rating = venue.rating;
		// 	console.log(place);
		// 	$('#bodyContent').append('HI');
		// 	console.log($('#bodyContent'));
		// 	//console.log(self.locationsList()[0].address(), self.locationsList()[0].rating());
		// 	//self.locationsList.push(new Location(place));
		// 	//console.log(self.locationsList()); // cb is called three times b/c there's three locationData

		// 	//return self.locationsList();
		// }
		self.locationsList.push(new Location(place));
	});

	function cb(data){ //takes FS data and for each location in locations list, adds the address and rating for that location
		var venue = data.response.groups[0].items[0].venue;
		var address = venue.location.formattedAddress[0];
		var rating = venue.rating;

		$('#bodyContent').append('<p>'+ address + ', FourSquare rating: ' + rating + '</p>'); // problem here is that there is a delay when populating the info! :(
		console.log($('#bodyContent'));
	}

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
				$.ajax({
					url: 'https://api.foursquare.com/v2/venues/explore?',
					dataType: 'json',
					data: 'limit=1&ll=' + place.lat() +
						',' + place.lng() +
						'&query=' + place.name() +
						'&client_id=' + CLIENT_ID +
						'&client_secret=' + CLIENT_SECRET +
						'&v=20150806&m=foursquare',
					success: function(data){ // I want to update the hardcoded locations with FS data about their address and rating, then eventually all data regarding the top 10 spots for a certain type of venue
						cb(data); // callback to set up infoWindow with FS data, problem is I want it to populate in my locationsData for reuse and eventually for nonhardcoded data
					},
					error: function(data){
						console.log('boo');
					}
				});
				infowindow.setContent(place.contentString);
				infowindow.open(map, marker);
			};
		})(marker, place));
	});

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
	//console.log(self.markers()[1].title, self.markers()[1].visible);
	console.log(self.markers());
	console.log(self.locationsList());
	console.log(self.locationsList()[0].name(), self.locationsList()[0].address(), self.locationsList()[0].rating());
}
// initialize the map
initMap();

// bind KO
ko.applyBindings(new viewModel());