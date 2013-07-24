/* initializes the various classes available for use when creating the raindrops. */
function Rainstorm(_pageContainer,_rainContainer) {
	this.dropID			= 1;
	this.pageContainer	= document.getElementById(_pageContainer);
	this.pageContainerID = _pageContainer;
	this.rainContainer = document.getElementById(_rainContainer);
	this.rainContainerID = _rainContainer;
}

Rainstorm.prototype.create = Rainstorm.prototype.moreRain = function(dropCount) {
	for (i=0; i < dropCount; i++) {
		var dropLeft = randRange(0,1600);
		var dropTop = randRange(-1000,1400);

		$('#'+this.rainContainerID).append('<div class="drop" id="drop'+this.dropID+'"></div>');
		$('#drop'+this.dropID).css('left',dropLeft);
		$('#drop'+this.dropID).css('top',dropTop);

		this.dropID++;
	}
};

Rainstorm.prototype.lessRain = function(rainCount) {
	if (this.rainContainer.childNodes.length >= rainCount) {
		var rainRemoveCount = 0;
		while (rainRemoveCount < rainCount) {
			this.rainContainer.removeChild(this.rainContainer.lastChild);
			rainRemoveCount++;
		}
	}
}

Rainstorm.prototype.rainCount = function(newRainCount) {
	
	// if no parameter, return rain count
	if(typeof newRainCount === "undefined") return this.rainContainer.childNodes.length;
	
	// if parameter, set rain count
	if(newRainCount == this.rainContainer.childNodes.length) {
		return true;
	}
	else if(newRainCount > this.rainContainer.childNodes.length) {
		// add the difference
		this.moreRain(newRainCount - this.rainContainer.childNodes.length);
	}
	else {
		// remove the difference
		this.lessRain(this.rainContainer.childNodes.length - newRainCount);
	}
}

// function to generate a random number range.
function randRange( minNum, maxNum) {
  return (Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum);
}