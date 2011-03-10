$(function () {
	
});

var map, geocoder;

function initialize() {
	var myLatlng = new google.maps.LatLng(31.353637, -4.21875, true),
		myOptions = {
			zoom: 2,
			center: myLatlng,
			mapTypeId: google.maps.MapTypeId.TERRAIN
		};
	map = new google.maps.Map(document.getElementById("map"), myOptions);
	
	// Try W3C Geolocation (Preferred)
	if (navigator.geolocation) {
		browserSupportFlag = true;
		navigator.geolocation.getCurrentPosition(function (position) {
			initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude, true);
			var marker = new google.maps.Marker({
				position: initialLocation, 
				map: map,
				title:"You"
			});
		}, function () {
			handleNoGeolocation(browserSupportFlag);
		});
	// Try Google Gears Geolocation
	} else if (google.gears) {
		browserSupportFlag = true;
		var geo = google.gears.factory.create('beta.geolocation');
		geo.getCurrentPosition(function (position) {
			initialLocation = new google.maps.LatLng(position.latitude, position.longitude, true);
			var marker = new google.maps.Marker({
				position: initialLocation, 
				map: map,
				title:"You"
			});
		}, function () {
			handleNoGeoLocation(browserSupportFlag);
		});
		// Browser doesn't support Geolocation
	} else {
		browserSupportFlag = false;
		handleNoGeolocation(browserSupportFlag);
	}
	
	function handleNoGeolocation(errorFlag) {
		if (errorFlag == true) {
			alert("Geolocation service failed.");
			initialLocation = newyork;
		} else {
			alert("Your browser doesn't support geolocation. We've placed you in Siberia.");
			initialLocation = siberia;
		}
		map.setCenter(initialLocation);
	}
}

var friends, 
	friendsWithHometown = ['test'];

function getAddresses(friendsWithHometown, i) {
	geocoder.geocode( { 'address': friendsWithHometown[i].hometown}, function (results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			var marker = new google.maps.Marker({
				map: map,
				position: results[0].geometry.location,
				title: friendsWithHometown[i].name + ', ' + friendsWithHometown[i].hometown,
				icon: 'https://graph.facebook.com/' + friendsWithHometown[i].id + '/picture?type=square'
			});
		} else {
			console.error("Geocode for " + friendsWithHometown[i].name + " was not successful for the following reason: " + status);
		}
	});
	
	setTimeout(function () { getAddresses(friendsWithHometown, i + 1); }, 1000);
}

function decorate() {
	FB.api('/me', function (response) {
		geocoder = new google.maps.Geocoder();
		geocoder.geocode( { 'address': response.hometown.name}, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				var marker = new google.maps.Marker({
					map: map,
					position: results[0].geometry.location,
					title: response.hometown.name,
					icon: 'http://hipsterjazzbo.com/extras/whereto/icons/home.png'
				});
			} else {
				console.error("Geocode was not successful for the following reason: " + status);
			}
		});
				
		FB.api('/me/friends', function (response) {
			friends = response;
			console.info(friends);
			$.each(friends.data, function (index, value) {
				FB.api(this.id, function (response) {
					if (response.hometown) {
						friendsWithHometown.push({
							name: friends.data[index].name,
							id: friends.data[index].id,
							hometown: response.hometown.name
						});
					}
				});
			});
			
			console.info(friendsWithHometown);
			getAddresses(friendsWithHometown, 0);
		});
	});
}