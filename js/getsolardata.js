function getSolarData(latitude, longitude)
{
	// adapted from NOAA calculator http://www.esrl.noaa.gov/gmd/grad/solcalc/calcdetails.html
	var today = new Date();
	var timezone = -this.getTimezoneOffset()/60; //js uses odd W-is-+ convention
	var degToRad = Math.PI/180;
	
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
	/*K*/ var eccentEarthOrbit 			= 0.016708634-G2*(0.000042037+0.0000001267*G2)
	/*L*/ var sunEqOfCtr 				= Math.sin(degToRad*J2)*(1.914602-G2*(0.004817+0.000014*G2))+SIN(degToRad*(2*J2))*(0.019993-0.000101*G2)+SIN(degToRad*(3*J2))*0.000289;
	/*M*/ var sunTrueLong_deg 			= I2+L2;
	/*N*/ var sunTrueAnom_deg			=J2+L2;
	/*O*/ var sunRadVector_AUs			=(1.000001018*(1-K2*K2))/(1+K2*COS(RADIANS(N2)));
	/*P*/ var sunAppLong_deg			=M2-0.00569-0.00478*SIN(RADIANS(125.04-1934.136*G2));
	/*Q*/ var meanObliqEcliptic_deg		=23+(26+((21.448-G2*(46.815+G2*(0.00059-G2*0.001813))))/60)/60;
	/*R*/ var obliqCorr_deg				=Q2+0.00256*COS(RADIANS(125.04-1934.136*G2));
	/*S*/ var sunRtAscen_deg			=DEGREES(ATAN2(COS(RADIANS(P2)),COS(RADIANS(R2))*SIN(RADIANS(P2))));
	/*T*/ var sunDeclin_deg				=DEGREES(ASIN(SIN(RADIANS(R2))*SIN(RADIANS(P2))));
	/*U*/ var varY						=TAN(RADIANS(R2/2))*TAN(RADIANS(R2/2));
	/*V*/ var eqOfTime_min				=4*DEGREES(U2*SIN(2*RADIANS(I2))-2*K2*SIN(RADIANS(J2))+4*K2*U2*SIN(RADIANS(J2))*COS(2*RADIANS(I2))-0.5*U2*U2*SIN(4*RADIANS(I2))-1.25*K2*K2*SIN(2*RADIANS(J2)));
	/*W*/ var HASunrise_deg				=DEGREES(ACOS(COS(RADIANS(90.833))/(COS(RADIANS(latitude))*COS(RADIANS(T2)))-TAN(RADIANS(latitude))*TAN(RADIANS(T2))));
	/*X*/ var solarNoon_LST				=(720-4*longitude-V2+timezone*60)/1440;
	/*Y*/ var sunriseTime_LST			=X2-W2*4/1440;
	/*Z*/ var sunsetTime_LST			=X2+W2*4/1440;
	/*AA*/ var sunlightDuration_min		=8*W2;
	/*AB*/ var trueSolarTime_min		=MOD(E2*1440+V2+4*longitude-60*timezone,1440);
	/*AC*/ var hourAngle_deg			=IF(AB2/4<0,AB2/4+180,AB2/4-180);
	/*AD*/ var solarZenithAngle_deg		=DEGREES(ACOS(SIN(RADIANS(latitude))*SIN(RADIANS(T2))+COS(RADIANS(latitude))*COS(RADIANS(T2))*COS(RADIANS(AC2))));
	/*AE*/ var solarElevationAngle_deg	=90-AD2;
	/*AF*/ var approxAtmosRefrctn_deg	=IF(AE2>85,0,IF(AE2>5,58.1/TAN(RADIANS(AE2))-0.07/POWER(TAN(RADIANS(AE2)),3)+0.000086/POWER(TAN(RADIANS(AE2)),5),IF(AE2>-0.575,1735+AE2*(-518.2+AE2*(103.4+AE2*(-12.79+AE2*0.711))),-20.772/TAN(RADIANS(AE2)))))/3600;
	/*AG*/ var solarElevCorrected_deg	=AE2+AF2;
	/*AH*/ var solarAzimuth_degCWfromN	=IF(AC2>0,MOD(DEGREES(ACOS(((SIN(RADIANS(latitude))*COS(RADIANS(AD2)))-SIN(RADIANS(T2)))/(COS(RADIANS(latitude))*SIN(RADIANS(AD2)))))+180,360),MOD(540-DEGREES(ACOS(((SIN(RADIANS(latitude))*COS(RADIANS(AD2)))-SIN(RADIANS(T2)))/(COS(RADIANS(latitude))*SIN(RADIANS(AD2))))),360));
	
}