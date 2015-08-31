var CLIENT_ID = 'Q0A4REVEI2V22KG4IS14LYKMMSRQTVSC2R54Y3DQSMN1ZRHZ';
var CLIENT_SECRET = 'NPWADVEQHB54FWUKETIZQJB5M2CRTPGRTSRICLZEQDYMI2JI';
var fourSquare_URL = 'https://api.foursquare.com/v2/venues/search?near=Vancouver,BC&categoryId=4bf58dd8d48988d116941735&client_id='+CLIENT_ID+'&client_secret='+CLIENT_SECRET+'&v=20150825';

var locationData = [
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
	this.name = data.name;
	this.lat = data.lat;
	this.lng = data.lng;
	this.address = data.address;
	this.rating = data.rating;

};



		$.ajax({
			url: fourSquare_URL,
			dataType: 'json',
            success: function(data){
            	cb(data);
            	//self.locationsList.push(new Location(place));
            },
            error: function(data){
            	console.log('boo');
            }
        })

        var cb = function(data){
        	var venue = data.response.groups[0].items[0].venue
			place.address = venue.location.formattedAddress[0];
			place.rating = venue.rating;
        }