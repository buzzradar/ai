import { uniqueId } from "lodash";
import { chart } from "./assets/tweets.json";
const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");
const version = "0.0.1";

const server = "http://localhost:7347/";
// const server = "https://ai-gmed.onrender.com/";

var tweets_LIST = [];

var app_DIV = document.getElementById("app");
var tweet_regenerate = null; // active tweet regenerator instance
var isRenegerating = false; // avoid multiple requests at same time spamming the servers

var initTweetRewordRow = (tweet_JSON) => {
	var tweet_OBJ = getNewTweetObject(tweet_JSON);
	const { tweet_id } = tweet_JSON;
	addTweetView(tweet_id, tweet_OBJ);

	tweets_LIST.push({ id: tweet_id, original_OBJ: tweet_OBJ, regenerated_OBJ: null, row_VIEW: null, regenerated_VIEW: null });
};

var getNewTweetObject = (tweet_JSON) => {
	var { user, content, image_url } = tweet_JSON;
	var { name, username, profile_image_big } = user;

	var tweet_OBJ = initTweetObject();

	tweet_OBJ.name = name;
	tweet_OBJ.username = username;
	tweet_OBJ.profileimage = profile_image_big;
	tweet_OBJ.content = content;
	tweet_OBJ.image_url = image_url;

	return tweet_OBJ;
};

var initTweetObject = () => {
	return {
		name: null,
		username: null,
		profileimage: null,
		content: null,
		image_url: null,
		id: null,
	};
};

var addTweetView = (id, tweet_OBJ) => {
	const { name, username, profileimage, content, image_url } = tweet_OBJ;

	app_DIV.innerHTML += `<div class="tweetRow" id="${id}">				
							<div class="tweet backColourOriginal">
								<div class="profileContainer"><img class="profileImage" src="${profileimage}" loading="lazy"/></div>
								<div class="tweetContent">
									<div><span class="name">${name}</span><span class="userName">@${username}</span></div>
									<div>${content}</div>
								</div>
								<div class="regenerateButton">🪄</div>
							</div>
						</div>`;
};

var onTweetSelected = (id) => {
	if (!isRenegerating) {
		// isRenegerating = true; // avoid multiple requests at same time spamming the servers
		regenerateTweet(getTweetById(id));
	}
};

var regenerateTweet = (tweetRegenerate_ROW) => {
	if (!tweetRegenerate_ROW.regenerated_VIEW) tweetRegenerate_ROW.regenerated_VIEW = getRegeneratedTweetView(tweetRegenerate_ROW);
};

var getRegeneratedTweetView = (tweetRegenerate_ROW) => {
	var div = document.createElement("div");
	div.className = "tweet backColourRegenerated";
	tweetRegenerate_ROW.row_VIEW.appendChild(div);
	return div;
};

var getTweetById = (id) => {
	return tweets_LIST.find((x) => x.id == id);
};

chart.chart_data.forEach((tweet_JSON) => {
	initTweetRewordRow(tweet_JSON.row);
});

tweets_LIST.forEach((tweetRow_OBJ) => {
	const { id } = tweetRow_OBJ;

	tweetRow_OBJ.row_VIEW = document.getElementById(id);

	tweetRow_OBJ.row_VIEW.getElementsByClassName("regenerateButton")[0].addEventListener("click", () => {
		onTweetSelected(id);
	});
});
