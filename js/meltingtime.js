// / / / / / / / / / / / / //
/////////////////////////////
///// C O N S T A N T S /////
/////////////////////////////
// / / / / / / / / / / / / //

//yeah yeah, i know, API key should be secret... don't steal please! i deserve it, don't I? you vigilante you.
var forecastAPIkey = 'ddfdd44606f4fb476c0c7fec167bf4a0';
var userLat;
var userLong; 

//background native is 1008px x 648px
var bgWidth = 1008;
var bgHeight = 648;
var bgRatio = bgWidth/bgHeight;

//set later
var windowRatio;
var winWidth;
var winHeight;
var bgScale;

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
	switch(event.target.dataset.flavor) {
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


// / / / / / / / / / / //
/////////////////////////
///// O N   L O A D /////
/////////////////////////
// / / / / / / / / / / //

$(document).ready(function() {
	
	// activate colophon bootstrap popover
	$('#colophon-popover-button').popover();
	
	// initialize window variables
	windowRatio = window.innerWidth/window.innerHeight;
	winWidth = window.innerWidth;
	winHeight = window.innerHeight;
	bgScale = bgWidth / winWidth;
	
	// geolocate
	getLocation();
	//updates all data every 5 minutes...or should. #TODO: test! 
	updateTimer = window.setInterval(getLocation, 600000); // 600000 ms = 10 min
	
	// load background svg
	$("#background").load("img/background.svg", function() {
		
		//once it's loaded, scale background to fit window
		$("#farmbackground").attr("width",winWidth+"px");
		$("#farmbackground").attr("height",(winWidth/bgRatio)+"px");
		// #TODO: fill vertically if bgRatio > windowRatio 
		// (i.e. if the window is narrower than the background)
				
	});
	
	// load ice cream cone svg
	$("#icecream-container").load("img/icecream.svg");
			
});


// / / / / / / / / / / //
/////////////////////////
///// W E A T H E R /////
/////////////////////////
// / / / / / / / / / / //

function getLocation()
{
	if (navigator.geolocation) 
	{
		navigator.geolocation.getCurrentPosition(updateScene);
	}
	else 
	{
		//ERROR: Geolocation is not supported by this browser.
	}
}
function updateScene(position)
{
	console.log(position);
	userLat = position.coords.latitude;
	userLong = position.coords.longitude;
	$("#data-coordinates").html(Math.round(userLat*100)/100 + "º, " + Math.round(userLong*100)/100 + "º");
	
	var solarData = getSolarData(userLat, userLong);
	console.log(solarData);
	$("#data-sunrisetime").html(dayFractionToTimeString(solarData.sunriseTime));
	$("#data-sunsettime").html(dayFractionToTimeString(solarData.sunsetTime));
	$("#data-solarelevation").html(Math.abs(Math.round(solarData.solarElevation*10)/10));
	$("#data-solarazimuth").html(Math.round(solarData.solarAzimuth*10)/10);
	$("#data-solarelevation-abovebelow").html(solarData.solarElevation>0 ? "above" : "below");
	
	var solarDataRect = setSunPosition(solarData,window.innerWidth,window.innerHeight);
	
	$.ajax({
		type: "GET",
		url: "https://api.forecast.io/forecast/"+forecastAPIkey+"/"+userLat+","+userLong,
		dataType: 'jsonp',
		success: function(result){
			
			var temp = result.currently.temperature;
			
			$("#data-temp").html(Math.round(temp));
			$("#data-cloud").html(Math.round(result.currently.cloudCover*100));
			$("#data-wind").html(Math.round(result.currently.windSpeed));
			$("#data-precip").html(Math.round(result.currently.precipIntensity));
			$("#data-precipprob").html(Math.round(result.currently.precipProbability*100));
			
			// right cloud shows when cloud cover >= 10%
			// left cloud shows when cloud cover >= 30%
			var rightCloudOpacity = (result.currently.cloudCover >= 0.1 ? 1 : 0);
			var leftCloudOpacity = (result.currently.cloudCover >= 0.3 ? 1 : 0);
			$("#Right_Cloud").css("opacity",rightCloudOpacity);
			$("#Left_Cloud").css("opacity",leftCloudOpacity);
			
			console.log(result);
			
			$('#data-popover-button').popover({
				'content':$("#data-stats").html(),
				'html':true
			});
			$("#data-popover-button").removeClass("disabled");
			
			var meltCoef = '1000';
			var flavorCoef = '1';
			var sizeCoef = '1';
			var typeCoef = '1';
			
			var meltTime = meltCoef * flavorCoef * sizeCoef * typeCoef * (1/temp);
			var meltTimeDisplay = Math.round(meltTime);
			$("h1").html("Your ice cream will melt in " + meltTimeDisplay + " minutes.");
			
		},
		error: function(XMLHttpRequest, textStatus, errorThrown){
			// #TODO: ERROR HANDLING!
			$("#notifications").html("There was an unknown error. The site could not be reached. "+errorThrown+" "+textStatus);
		}
	});
	
}


// / / / / / / / / / / / / //
/////////////////////////////
///// E P H E M E R I S /////
/////////////////////////////
// / / / / / / / / / / / / //

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

function getSolarData(latitude, longitude)
{
	// adapted from NOAA calculator http://www.esrl.noaa.gov/gmd/grad/solcalc/calcdetails.html
	var today = new Date();
	var timeFraction = today.getDayFraction(); //*1000 to speed up time by a thousand
	var timezone = -today.getTimezoneOffset()/60; //js uses odd W-is-+ convention
	var degToRad = Math.PI/180;
	var radToDeg = 1/degToRad;
	
	var julianDay = today.getJulian();
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
	solarData.julianDay = julianDay;
	solarData.sunriseTime = sunriseTime_LST;
	solarData.sunsetTime = sunsetTime_LST;
	solarData.solarTime = trueSolarTime_min;
	solarData.solarZenith = solarZenithAngle_deg;
	solarData.solarElevation = solarElevCorrected_deg;
	solarData.solarAzimuth = solarAzimuth_degCWfromN;
	
	return solarData;
}

function setSunPosition(solarData, winWidth, winHeight) {
	
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
	var azi0 = 0;
	var azi360 = azi0 + bgWidth;
	var ele0 = bgHeight*2/3; //i.e. 2/3 down the page
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
	console.log(solarDataRect);
		
	$("#farmbackground #Sun").css("-webkit-transform","translate("+solarDataRect.translateX+"px,"+solarDataRect.translateY+"px)");
	$("#farmbackground #Sun").css("transform","translate("+solarDataRect.translateX+"px,"+solarDataRect.translateY+"px)");
	
	return solarDataRect;
}
