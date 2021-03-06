/*
 * File:        node_helper.js
 * Created:     31/03/2019 by Daniel Burr <dburr@dburr.net>
 * Description: Node helper for MMM-Polly
 */

const NodeHelper = require("node_helper");
const spawn = require("child_process").spawn;
const EventEmitter = require("events");
module.exports = NodeHelper.create({
	start() {
		console.log(`Starting node helper for: ${this.name}`);
		this.speakProcess = null;
		this.arMulti = new EventEmitter();
		this.curN = 0;
		this.maxN = 5;
		this.payload = null;
	},

	socketNotificationReceived(notification, payload) {
		this.payload = payload;
		if (notification === "CONFIG") {
			this.config = payload;
			this.startSpeechDispatcher();
		} else if (notification === "TTS") {
			if (this.speakProcess) {
				this.speakProcess.stdin.write(payload + "\n");
			}
		} else if (notification === "TTS_ar") {
			if (this.speakProcess) {
				this.startSpeechDispatcher(1);
				let text = "";
				payload.forEach((item) => {
					text += item.title + "\n";
				});
				this.speakProcess.stdin.write(text);
			}
		}
	},

	startSpeechDispatcher(isAr = 0) {
		var self = this;
		var params = [];
		if (isAr) {
			var script = "./modules/MMM-Polly/polly_client_ar.py";
			if (this.config.language) params.push("--lang=" + "arb");
			if (this.config.voice) params.push("--voice=" + "Zeina");
		} else {
			var script = "./modules/MMM-Polly/polly_client.py";
			if (this.config.language) params.push("--lang=" + this.config.language);
			if (this.config.voice) params.push("--voice=" + this.config.voice);
		}
		if (this.config.rate) params.push("--rate=" + this.config.rate);
		if (this.config.pitch) params.push("--pitch=" + this.config.pitch);
		if (this.config.volume) params.push("--volume=" + this.config.volume);
		if (this.config.playProgram) params.push("--player=" + this.config.playProgram);

		console.log("Starting client: " + script + " " + params);

		this.speakProcess = spawn(script, params, { detached: false });
		this.speakProcess.stdout.on("data", function (data) {
			var message = data.toString();
			if (message.startsWith("FINISHED_UTTERANCE")) {
				self.sendSocketNotification("FINISHED");
				self.arMulti.emit("finished");
			} else {
				console.error(message);
			}
		});
		this.speakProcess.stderr.on("data", function (data) {
			console.log(data.toString());
		});
	}
});
