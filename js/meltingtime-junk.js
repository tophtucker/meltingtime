//from http://javascript.about.com/library/bldayyear.htm, of all places
Date.prototype.getDOY = function() {
	var onejan = new Date(this.getFullYear(),0,1);
	return Math.ceil((this - onejan) / 86400000);
}
	
Date.prototype.getSidereal = function(j2kDate, longitude) {
	
	// Greenwich mean sidereal time
	// from http://stackoverflow.com/questions/257717/position-of-the-sun-given-time-of-day-and-lat-long
	var gmst = 6.697375 + .0657098242 * j2kDate; // + this.getDayFraction()/24 + 0.5
		gmst = gmst % 24;
	//console.log("GMST 1: " + gmst);
	
	// from http://aa.usno.navy.mil/faq/docs/GAST.php; doesn't seem to work?
	/* var gmst2 = 18.697374558 + 24.06570982441908 * j2kDate; // + this.getDayFraction()/24 + 0.5 // +(4/24)+0.5 //???
		gmst2 = gmst2 % 24;
	console.log("GMST 2: " + gmst2); */
	
	// Local mean sidereal time
	// appears to work with gmst-long even though long was already negative for boston and i thought that was right...
	//console.log("Longitude in hours: " + (longitude / (360/24)));
	var lmst = gmst + (longitude / (360/24)); //converting longitude from degrees (out of 360) to hours (out of 24)
		lmst = lmst % 24;
		//lmst = lmst * 15 * (Math.PI/180);
	
	//console.log("LMST: " + lmst);
	
	return lmst;
}

function getSolarElevation(latitude, longitude)
{
	
	// first get ecliptic mean longitude and mean anomaly
	// adapted from R: http://stackoverflow.com/a/258106/120290
	// http://en.wikipedia.org/wiki/Position_of_the_Sun
	// http://en.wikipedia.org/wiki/Solar_zenith_angle
	
	var degToRad = Math.PI/180;
	
	var today = new Date();
	var julianDate		= today.getJulian();
	var j2kDate 		= julianDate - 2451545; // epoch: noon, 1 January 2000
	var siderealTime	= today.getSidereal(j2kDate, longitude); // local mean sidereal time
	
	//console.log("Julian date: " + julianDate);
	//console.log("J2K date: " + j2kDate);
	//console.log("siderealTime: " + siderealTime);
	/*
	var eclipticMeanLongitude = 280.460 + .9856474 * j2kDate;
	eclipticMeanLongitude = eclipticMeanLongitude % 360;
	
	var eclipticMeanAnomaly = 357.528 + .9856003 * j2kDate;
	eclipticMeanAnomaly = eclipticMeanAnomaly % 360;
	
	var eclipticLongitude = eclipticMeanLongitude + 1.915*Math.sin(degToRad*eclipticMeanAnomaly) + 0.020*Math.sin(degToRad*2*eclipticMeanAnomaly);
	eclipticLongitude = eclipticLongitude % 360;
	
	var rightAscension 	= Math.asin(Math.cos(degToRad*-23.44)*Math.tan(degToRad*eclipticLongitude));
	var declination 	= Math.asin(Math.sin(degToRad*-23.44)*Math.sin(degToRad*eclipticLongitude));
	
	var hourAngle = siderealTime - rightAscension;
	
	var elevation = Math.asin(Math.sin(declination) * sin(degToRad*latitude) + cos(declination) * Math.cos(degToRad*latitude) * Math.cos(hourAngle));
	var azimuth = Math.asin(-Math.cos(declination) * sin(hourAngle) / cos(elevation));*/
	
	return true;
}