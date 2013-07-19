var forecastAPIkey = 'ddfdd44606f4fb476c0c7fec167bf4a0';
var userLat;
var userLong; 
	
function getLocation()
{
	if (navigator.geolocation) 
	{
		navigator.geolocation.getCurrentPosition(showPosition);
	}
	else 
	{
		//this is not how this error should be handled...
		//in fact, it's downright kafka-esque, since it can never show.
		$("#data-coordinates").html("Geolocation is not supported by this browser.");
	}
}
function showPosition(position)
{
	console.log(position);
	userLat = position.coords.latitude;
	userLong = position.coords.longitude;
	$("#data-coordinates").html(Math.round(userLat*100)/100 + "º, " + Math.round(userLong*100)/100 + "º");
	
	var solarData = getSolarData(userLat, userLong);
	console.log(solarData);
	$("#data-sunrisetime").html(dayFractionToTimeString(solarData.sunriseTime));
	$("#data-sunsettime").html(dayFractionToTimeString(solarData.sunsetTime));
	$("#data-solarelevation").html(Math.round(solarData.solarElevation*10)/10);
	$("#data-solarazimuth").html(Math.round(solarData.solarAzimuth*10)/10);
	
	var solarDataRect = setSunPosition(solarData,window.innerWidth,window.innerHeight);
	
	$.ajax({
		type: "GET",
		url: "https://api.forecast.io/forecast/"+forecastAPIkey+"/"+userLat+","+userLong,
		dataType: 'jsonp',
		success: function(result){
			
			var temp = result.currently.temperature;
			
			$("#data-temp").html(Math.round(temp));
			$("#data-cloud").html(result.currently.cloudCover*100);
			$("#data-wind").html(result.currently.windSpeed);
			$("#data-precip").html(result.currently.precipIntensity);
			$("#data-precipprob").html(result.currently.precipProbability*100);
			
			if(result.currently.cloudCover > 0.1) $("#Right_Cloud").css("opacity","1");
			if(result.currently.cloudCover > 0.3) $("#Left_Cloud").css("opacity","1");
			
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
			$("#notifications").html("There was an unknown error. The site could not be reached. "+errorThrown+" "+textStatus);
		}
	});
	
}

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
	
$(document).ready(function() {
	
	// activate colophon bootstrap popover
	$('#colophon-popover-button').popover();
	
	// geolocate
	getLocation();
	//updates all data every 5 minutes...or should. #TODO: test! 
	updateTimer = window.setInterval(getLocation, 300000); // 300000 ms = 5 min
	
	// load background svg
	$("#background").load("img/background.svg", function() {
		
		//once it's loaded, scale background to fit window
		//background native is 1008px x 648px
		var bgRatio = 1008/648;
		var windowRatio = window.innerWidth/window.innerHeight;
		var winWidth = window.innerWidth;
		var winHeight = window.innerHeight;
		if(bgRatio < windowRatio) {
			$("#farmbackground").attr("width",window.innerWidth+"px");
			$("#farmbackground").attr("height",(window.innerWidth/bgRatio)+"px");
		}
		else
		{
			//#TODO: fill vertically!
			$("#farmbackground").attr("width",window.innerWidth+"px");
			$("#farmbackground").attr("height",(window.innerWidth/bgRatio)+"px");
		}
		
	});
	
	//load ice cream cone svg
	$("#icecream-container").load("img/icecream.svg");
			
});

Date.prototype.getDayFraction = function() {
	return (this.getHours()+(this.getMinutes()/60)+(this.getSeconds()/3600))/24;
}

