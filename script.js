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
			elHeight,
			that = this;

		function getAcceleration(isIncreasing) {
			accelerationBase += (isIncreasing ? accelerationChange : accelerationChange * -1);
			if (accelerationBase > accelerationMax) {
				return accelerationMax;
			}
			if (accelerationBase < 0 - opt.DELTA) {
				return 0 - opt.DELTA;
			}
			return Math.floor(accelerationBase);
		}

		for (i in options) {
			opt[i] = options[i];
		}
		elHeight = Math.floor(opt.height / opt.order.length);
		this.el = el;
		this.spin = function () {
			if (!interval) {
				interval = setInterval(function () {
					opt.curBgPostion += opt.DELTA + getAcceleration(true);
					if (opt.curBgPostion === 0) {
						that.stop();
					}
					if (opt.curBgPostion > opt.height){
						opt.curBgPostion -= opt.height;
					}
					el.style.backgroundPosition = "0 " + opt.curBgPostion + "px";
				}, opt.PERIOD);
			}
		};
		this.stop = function () {
			clearInterval(interval);
			interval = null;
		};
		this.stopping = function () {

		};
	}

	function SpinnerManager(objArray) {
		var that = this;
		["spin", "stop"].forEach(function (command) {
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
			DELTA: 2
		};
	Array.prototype.forEach.apply(spinEls, [function (el, index) {
		var i;
		for (i in opt) {
			opt[i] = opt[i] * (index + 1);
		}
		opt["order"] = el.getAttribute("data-el-order").split(",");
		opt["height"] = parseInt(el.getAttribute("data-el-height"));
		spinObjs.push(new Spinner(el, opt));
	}]);
	spinnerManager = new SpinnerManager(spinObjs);
	startButton.addEventListener("click", function () {
		this.className = pressedButtonClass;
		spinnerManager.spin();
		setTimeout(function () {
			spinnerManager.stop();
			startButton.className = buttonClass;
		}, 5000);
	});
})();