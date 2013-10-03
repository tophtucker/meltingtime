// / / / / / / / / / / / / //
/////////////////////////////
///// C O N S T A N T S /////
/////////////////////////////
// / / / / / / / / / / / / //

//yeah yeah, i know, API key should be secret... don't steal please! i deserve it, don't I? you vigilante you.
var forecastAPIkey = 'ddfdd44606f4fb476c0c7fec167bf4a0';

var userLat;
var userLong;
var userCity;
var userCountry;
var forecastData;
var temp;

//background native is 1008px x 648px
var bgWidth = 1008;
var bgHeight = 648;
var bgRatio = bgWidth/bgHeight;

//set later
var windowRatio;
var winWidth;
var winHeight;
var bgScale;

// the time the "play" (fast-forward) button is clicked
var playTime;
var playSpeed = 2000;
var playInterval = 1000;

var snowflakes;
var rainstorm;

var flavor = "chocolate";
var scoopSizeDefault = 35;
var scoopSize = scoopSizeDefault;

// / / / / / / / / / / / / //
/////////////////////////////
///// I N T E R F A C E /////
/////////////////////////////
// / / / / / / / / / / / / //

$("#colophon-popover-button").click(function(event) {
	$('#data-popover-button').popover('hide')
});

$("#data-popover-button").click(function(event) {
	$('#colophon-popover-button').popover('hide')
});

$("#flavor button").click(function(event) {
	flavor = event.target.dataset.flavor;
	switch(flavor) {
		case "chocolate":
			var scoopFill="#664422";
			//var scoopStroke="white";
			break;
		case "coffee":
			var scoopFill="tan";
			//var scoopStroke="white";
			break;
		case "vanilla":
			var scoopFill="#f2ebe1";
			//var scoopStroke="white";
			break;
		default:
			//
	}		  
	$("#scoop, .cowspot").css("fill",scoopFill);
	//$("#scoop").css("stroke",scoopStroke);
});

$("#scoopsize button").click(function(event) {
	switch(event.target.dataset.scoopsize) {
		case "small":
			var scoopScale=".7";
			break;
		case "medium":
			var scoopScale="1";
			break;
		case "large":
			var scoopScale="1.2";
			break;
		default:
			//
	}		
	scoopSize = scoopSizeDefault*scoopScale;
	$("#icecream-svg").css("-webkit-transform","scale("+scoopScale+","+scoopScale+")");
	meltingTime();
});

$("#fastforward-button").click(function(event) {
	// ends realtime live updating
	clearInterval(liveUpdateTimer);
	
	// updates svg classes for faster animation
	//$("#Sun").addClass("play");
	//document.getElementById('Sun').setAttributeNS("http://www.w3.org/2000/svg","class","play");
	
	// saves the time the button was clicked	
	playTime = Math.round(new Date().getTime()/1000);
	
	// begins running
	ffUpdateTimer = window.setInterval(function() {
		var timestampNow = Math.round(new Date().getTime()/1000);
		var timeElapsed = timestampNow-playTime;
		var futureTime = playTime + timeElapsed*playSpeed;
		var time = new Date(futureTime*1000);
		updateScene(time);
	}, playInterval);
	
});

$("#play-button").click(function(event) {
	// ends realtime live updating
	clearInterval(ffUpdateTimer);
	updateScene();
	// returns to updating scene every 5 minutes (300000 ms)
	liveUpdateTimer = window.setInterval(updateScene, 300000);
});

function notify(message) {
	$("#notifications").html(message);
	$("#notifications").fadeTo(1000, 1).fadeTo(1000, .3);
}


// / / / / / / / / / / //
/////////////////////////
///// O N   L O A D /////
/////////////////////////
// / / / / / / / / / / //