Date.prototype.getJulian = function() {
	//confer http://stackoverflow.com/questions/11759992/calculating-jdayjulian-day-in-javascript
	//this commented-out version gives an integer local Julian Date
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
	
	/*A*/ 
	/*B*/ 
	/*C*/ 
	/*D*/ 
	/*E*/ 
	/*F*/ var julianDay = today.getJulian();
	/*G*/ var julianCentury = (julianDay-2451545)/36525;
	/*H*/ 
	/*I*/ var geomMeanLongSun_deg 		= (280.46646+julianCentury*(36000.76983 + julianCentury*0.0003032)) % 360;
	/*J*/ var geomMeanAnomalySun_deg 	= 357.52911+julianCentury*(35999.05029 - 0.0001537*julianCentury);
	/*K*/ var eccentEarthOrbit 			= 0.016708634-julianCentury*(0.000042037+0.0000001267*julianCentury)
	/*L*/ var sunEqOfCtr 				= Math.sin(degToRad*geomMeanAnomalySun_deg)*(1.914602-julianCentury*(0.004817+0.000014*julianCentury))+Math.sin(degToRad*(2*geomMeanAnomalySun_deg))*(0.019993-0.000101*julianCentury)+Math.sin(degToRad*(3*geomMeanAnomalySun_deg))*0.000289;
	/*M*/ var sunTrueLong_deg 			= geomMeanLongSun_deg+sunEqOfCtr;
	/*N*/ var sunTrueAnom_deg			= geomMeanAnomalySun_deg+sunEqOfCtr;
	/*O*/ var sunRadVector_AUs			= (1.000001018*(1-eccentEarthOrbit*eccentEarthOrbit))/(1+eccentEarthOrbit*Math.cos(degToRad*(sunTrueAnom_deg)));
	/*P*/ var sunAppLong_deg			= sunTrueLong_deg-0.00569-0.00478*Math.sin(degToRad*(125.04-1934.136*julianCentury));
	/*Q*/ var meanObliqEcliptic_deg		= 23+(26+((21.448-julianCentury*(46.815+julianCentury*(0.00059-julianCentury*0.001813))))/60)/60;
	/*R*/ var obliqCorr_deg				= meanObliqEcliptic_deg+0.00256*Math.cos(degToRad*(125.04-1934.136*julianCentury));
	/*S*/ var sunRtAscen_deg			= radToDeg*(Math.atan2(Math.cos(degToRad*(obliqCorr_deg))*Math.sin(degToRad*(sunAppLong_deg)),Math.cos(degToRad*(sunAppLong_deg))));
	/*T*/ var sunDeclin_deg				= radToDeg*(Math.asin(Math.sin(degToRad*(obliqCorr_deg))*Math.sin(degToRad*(sunAppLong_deg))));
	/*U*/ var varY						= Math.tan(degToRad*(obliqCorr_deg/2))*Math.tan(degToRad*(obliqCorr_deg/2));
	/*V*/ var eqOfTime_min				= 4*radToDeg*(varY*Math.sin(2*degToRad*(geomMeanLongSun_deg))-2*eccentEarthOrbit*Math.sin(degToRad*(geomMeanAnomalySun_deg))+4*eccentEarthOrbit*varY*Math.sin(degToRad*(geomMeanAnomalySun_deg))*Math.cos(2*degToRad*(geomMeanLongSun_deg))-0.5*varY*varY*Math.sin(4*degToRad*(geomMeanLongSun_deg))-1.25*eccentEarthOrbit*eccentEarthOrbit*Math.sin(2*degToRad*(geomMeanAnomalySun_deg)));
	/*W*/ var HASunrise_deg				= radToDeg*(Math.acos(Math.cos(degToRad*(90.833))/(Math.cos(degToRad*(latitude))*Math.cos(degToRad*(sunDeclin_deg)))-Math.tan(degToRad*(latitude))*Math.tan(degToRad*(sunDeclin_deg))));
	/*X*/ var solarNoon_LST				= (720-4*longitude-eqOfTime_min+timezone*60)/1440;
	/*Y*/ var sunriseTime_LST			= solarNoon_LST-HASunrise_deg*4/1440;
	/*Z*/ var sunsetTime_LST			= solarNoon_LST+HASunrise_deg*4/1440;
	/*AA*/ var sunlightDuration_min		= 8*HASunrise_deg;
	/*AB*/ var trueSolarTime_min		= (timeFraction*1440+eqOfTime_min+4*longitude-60*timezone) % 1440;
	/*AC*/ var hourAngle_deg			= trueSolarTime_min/4<0 ? trueSolarTime_min/4+180 : trueSolarTime_min/4-180;
	/*AD*/ var solarZenithAngle_deg		= radToDeg*(Math.acos(Math.sin(degToRad*(latitude))*Math.sin(degToRad*(sunDeclin_deg))+Math.cos(degToRad*(latitude))*Math.cos(degToRad*(sunDeclin_deg))*Math.cos(degToRad*(hourAngle_deg))));
	/*AE*/ var solarElevationAngle_deg	= 90-solarZenithAngle_deg;
	/*AF*/ var approxAtmosRefrctn_deg	= (solarElevationAngle_deg>85 ? 0 : (solarElevationAngle_deg>5 ? 58.1/Math.tan(degToRad*(solarElevationAngle_deg))-0.07/Math.pow(Math.tan(degToRad*(solarElevationAngle_deg)),3)+0.000086/Math.pow(Math.tan(degToRad*(solarElevationAngle_deg)),5) : (solarElevationAngle_deg>-0.575 ? 1735+solarElevationAngle_deg*(-518.2+solarElevationAngle_deg*(103.4+solarElevationAngle_deg*(-12.79+solarElevationAngle_deg*0.711))) : -20.772/Math.tan(degToRad*(solarElevationAngle_deg)))))/3600;
	/*AG*/ var solarElevCorrected_deg	= solarElevationAngle_deg+approxAtmosRefrctn_deg;
	/*AH*/ var solarAzimuth_degCWfromN	= hourAngle_deg>0 ? (radToDeg*(Math.acos(((Math.sin(degToRad*(latitude))*Math.cos(degToRad*(solarZenithAngle_deg)))-Math.sin(degToRad*(sunDeclin_deg)))/(Math.cos(degToRad*(latitude))*Math.sin(degToRad*(solarZenithAngle_deg)))))+180)%360 : (540-radToDeg*(Math.acos(((Math.sin(degToRad*(latitude))*Math.cos(degToRad*(solarZenithAngle_deg)))-Math.sin(degToRad*(sunDeclin_deg)))/(Math.cos(degToRad*(latitude))*Math.sin(degToRad*(solarZenithAngle_deg))))))%360;
	
	/*
	console.log(" julianDay : "+ julianDay );
	console.log(" julianCentury : "+ julianCentury );
	console.log(" geomMeanLongSun_deg : "+ geomMeanLongSun_deg );
	console.log(" geomMeanAnomalySun_deg : "+ geomMeanAnomalySun_deg );
	console.log(" eccentEarthOrbit : "+ eccentEarthOrbit );
	console.log(" sunEqOfCtr : "+ sunEqOfCtr );
	console.log(" sunTrueLong_deg : "+ sunTrueLong_deg );
	console.log(" sunTrueAnom_deg: "+ sunTrueAnom_deg);
	console.log(" sunRadVector_AUs: "+ sunRadVector_AUs);
	console.log(" sunAppLong_deg: "+ sunAppLong_deg);
	console.log(" meanObliqEcliptic_deg: "+ meanObliqEcliptic_deg);
	console.log(" obliqCorr_deg: "+ obliqCorr_deg);
	console.log(" sunRtAscen_deg: "+ sunRtAscen_deg);
	console.log(" sunDeclin_deg: "+ sunDeclin_deg);
	console.log(" varY: "+ varY);
	console.log(" eqOfTime_min: "+ eqOfTime_min);
	console.log(" HASunrise_deg: "+ HASunrise_deg);
	console.log(" solarNoon_LST: "+ solarNoon_LST);
	console.log(" sunriseTime_LST: "+ sunriseTime_LST);
	console.log(" sunsetTime_LST: "+ sunsetTime_LST);
	console.log(" sunlightDuration_min: "+ sunlightDuration_min);
	console.log(" trueSolarTime_min: "+ trueSolarTime_min);
	console.log(" hourAngle_deg: "+ hourAngle_deg);
	console.log(" solarZenithAngle_deg: "+ solarZenithAngle_deg);
	console.log(" solarElevationAngle_deg: "+ solarElevationAngle_deg);
	console.log(" approxAtmosRefrctn_deg: "+ approxAtmosRefrctn_deg);
	console.log(" solarElevCorrected_deg: "+ solarElevCorrected_deg);
	console.log(" solarAzimuth_degCWfromN: "+ solarAzimuth_degCWfromN);
	*/
	
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
	
	//calibrate canvas
	var azi0 = 0;
	var azi360 = azi0 + winWidth;
	var ele0 = winHeight/2;
	var ele90 = 0;
	var eleN90 = winHeight;
	
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
















