/* global Log, Module, moment */

/* Magic Mirror
 * Module: Compliments
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */
Module.register("rtasr", {

	// Module config defaults.
	defaults: {
		updateInterval: 30,
		fadeSpeed: 40,
	},

	show_string:"Please start your show!",

	loaded: function(callback) {
		this.finishLoading();
		Log.log(this.name + ' is loaded!');
		callback();
	},

	getScripts: function() {
		return ["moment.js"];
	},

	start: function() {
		Log.info("Starting module: " + this.name);
		console.log("Starting model here is:"+ this.name)
		var self = this;
		this.updateDom(self.config.fadeSpeed)
		this.sendSocketNotification("CONNECT", "");
	},


	//Overide socketNotificationReceived 
	socketNotificationReceived: function(notification, payload) {
		Log.info(this.name + " received a socket notification: " + notification + " - Payload: " + payload);
		console.log(this.name + " received a socket notification: " + notification + " - Payload: " + payload);
		if (notification === "ASR_RESULT"){
			this.show_string = payload
			this.updateDom(self.config.fadeSpeed)
		}		
	},
	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.className = this.config.classes ? this.config.classes : "thin xlarge bright pre-line";
		// get the compliment text
		//var complimentText = this.randomCompliment();
		var complimentText=this.show_string
		// split it into parts on newline text
		var parts = complimentText.split("\n");
		// create a span to hold it all
		var compliment = document.createElement("span");
		// process all the parts of the compliment text
		for (part of parts){
			// create a text element for each part
			compliment.appendChild(document.createTextNode(part));
			// add a break `
			compliment.appendChild(document.createElement("BR"));
		}
		// remove the last break
		compliment.lastElementChild.remove();
		wrapper.appendChild(compliment);

		return wrapper;
	},

	notificationReceived: function(notification, payload, sender) {
		if (notification === "EVAL_DONE") {
			this.show_string=payload+'\n'+"Too much hand gestures!"
			this.updateDom(self.config.fadeSpeed)
		}
	},

});
