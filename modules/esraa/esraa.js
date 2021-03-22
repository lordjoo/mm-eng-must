Module.register("esraa", {
	getScripts: function () {
		return [
			"moment.js" // this file is available in the vendor folder, so it doesn't need to be available in the module folder.
		];
	},

	notificationReceived: function (notification, payload, sender) {
		// console.log(notification);
		switch (notification) {
			case "NEWS_FEED":
				this.news = payload;
				break;
			case "ESRAA_PLAY":
				this.playMusic(payload);
				break;
			case "ESRAA_NEWS":
				this.cur = 0;
				this.readTheNews(payload);
				break;
			case "ESRAA_VOL_DOWN":
				this.volDown();
				break;
			case "ESRAA_SET_VOL":
				this.setVol(payload);
				break;
			case "CALENDAR_EVENTS":
				this.notifyEvent(payload);
				break;
			default:
				break;
		}
	},

	readTheNews: function () {
		let news_items = this.shuffle(this.news.items);
		let read = [];
		for (let index = 0; index < news_items.length; index++) {
			read.push(news_items[index]);
		}
		this.sendNotification("SAY_IN_ARABIC", read);
	},

	shuffle: function (array) {
		var i = array.length,
			j,
			temp;
		if (i == 0) return array;
		while (--i) {
			j = Math.floor(Math.random() * (i + 1));
			temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
		return array;
	},

	volDown: function () {
		this.sendNotification("SPOTIFY_VOLUME_DOWN");
	},

	setVol: function (data) {
		this.sendNotification("SPOTIFY_VOLUME", data);
	},

	notifyEvent: function (events) {
		events.forEach((e) => {
			let event_name = e.title;
			let polly_will_say = "You now have " + event_name + " ";
			let start = new Date(parseInt(e.startDate)).toString();
			// parse the UNIX Time format as int and parse it again as a date object

			// check if event is happening now >> start time == now
			if (moment().format("Y-MM-DD hh:mm") == moment(start).format("Y-MM-DD hh:mm")) {
				console.log("Happining now");
				this.sendNotification("SPEECH_DISPATCHER_SAY", polly_will_say);
			}

			// start 12:00
			// notify 11:55
			// now 11:50
			// ((now + 5 min) == start) => notify the user
			//

			// add 5 minutes to the current time and check if the time after 5 minutes will be == event start time say
			if (moment().add(5, "minutes").format("Y-MM-DD hh:mm") == moment(start).format("Y-MM-DD hh:mm")) {
				console.log("about to begain ");
				this.sendNotification("SPEECH_DISPATCHER_SAY", "The " + event_name + " is 5 minuts away. get ready .");
			}
		});
	},

	playMusic: function (data) {
		// call polly to speak
		this.sendNotification("SPEECH_DISPATCHER_SAY", "Okay, Now playing " + data);
		this.sendNotification("SPOTIFY_TRANSFER", "Pro Mirror"); // the same as raspotify
		this.sendNotification("SPOTIFY_SEARCH", { type: "artist,playlist", query: data.toLowerCase().replace(" ", "+"), random: false });
	}
});

/*
			if (this.config.notifi)
				setInterval(function () {
					self.broadcastEvents();
				}, self.config.notifyInterval);
*/
