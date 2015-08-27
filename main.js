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
	}
}

function viewModel(){
	var self = this;
	this.locationsList = ko.observableArray(locations);
	this.filter = ko.observable('');

	this.filteredItems = ko.computed(function(){
		var filter = self.filter().toLowerCase();
		console.log(filter);
		return ko.utils.arrayFilter(self.locationsList(), function(locations){
			return locations.name.toLowerCase().indexOf(filter) >= 0;
		})
	}, viewModel);


}
initMap();

ko.applyBindings(new viewModel());


