import { uniqueId } from "lodash";
import { chart } from "./assets/tweets.json";
const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");
const version = "0.0.1";

const server = "http://localhost:7347/";
// const server = "https://ai-gmed.onrender.com/";

var tweets_LIST = [];

var app_DIV = document.getElementById("app");
var tweet_regenerate = null;
var isRenegerating = false; // avoid multiple requests spamming the server

var initTweetRewordRow = (tweet_JSON) => {
	let tweet_OBJ = getTweetObject(tweet_JSON);
	addTweetView(tweet_OBJ);

	tweets_LIST.push({ original: tweet_OBJ, id: tweet_OBJ.id, regeneratedView: null });
};

var getTweetObject = (tweet_JSON) => {
	var { user, content, image_url, tweet_id } = tweet_JSON;
	var { name, username, profile_image_big } = user;

	return {
		name: name,
		username: username,
		profileimage: profile_image_big,
		content: content,
		image_url: image_url,
		id: tweet_id,
	};
};

var addTweetView = (tweet_OBJ) => {
	const { name, username, profileimage, content, image_url, id } = tweet_OBJ;

	app_DIV.innerHTML += `<div class="tweetRow" id="${id}">				
							<div class="tweet backColourDefault">
								<div class="profileContainer"><img class="profileImage" src="${profileimage}" loading="lazy"/></div>
								<div class="tweetContent">
									<div><span class="name">${name}</span><span class="userName">@${username}</span></div>
									<div>${content}</div>
								</div>
								<div class="regenerateButton">🪄</div>
							</div>
						</div>`;
};

var regenerateTweet = (id) => {
	if (!isRenegerating) {
		isRenegerating = true; // avoid multiple requests spamming the server
		tweet_regenerate = getTweetById(id);
		console.log("%c ➜ ", "background:#00FFbc;", "regenerateTweet:", tweet_regenerate);
	}
};

var getTweetById = (id) => {
	return tweets_LIST.find((x) => x.id == id);
};

chart.chart_data.forEach((tweet_JSON) => {
	initTweetRewordRow(tweet_JSON.row);
});

tweets_LIST.forEach((tweetRow) => {
	const { id } = tweetRow;

	document
		.getElementById(id)
		.getElementsByClassName("regenerateButton")[0]
		.addEventListener("click", () => {
			regenerateTweet(id);
		});
});
