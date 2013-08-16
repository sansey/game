(function () {
	"use strict"

	var lineStopped = document.createEvent("UIEvents"),
		spinningStopped = document.createEvent("UIEvents"),
		spinEls = document.querySelectorAll("[data-el-order]"),
		betWrapper = document.getElementsByClassName("bet-lines")[0],
		brokeAlertWrapper = document.querySelector(".wrapper .broke-alert"),
		lootCounter = document.querySelector(".loot output"),
		spinObjs = [],
		startButton = document.getElementsByClassName("go")[0],
		spinnerManager,
		defOpt = {
			PERIOD: 8,
			DELTA: 6
		};
	lineStopped.initEvent("lineStopped", true, false);
	spinningStopped.initEvent("spinningStopped", true, false);

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
			bgPosPostfix = "px",
			finalNumbers,
			WINNINGNUMBERSLENGTH = 3;

		function reset() {
			isIncreasingSpeed = true;
			accelerationBase = 0;
		}

		function setFinalNumbers() {
			var dy = opt.order.length - opt.curBgPostion / elHeight,
				secondLapNumbers;
			secondLapNumbers = WINNINGNUMBERSLENGTH + dy - opt.order.length;
			if (secondLapNumbers > 0) {
				finalNumbers = opt.order.slice(dy, opt.order.length).concat(opt.order.slice(0, secondLapNumbers));
			} else {
				finalNumbers = opt.order.slice(dy, dy + WINNINGNUMBERSLENGTH);
			}
			console.log(finalNumbers)
			console.log("--------------------------------")
		}

		function getAcceleration(isIncreasing) {
			accelerationBase += (isIncreasing ? accelerationChange : accelerationChange * -1);
			if (accelerationBase > accelerationMax) {
				return accelerationMax;
			}
			return Math.floor(accelerationBase);
		}

		function stop() {
			clearInterval(interval);
			interval = null;
		}

		function moveUntilEdge() {
			var interval = setInterval(function () {
				moveIt(0);
				var dif = opt.curBgPostion % elHeight;
				if (dif < opt.DELTA) {
					opt.curBgPostion = opt.curBgPostion - dif;
					el.style.backgroundPosition = bgPosPrefix + opt.curBgPostion + bgPosPostfix;
					setFinalNumbers();
					clearInterval(interval);
					el.dispatchEvent(lineStopped);
				}
			}, opt.PERIOD);
		}

		function moveIt(acceleration) {
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
						stop();
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
		this.el = el;
		this.stopping = function () {
			isIncreasingSpeed = false;
		};
		this.start = function () {
			reset();
			spin();
		};
		this.getFinalNumbers = function () {
			return finalNumbers;
		}
	}

	function SpinnerManager(linesArray, button, winLinesWrapper, lootContainer, brokeAlertWrapper) {
		var ROLLTIME = 2000,
			linesNumber = linesArray.length,
			stoppedLinesNumber = 0,
			pressedButtonClass = "go pressed",
			buttonClass = "go",
			isAbleSpin = true,
			startCommand = "start",
			stopCommand = "stopping",
			winLinesDefaultClasses,
			coins;

		function Coins() {
			var WINCOINNUMBER = 3,
				DEFAULTCOINSNUMBER = 20,
				brokeAlertClassName = "broke-alert",
				brokeAlertShowClassName = "shown",
				coins;

			function checkBroke() {
				if (coins < 1) {
					brokeAlertWrapper.className += brokeAlertShowClassName;
				}
			}

			this.win = function () {
				coins += WINCOINNUMBER
			};
			this.loose = function () {
				coins--;
				checkBroke();
			};
			this.reset = function () {
				coins = DEFAULTCOINSNUMBER;
				brokeAlertWrapper.className = brokeAlertClassName;
			};
			this.getAmount = function () {
				return coins;
			};
			this.reset();
		}

		function countLoot() {
			var finalNumbersArray = [], i,
				linesLength = linesArray.length,
				classPrefix = " nth-";
			linesArray.forEach(function (line) {
				finalNumbersArray.push(line.getFinalNumbers());
			});
			if(!winLinesDefaultClasses){
				winLinesDefaultClasses = winLinesWrapper.className;
			}
			for (i = 0; i < linesLength; i++) {//TODO: remove magic numbers
				console.log((finalNumbersArray[0][i] === finalNumbersArray[1][i]) && (finalNumbersArray[1][i] === finalNumbersArray[2][i]))
				console.log("---------------------------")
				if ((finalNumbersArray[0][i] === finalNumbersArray[1][i]) && (finalNumbersArray[1][i] === finalNumbersArray[2][i])) {
					winLinesWrapper.className += classPrefix + i;
					coins.win();
				}
			}
			if ((finalNumbersArray[0][0] === finalNumbersArray[1][1]) && (finalNumbersArray[1][1] === finalNumbersArray[2][2])) {
				winLinesWrapper.className += classPrefix + 3;
				coins.win();
			}
			if ((finalNumbersArray[0][2] === finalNumbersArray[1][1]) && (finalNumbersArray[1][1] === finalNumbersArray[2][0])) {
				winLinesWrapper.className += classPrefix + 4;
				coins.win();
			}
			coins.loose();
			lootContainer.innerHTML = coins.getAmount();
		}

		coins = new Coins();
		lootContainer.innerHTML = coins.getAmount();
		button.addEventListener("click", function () {
			if (isAbleSpin && coins.getAmount() > 0) {
				if(winLinesDefaultClasses){
					winLinesWrapper.className = winLinesDefaultClasses;
				}
				isAbleSpin = false;
				button.className = pressedButtonClass;
				spinnerManager.start();
				setTimeout(function () {
					spinnerManager.stopping();
				}, ROLLTIME);
			}
		});
		this[stopCommand] = function () {
			linesArray.forEach(function (obj) {
				obj[stopCommand]();
			});
		};
		this[startCommand] = function () {
			linesArray.forEach(function (obj) {
				obj[startCommand]();
			});
		};
		linesArray.forEach(function (obj) {
			obj.el.addEventListener("lineStopped", function () {
				stoppedLinesNumber++;
				if (stoppedLinesNumber === linesNumber) {
					stoppedLinesNumber = 0;
					document.dispatchEvent(spinningStopped);
				}
			});
		});
		document.addEventListener("spinningStopped", function () {
			countLoot();
			button.className = buttonClass;
			isAbleSpin = true;
		});
	}

	Array.prototype.forEach.apply(spinEls, [function (el, index) {
		var i, opt = [];
		for (i in defOpt) {
			opt[i] = defOpt[i];
		}
		for (i in opt) {
			opt[i] = Math.floor(opt[i] * (index + 1) / 2);
		}
		opt["order"] = el.getAttribute("data-el-order").split(",");
		opt["height"] = parseInt(el.getAttribute("data-el-height"));
		spinObjs.push(new Spinner(el, opt));
	}]);
	["mousedown", "mouseup", "click"].forEach(function (eventName) {
		brokeAlertWrapper.addEventListener(eventName, function (e) {
			e.stopPropagation();
		});
	});
	spinnerManager = new SpinnerManager(spinObjs, startButton, betWrapper, lootCounter, brokeAlertWrapper);
})();