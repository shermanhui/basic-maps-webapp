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
var markers = [];

var Location = function(data){
	var self = this;
	this.name = ko.observable(data.name);
	this.lat = ko.observable(data.lat);
	this.lng = ko.observable(data.lng);
	this.marker = ko.observable();
};

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 49.2844, lng: -123.1089},
		zoom: 15
	});
}

function viewModel(){
	var self = this;
	this.locationsList = ko.observableArray();
	this.searchList = ko.observableArray(self.locationsList.slice(0));
	this.filter = ko.observable('');

	locationData.forEach(function(place){
		self.locationsList.push(new Location(place));
	});

	this.locationsList().forEach(function(place){
		marker = new google.maps.Marker({
			position: new google.maps.LatLng(place.lat(), place.lng()),
			map: map,
			title: place.name()
		});

		place.marker = marker;
		markers.push(marker);

		google.maps.event.addListener(marker, 'click', (function(marker, place) {
			return function() {
				infowindow.setContent(place.name());
				infowindow.open(map, marker);
			};
		})(marker, place));
	});

	this.searchFilter = ko.computed(function(){
		var filter = self.filter().toLowerCase();
		if (!filter){
			return self.locationsList();
		} else {
			return ko.utils.arrayFilter(self.locationsList(), function(place){
				return place.name().toLowerCase().indexOf(filter) !== -1;
			});
		}
	}, viewModel);

}
initMap();

ko.applyBindings(new viewModel());