$(document).ready(function() {
	
	// activate colophon bootstrap popover
	$('#colophon-popover-button').popover({
		'content':$("#colophon-content").html(),
		'html':true
	});

	
	// initialize window variables
	windowRatio = window.innerWidth/window.innerHeight;
	winWidth = window.innerWidth;
	winHeight = window.innerHeight;
	bgScale = bgWidth / winWidth;
	
	//below this width, responsive css takes over (see style.css); no dynamic svg bg :(
	//(it just wasn't working well on iphone and this was easier to sniff... #todo)
	if(winWidth > 480) {
		// load background svg
		$("#background").load("img/background.svg", function() {
		
			//once it's loaded, scale background to fit window
			$("#farmbackground").attr("width",winWidth+"px");
			$("#farmbackground").attr("height",(winWidth/bgRatio)+"px");
			// #TODO: fill vertically if bgRatio > windowRatio 
			// (i.e. if the window is narrower than the background)
				
		});
	}
	
	// load ice cream cone svg
	$("#icecream-container").load("img/icecream.svg");
	
	// get location & forecast; initialize data & do first draw
	getLocation();
	
	// updates scene every 5 minutes (300000 ms)
	liveUpdateTimer = window.setInterval(updateScene, 300000);
	
	// updates location & weather data every 24 hours (86400000 ms)
	dailyUpdateTimer = window.setInterval(getLocation, 86400000);
	
});

function getLocation()
{
	if (navigator.geolocation) 
	{
		navigator.geolocation.getCurrentPosition(function(position) { 
			userLat = position.coords.latitude;
			userLong = position.coords.longitude;
			$(".data-coordinates").html(Math.round(userLat*100)/100 + "º, " + Math.round(userLong*100)/100 + "º");
			
			// fetch forecast from forecast.io api
			getForecast();
		}, function(error) { 
			// if the user denies permission to get location, user random location
			if (error.code == 1) {
				// user said no
				notify("Location permission denied; estimating by IP address."); 
			} else {
				// unknown error
				notify("Can’t get location; estimating by IP address."); 
			}
			getLocationByIP();
			getForecast();
		});
	}
	else 
	{
		// Geolocation is not supported by this browser.
		// Fallback: get address by IP.
		// http://gmaps-samples-v3.googlecode.com/svn/trunk/commonloader/clientlocation.html
		// http://j.maxmind.com/app/geoip.js
		
		notify("Geolocation is not supported by your browser; estimating by IP address."); 
		getLocationByIP();
		getForecast();
	}
}

function getLocationByIP()
{
	if (google.loader.ClientLocation) {
		userLat = google.loader.ClientLocation.latitude;
		userLong = google.loader.ClientLocation.longitude;
		userCity = google.loader.ClientLocation.address.city;
		userCountry = google.loader.ClientLocation.address.country;	
		$(".data-coordinates").html(Math.round(userLat*100)/100 + "º, " + Math.round(userLong*100)/100 + "º");
	} else {
		notify('Unable to find location; using random location.');
		randomizeLocation();
	}
}

function getForecast()
{
	$("h1").html("Getting forecast...");
	
	$.ajax({
		type: "GET",
		url: "https://api.forecast.io/forecast/"+forecastAPIkey+"/"+userLat+","+userLong,
		dataType: 'jsonp',
		success: function(result){
			forecastData = result;
			var time = new Date();
			updateScene(time);
		},
		error: function(XMLHttpRequest, textStatus, errorThrown){
			// #TODO: ERROR HANDLING!
			notify("The forecast could not be retrieved. "+errorThrown+" "+textStatus);
		},
		failure: function(){
			notify("Ahhh help");
		}
	});	
	/*var time = new Date();
	updateScene(time);*/
}

function updateScene(time)
{
	// default to now
	if(typeof time === "undefined") time = new Date();
	$(".data-time").html(time.toLocaleDateString()+" "+time.toLocaleTimeString());
	
	// SUN
	var solarData = getSolarData(userLat, userLong, time);
	setSunPosition(solarData);
	
	// WEATHER
	var weather = getWeather(time);
	if(weather) updateWeather(weather);
	
	// update data popover
	$('#data-popover-button').popover({
		'content':function (){return $("#data-stats").html()},
		'html':true
	});
	$("#data-popover-button").removeClass("disabled");
}


// / / / / / / / / / / //
/////////////////////////
///// W E A T H E R /////
/////////////////////////
// / / / / / / / / / / //

