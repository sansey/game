(function () {
	"use strict"

	function Spinner(el, options) {
		var interval,
			opt = {
				PERIOD: 5,
				curBgPostion: 0,
				DELTA: 2,
				height: 100
			},
			i,
			accelerationBase = 0,
			accelerationChange = 0.02,
			accelerationMax = 10,
			speedMinimum = 2,
			elHeight,
			that = this,
			isIncreasingSpeed = true,
			bgPosPrefix = "0 ",
			bgPosPostfix = "px";

		function reset(){
			isIncreasingSpeed = true;
			accelerationBase = 0;
		}

		function getAcceleration(isIncreasing) {
			accelerationBase += (isIncreasing ? accelerationChange : accelerationChange * -1);
			if (accelerationBase > accelerationMax) {
				return accelerationMax;
			}
			return Math.floor(accelerationBase);
		}

		function moveUntilEdge(){
			var interval = setInterval(function(){
				moveIt(0);
				if(opt.curBgPostion % elHeight === 0){
					clearInterval(interval);
				}
			}, opt.PERIOD);
		}

		function moveIt(acceleration){
			opt.curBgPostion += opt.DELTA + acceleration;
			if (opt.curBgPostion > opt.height) {
				opt.curBgPostion -= opt.height;
			}
			el.style.backgroundPosition = bgPosPrefix + opt.curBgPostion + bgPosPostfix;
		}

		function spin() {
			if (!interval) {
				interval = setInterval(function () {
					var acceleration = getAcceleration(isIncreasingSpeed);
					if (opt.DELTA + acceleration < speedMinimum) {
						moveUntilEdge();
						that.stop();
						return;
					}
					moveIt(acceleration);
				}, opt.PERIOD);
			}
		}

		for (i in options) {
			opt[i] = options[i];
		}
		elHeight = Math.floor(opt.height / opt.order.length);
		this.stop = function () {
			clearInterval(interval);
			interval = null;
		};
		this.stopping = function () {
			isIncreasingSpeed = false;
		};
		this.start = function(){
			reset();
			spin();
		};
	}

	function SpinnerManager(objArray) {
		var that = this;
		["start", "stopping"].forEach(function (command) {
			that[command] = function () {
				objArray.forEach(function (obj) {
					obj[command]();
				});
			};
		});
	}

	var spinEls = document.querySelectorAll(".wrapper div"),
		spinObjs = [],
		startButton = document.getElementsByClassName("go")[0],
		spinnerManager,
		pressedButtonClass = "go pressed",
		buttonClass = "go",
		opt = {
			PERIOD: 5,
			DELTA: 4
		};
	Array.prototype.forEach.apply(spinEls, [function (el, index) {
		var i;
		for (i in opt) {
			opt[i] = opt[i] * (index + 1) / 2;
		}
		opt["order"] = el.getAttribute("data-el-order").split(",");
		opt["height"] = parseInt(el.getAttribute("data-el-height"));
		spinObjs.push(new Spinner(el, opt));
	}]);
	spinnerManager = new SpinnerManager(spinObjs);
	startButton.addEventListener("click", function () {
		startButton.className = pressedButtonClass;
		spinnerManager.start();
		setTimeout(function () {
			spinnerManager.stopping();
			startButton.className = buttonClass;
		}, 5000);
	});
})();