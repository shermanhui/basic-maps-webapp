// TO DO FILTER MAP MARKERS
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

var Location = function(data){
	var self = this;
	this.name = ko.observable(data.name);
	this.lat = ko.observable(data.lat);
	this.lng = ko.observable(data.lng);
	this.address = ko.observable();
	this.contact = ko.observable();
	this.marker = ko.observable();

	this.contentString = contentInfo(data);
};

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
		self.markers.push(place.marker);

		google.maps.event.addListener(marker, 'click', (function(marker, place) {
			return function() {
				infowindow.setContent(place.contentString);
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
	});

	$.ajax(fsURL,{
		dataType: 'json',
		type: 'GET'
	}).done(function(data){
		var response = data.response.venues;
		console.log(response);
	});

}
initMap();

ko.applyBindings(new viewModel());