function getWeather(time)
{
	// access forecast result object & return weather object for specified time
	
	/* 
	forecastData object:	
		currently
			weather object
		minutely
			data
				0
				1
				...
				60
					precipitation object (subset of weather object)
		hourly
			data
				0
				1
				...
				48
					weather object
		daily
			data
				0
				1
				...
				7
					weather object* 
						*temperatureMax and temperatureMin but no temperature!
	*/
	
	if(!(typeof forecastData === "undefined")) {
	
		var forecastTimestamp = forecastData.currently.time;
		var timestamp = Math.round(time.getTime()/1000);
		var secondsElapsed = timestamp-forecastTimestamp;
		var minutesElapsed = Math.floor(secondsElapsed/60);
		var hoursElapsed = Math.floor(minutesElapsed/60);
		var daysElapsed = Math.floor(hoursElapsed/24);
		
		// if minutes < cardinality of minutely array (off-by-one errors cancel...)
		if(minutesElapsed < 61) {
			// return forecast for current time
			// NOTE: minutely only has information about precipitation, so currently ignoring
			return forecastData.currently;
		}
		else if(hoursElapsed < 49) {
			// return forecast for hour
			return forecastData.hourly.data[hoursElapsed];
		}
		else if(daysElapsed < 8) {
			// return forecast for day
			// NOTE: the object returned has no temperature attribute! only max and min
			return forecastData.daily.data[daysElapsed];
		}
		else {
			// beyond forecast range
			notify("Beyond forecast range. Just gonna make stuff up.");
			return randomizeWeather();
		}
	
	}
	else {		
		notify("Can't retrieve real weather; making something up instead.");
		return randomizeWeather();	
	}
}

function randomizeWeather()
{
	var fakeWeather = new Object();
	fakeWeather.temperature = Math.random()*100 + 10;
	fakeWeather.cloudCover = Math.random();
	fakeWeather.windSpeed = 100 * Math.random();
	fakeWeather.precipIntensity = 0.4 * Math.random();
	fakeWeather.precipProbability = Math.random();
	fakeWeather.precipType = (Math.random() > 0.5 ? 'rain' : 'snow');
	return fakeWeather;
}

function updateWeather(weather)
{			
	temp = weather.temperature;
	if(typeof weather.temperature === "undefined") temp = (weather.temperatureMin + weather.temperatureMax) / 2;
	
	// Update data popover
	$(".data-temp").html(Math.round(temp));
	$(".data-cloud").html(Math.round(weather.cloudCover*100));
	$(".data-wind").html(Math.round(weather.windSpeed));
	$(".data-precip").html(Math.round(weather.precipIntensity*1000)/1000);
	$(".data-precipprob").html(Math.round(weather.precipProbability*100));						
		
	// HANDLE CLOUD COVER
	// right cloud shows when cloud cover >= 10%
	// left cloud shows when cloud cover >= 30%
	var rightCloudOpacity = (weather.cloudCover >= 0.33 ? .5 : 0);
	var leftCloudOpacity = (weather.cloudCover >= 0.66 ? .5 : 0);
	$("#Right_Cloud").css("opacity",rightCloudOpacity);
	$("#Left_Cloud").css("opacity",leftCloudOpacity);
	// #TODO: MORE CLOUDS!
	
	// HANDLE RAIN
	if(weather.precipIntensity > 0 && weather.precipType == "rain") {
		// precipIntensity of 0.4 is very heavy precipitation
		if(typeof rainstorm === "undefined") rainstorm = new Rainstorm('mainbody','raincloud');
		rainstorm.rainCount(weather.precipProbability*weather.precipIntensity*10000);
	}
	else {
		if(!(typeof rainstorm === "undefined")) rainstorm.rainCount(0);
	}
		
	// HANDLE SNOW
	if(weather.precipIntensity > 0 && weather.precipType == "snow") {
		// precipIntensity of 0.4 is very heavy precipitation
		if(typeof snowflakes === "undefined") snowflakes = new Snowflakes('mainbody','snowcloud');
		snowflakes.snowCount(weather.precipProbability*weather.precipIntensity*10000);
	}
	else {
		if(!(typeof snowflakes === "undefined")) snowflakes.snowCount(0);
	}
	
	meltingTime();
}

