import { uniqueId } from "lodash";
import { chart } from "./assets/tweets.json";
const version = "0.0.1";

const server = "http://localhost:7347/";
// const server = "https://ai-gmed.onrender.com/";

console.log("%c ➜ ", "background:#93f035;", "tweetRegenerator version:", version, "server:", server);

var tweets_LIST = [];

var app_DIV = document.getElementById("app");
var activeTweet_regenerate_ROW = null; // active tweet regenerator instance
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
	tweet_OBJ.profileImageURL = profile_image_big;
	tweet_OBJ.content = content;
	tweet_OBJ.postImageURL = image_url;

	return tweet_OBJ;
};

var initTweetObject = () => {
	return {
		name: null,
		username: null,
		profileImageURL: null,
		content: null,
		postImageURL: null,
	};
};

var addTweetView = (id, tweet_OBJ) => {
	const { name, username, profileImageURL, content, postImageURL } = tweet_OBJ;

	app_DIV.innerHTML += `<div class="tweetRow" id="${id}">				
							<div class="tweet backColourOriginal">
								<div class="profileContainer"><img class="profileImage" src="${profileImageURL}" loading="lazy"/></div>
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
	activeTweet_regenerate_ROW = tweetRegenerate_ROW;

	// first create skeleton view
	if (!tweetRegenerate_ROW.regenerated_VIEW) tweetRegenerate_ROW.regenerated_VIEW = getRegeneratedTweetView(tweetRegenerate_ROW);

	// then get regenerated tweet and populate view as we get content
	tweetRegenerate_ROW.regenerated_OBJ = getRegenerated_OBJ();
};

async function getRegenerated_OBJ() {
	var regenerated_OBJ = initTweetObject();

	regenerated_OBJ.profileImageURL = await getRegeneratedProfileImage();

	updateProfileImage(regenerated_OBJ.profileImageURL, activeTweet_regenerate_ROW.regenerated_VIEW);

	return regenerated_OBJ;
}

async function getRegeneratedProfileImage() {
	var response = await fetch(server + "randomFace", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			type: null, // "female" or "male" if not specified returns random female or male
		}),
	});

	var url = "NONE";

	const { ok } = response;

	if (ok) {
		var { face } = await response.json();
		url = face.url;
	} else {
		console.log("%c ➜ ", "background:#ff1cbc;", "error getting regenerated profile image", response);
	}

	return url;
}

var updateProfileImage = (url, tweet_VIEW) => {
	tweet_VIEW.querySelector("img").src = url;
};

function getRegeneratedTweetView(tweetRegenerate_ROW) {
	var div = document.createElement("div");
	div.className = "tweet backColourRegenerated";
	div.innerHTML = `<div class="profileContainer"><img class="profileImage"/></div>
	<div class="tweetContent">
		<div><span class="name">hi name here</span><span class="userName">@hiUserNameHere</span></div>
		<div>hello content here!</div>
	</div>`;
	tweetRegenerate_ROW.row_VIEW.appendChild(div);
	return div;
}

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
