var map, marker;
var infowindow = new google.maps.InfoWindow;
var locations = [
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
var markers = [];

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 49.2844, lng: -123.1089},
		zoom: 15
	});
	for (var i = 0; i < locations.length; i++){
		marker = new google.maps.Marker({
			position: new google.maps.LatLng(locations[i].lat, locations[i].lng),
			map: map,
			title: locations[i].name
		});
		google.maps.event.addListener(marker, 'click', (function(marker, i) {
			return function() {
				infowindow.setContent(locations[i].name);
				infowindow.open(map, marker);
			}
		})(marker, i));
		markers.push(marker);
	}
}

function viewModel(){
	var self = this;
	this.locationsList = ko.observableArray(locations.slice(0));
	this.filter = ko.observable('');

	this.search = function(value) {
		for (var i in markers){
			markers[i].setMap(null);
		}
		self.locationsList.removeAll();
		for(i in locations) {
			if (locations[i].name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
				self.locationsList.push(locations[i]);
				markers[i].setMap(map);
			} else {
				// space for failed search message
			}
		}
	};
	// this.filteredItems = ko.computed(function(){
	// 	var filter = self.filter().toLowerCase();
	// 	console.log(filter);
	// 	return ko.utils.arrayFilter(self.locationsList(), function(locations){
	// 		return locations.name.toLowerCase().indexOf(filter) >= 0;
	// 	})
	// }, viewModel);
	this.filter.subscribe(this.search);
}
initMap();

ko.applyBindings(new viewModel());