////////////////////////////////////
// *  M E L T I N G  T I M E !  * //
// our hypothetical raison d'etre //
////////////////////////////////////
function meltingTime() {
	
	var flavorCoef = '1';
	var typeCoef = '1';
	
	var meltTime = flavorCoef * typeCoef * scoopSize * 71/(temp-10);
	
	var meltTimeDisplay = Math.round(meltTime);
	$("h1").html("Your ice cream will melt in " + meltTimeDisplay + " minutes.");
}


// / / / / / / / / / / / / //
/////////////////////////////
///// E P H E M E R I S /////
/////////////////////////////
// / / / / / / / / / / / / //

function randomizeLocation() {
	//notice that this over-represents high latitudes; not all deg-deg graticule areas are equal
	userLat = Math.random()*180 - 90;
	userLong = Math.random()*360 - 180;
}

Date.prototype.getDayFraction = function() {
	return (this.getHours()+(this.getMinutes()/60)+(this.getSeconds()/3600))/24;
}

Date.prototype.getJulian = function() {
	//confer http://stackoverflow.com/questions/11759992/calculating-jdayjulian-day-in-javascript
	//this commented-out version gives an integer local Julian Date:
	//return Math.floor((this / 86400000) - (this.getTimezoneOffset()/1440) + 2440587.5);
	//this returns a UTC Julian Date with fraction:
	return (this.getTime()/86400000 + 2440587.5);
}

function dayFractionToTimeString(fraction) {
	var date = new Date(2000,1,1); // use any date as base reference
	date.setUTCSeconds(fraction * 86400); // add number of seconds in fractional hours
	return (date.getHours() + ":" + date.getMinutes());
}

