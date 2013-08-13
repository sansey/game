document.addEventListener("DOMContentLoaded", function(){
	"use strict"

	function Spinner(el, options){
		var interval,
			opt = {
				PERIOD:5,
				curBgPostion:0,
				DELTA:2
			},
			i,
			accelerationBase = 0,
			accelerationChange = 0.02,
			accelerationMax = 10;

		function getAcceleration(isIncreasing){
			accelerationBase += (isIncreasing ? accelerationChange : accelerationChange * -1);
			if(accelerationBase > accelerationMax){
				return accelerationMax;
			}
			if(accelerationBase < 0 - opt.DELTA){
				return 0 - opt.DELTA;
			}
			return Math.floor(accelerationBase);
		}

		for(i in options){
			opt[i] = options[i];
		}
		this.el = el;
		this.spin = function(){
			interval = setInterval(function(){
				opt.curBgPostion += opt.DELTA + getAcceleration(true);
				if(opt.curBgPostion === 0){
					this.stop();
				}
				el.style.backgroundPosition = "0 " + opt.curBgPostion + "px";
			}, opt.PERIOD);
		};
		this.stop = function(){
			clearInterval(interval);
		};
		this.stopping = function(){

		}
	}

	var spinEls = document.querySelectorAll(".wrapper div");
	var opt = {
		PERIOD:5,
		DELTA:2
	};
	Array.prototype.forEach.apply(spinEls, [function(el, index){
		var i;
		for(i in opt){
			opt[i] = opt[i] * (index + 1);
		}
		window.test = new Spinner(el, opt);
		test.spin();
	}]);
});