function getSolarData(latitude, longitude, time)
{
	// adapted from NOAA calculator http://www.esrl.noaa.gov/gmd/grad/solcalc/calcdetails.html
	//var today = new Date();
	var timeFraction = time.getDayFraction(); //*1000 to speed up time by a thousand
	var timezone = -time.getTimezoneOffset()/60; //js uses odd W-is-+ convention
	var degToRad = Math.PI/180;
	var radToDeg = 1/degToRad;
	
	var julianDay = time.getJulian();
	var julianCentury = (julianDay-2451545)/36525;
	 
	var geomMeanLongSun_deg 	= (280.46646+julianCentury*(36000.76983 + julianCentury*0.0003032)) % 360;
	var geomMeanAnomalySun_deg 	= 357.52911+julianCentury*(35999.05029 - 0.0001537*julianCentury);
	var eccentEarthOrbit 		= 0.016708634-julianCentury*(0.000042037+0.0000001267*julianCentury)
	var sunEqOfCtr 				= Math.sin(degToRad*geomMeanAnomalySun_deg)*(1.914602-julianCentury*(0.004817+0.000014*julianCentury))+Math.sin(degToRad*(2*geomMeanAnomalySun_deg))*(0.019993-0.000101*julianCentury)+Math.sin(degToRad*(3*geomMeanAnomalySun_deg))*0.000289;
	var sunTrueLong_deg 		= geomMeanLongSun_deg+sunEqOfCtr;
	var sunTrueAnom_deg			= geomMeanAnomalySun_deg+sunEqOfCtr;
	var sunRadVector_AUs		= (1.000001018*(1-eccentEarthOrbit*eccentEarthOrbit))/(1+eccentEarthOrbit*Math.cos(degToRad*(sunTrueAnom_deg)));
	var sunAppLong_deg			= sunTrueLong_deg-0.00569-0.00478*Math.sin(degToRad*(125.04-1934.136*julianCentury));
	var meanObliqEcliptic_deg	= 23+(26+((21.448-julianCentury*(46.815+julianCentury*(0.00059-julianCentury*0.001813))))/60)/60;
	var obliqCorr_deg			= meanObliqEcliptic_deg+0.00256*Math.cos(degToRad*(125.04-1934.136*julianCentury));
	var sunRtAscen_deg			= radToDeg*(Math.atan2(Math.cos(degToRad*(obliqCorr_deg))*Math.sin(degToRad*(sunAppLong_deg)),Math.cos(degToRad*(sunAppLong_deg))));
	var sunDeclin_deg			= radToDeg*(Math.asin(Math.sin(degToRad*(obliqCorr_deg))*Math.sin(degToRad*(sunAppLong_deg))));
	var varY					= Math.tan(degToRad*(obliqCorr_deg/2))*Math.tan(degToRad*(obliqCorr_deg/2));
	var eqOfTime_min			= 4*radToDeg*(varY*Math.sin(2*degToRad*(geomMeanLongSun_deg))-2*eccentEarthOrbit*Math.sin(degToRad*(geomMeanAnomalySun_deg))+4*eccentEarthOrbit*varY*Math.sin(degToRad*(geomMeanAnomalySun_deg))*Math.cos(2*degToRad*(geomMeanLongSun_deg))-0.5*varY*varY*Math.sin(4*degToRad*(geomMeanLongSun_deg))-1.25*eccentEarthOrbit*eccentEarthOrbit*Math.sin(2*degToRad*(geomMeanAnomalySun_deg)));
	var HASunrise_deg			= radToDeg*(Math.acos(Math.cos(degToRad*(90.833))/(Math.cos(degToRad*(latitude))*Math.cos(degToRad*(sunDeclin_deg)))-Math.tan(degToRad*(latitude))*Math.tan(degToRad*(sunDeclin_deg))));
	var solarNoon_LST			= (720-4*longitude-eqOfTime_min+timezone*60)/1440;
	var sunriseTime_LST			= solarNoon_LST-HASunrise_deg*4/1440;
	var sunsetTime_LST			= solarNoon_LST+HASunrise_deg*4/1440;
	var sunlightDuration_min	= 8*HASunrise_deg;
	var trueSolarTime_min		= (timeFraction*1440+eqOfTime_min+4*longitude-60*timezone) % 1440;
	var hourAngle_deg			= trueSolarTime_min/4<0 ? trueSolarTime_min/4+180 : trueSolarTime_min/4-180;
	var solarZenithAngle_deg	= radToDeg*(Math.acos(Math.sin(degToRad*(latitude))*Math.sin(degToRad*(sunDeclin_deg))+Math.cos(degToRad*(latitude))*Math.cos(degToRad*(sunDeclin_deg))*Math.cos(degToRad*(hourAngle_deg))));
	var solarElevationAngle_deg	= 90-solarZenithAngle_deg;
	var approxAtmosRefrctn_deg	= (solarElevationAngle_deg>85 ? 0 : (solarElevationAngle_deg>5 ? 58.1/Math.tan(degToRad*(solarElevationAngle_deg))-0.07/Math.pow(Math.tan(degToRad*(solarElevationAngle_deg)),3)+0.000086/Math.pow(Math.tan(degToRad*(solarElevationAngle_deg)),5) : (solarElevationAngle_deg>-0.575 ? 1735+solarElevationAngle_deg*(-518.2+solarElevationAngle_deg*(103.4+solarElevationAngle_deg*(-12.79+solarElevationAngle_deg*0.711))) : -20.772/Math.tan(degToRad*(solarElevationAngle_deg)))))/3600;
	var solarElevCorrected_deg	= solarElevationAngle_deg+approxAtmosRefrctn_deg;
	var solarAzimuth_degCWfromN	= hourAngle_deg>0 ? (radToDeg*(Math.acos(((Math.sin(degToRad*(latitude))*Math.cos(degToRad*(solarZenithAngle_deg)))-Math.sin(degToRad*(sunDeclin_deg)))/(Math.cos(degToRad*(latitude))*Math.sin(degToRad*(solarZenithAngle_deg)))))+180)%360 : (540-radToDeg*(Math.acos(((Math.sin(degToRad*(latitude))*Math.cos(degToRad*(solarZenithAngle_deg)))-Math.sin(degToRad*(sunDeclin_deg)))/(Math.cos(degToRad*(latitude))*Math.sin(degToRad*(solarZenithAngle_deg))))))%360;
	
	var solarData = new Object();
	solarData.timeFraction = timeFraction;
	solarData.julianDay = julianDay;
	solarData.sunriseTime = sunriseTime_LST;
	solarData.sunsetTime = sunsetTime_LST;
	solarData.solarTime = trueSolarTime_min;
	solarData.solarZenith = solarZenithAngle_deg;
	solarData.solarElevation = solarElevCorrected_deg;
	solarData.solarAzimuth = solarAzimuth_degCWfromN;
	
	return solarData;
}

function setSunPosition(solarData) {
	
	// write to data popover
	$(".data-sunrisetime").html(dayFractionToTimeString(solarData.sunriseTime));
	$(".data-sunsettime").html(dayFractionToTimeString(solarData.sunsetTime));
	$(".data-solarelevation").html(Math.abs(Math.round(solarData.solarElevation*10)/10));
	$(".data-solarazimuth").html(Math.round(solarData.solarAzimuth*10)/10);
	$(".data-solarelevation-abovebelow").html(solarData.solarElevation>0 ? "above" : "below");
	
	var winWidth = window.innerWidth;
	var winHeight = window.innerHeight;
	
	//get the current state of affairs
	//preferably read straight off the svg
	//these are native pixel versions
	var sunOriginCX = 582.226;
	var sunOriginCY = 313.266;
	var sunOriginR = 97.631;
	
	// THIS MAY NOT BE NECESSARY - APPEARS SCALING OF CANVAS IS APPLIED AFTER, AUTO?
	// i.e. a 50 "pixel" SVG translation already gets scaled up when the SVG is scaled up.
	/* var sunScaledCX = sunOriginCX*bgScale;
	var sunScaledCY = sunOriginCY*bgScale;
	var sunScaledR = sunOriginR*bgScale; */
	
	//calibrate canvas
	// CHANGING THIS TO REFER TO BGWIDTH AND BGHEIGHT BC IT APPEARS THAT'S HOW IT'S CALC'ED
	// horizon is actually more like 55% down page (not 2/3), but sun is so large --
	// -- like, 2700 arcminutes -- that we fudge it. (it's 32 arcminutes irl.)
	var azi0 = 0;
	var azi360 = azi0 + bgWidth;
	var ele0 = bgHeight*(2/3); //i.e. 2/3 down the page
	var ele90 = 0;
	var eleN90 = bgHeight;
	
	//map spherical azimuth and elevation to rectangular canvas
	var solarAziRect = azi0 + (solarData.solarAzimuth/360)*azi360; //mod azi360?
	var solarEleRect = solarData.solarElevation > 0 ? (ele0 - (solarData.solarElevation/90)*(ele0-ele90)) : (ele0 + (solarData.solarElevation/90)*(ele0-eleN90));
	
	//get position relative to origin (to facilitate relative translation)
	var translateX = solarAziRect-sunOriginCX;
	var translateY = solarEleRect-sunOriginCY;	
	
	var solarDataRect = new Object();
	solarDataRect.azimuth = solarAziRect;
	solarDataRect.elevation = solarEleRect;
	solarDataRect.translateX = translateX;
	solarDataRect.translateY = translateY;
		
	$("#farmbackground #Sun").css("-webkit-transform","translate("+solarDataRect.translateX+"px,"+solarDataRect.translateY+"px)");
	$("#farmbackground #Sun").css("transform","translate("+solarDataRect.translateX+"px,"+solarDataRect.translateY+"px)");
	
	// ACTIVATE NIGHT-TIME!!
	// ideally it'd be some function of elevation, not this bang-bang
	var skyOpacity = (solarData.solarElevation >= 0 ? 1 : 0);
	$("#Sky").css("opacity",skyOpacity);
	$("#Ground_Cover").css("opacity",(1-skyOpacity)*.39);
	if(solarData.solarElevation >= 0)
	{
		$("#flavor button, #scoopsize button").removeClass("btn-inverse");
		$("#playspeed button").addClass("btn-success");
		$("h1").removeClass("night");
	}
	else
	{
		$("#flavor button, #scoopsize button").addClass("btn-inverse");	
		$("#playspeed button").removeClass("btn-success");
		$("h1").addClass("night");
	}
	
	$("#Starfield").css("-webkit-transform","rotate("+(((solarData.timeFraction+0.5)*360)%360)+"deg)");
	$("#Starfield").css("transform","rotate("+(((solarData.timeFraction+0.5)*360)%360)+"deg)");
	
	return solarDataRect;
}
