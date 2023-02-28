import { debounce } from "lodash";
import { chart } from "./assets/tweets.json";
const version = "0.0.1";

var server = "http";

if (process.env.NODE_ENV == "development") {
	server += "://localhost:7347/";
} else {
	server += "s://ai-gmed.onrender.com/";
}

console.log("%c anonymiser version: " + version + " ", "background:#93f035;", "server API:", server);

var tweets_LIST = [];
var anonymisedProfiles_LIST = [];

var app_DIV = document.getElementById("app");
var activeTweet_regenerate_ROW = null; // active tweet regenerator instance
var isRenegerating = false; // avoid multiple requests at same time spamming the servers

var initTweetRewordRow = (tweet_JSON) => {
	var tweet_OBJ = getNewTweetObject(tweet_JSON);
	const { tweet_id } = tweet_JSON;
	addTweetView(tweet_id, tweet_OBJ);

	tweets_LIST.push({ tweet_id: tweet_id, original_OBJ: tweet_OBJ, anonymised_OBJ: { profile: null, message: null }, row_VIEW: null, regenerated_VIEW: null });
};

var getNewTweetObject = (tweet_JSON) => {
	var { user, content, image_url } = tweet_JSON;
	var { name, username, profile_image_big } = user;

	return {
		name: name,
		username: username,
		profileImageURL: profile_image_big,
		content: content,
		postImageURL: image_url,
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
								<div class="regenerateButton">🔄</div>
							</div>
						</div>`;
};

var debounceSaveRegenerated = debounce(saveRegeneratedTweet, 800);

var onTweetSelected = (id) => {
	if (!isRenegerating) {
		isRenegerating = true; // avoid multiple requests at same time spamming the servers
		regenerateTweet(getTweetById(id));
	}
};

async function regenerateTweet(tweetRegenerate_ROW) {
	activeTweet_regenerate_ROW = tweetRegenerate_ROW;

	// first create skeleton view
	if (!tweetRegenerate_ROW.regenerated_VIEW) tweetRegenerate_ROW.regenerated_VIEW = getRegeneratedTweetView(tweetRegenerate_ROW);

	// TODO: figure out if we already have anonymised profile from previous session in db

	// check if we already have anonymised profile

	var anonymisedProfile_OBJ = getAnonymisedByOriginalUserName(tweetRegenerate_ROW.original_OBJ.username);

	if (anonymisedProfile_OBJ) {
		console.log("%c ➜ ", "background:#93f035;", "yeah we already have anonymised profile:", anonymisedProfile_OBJ);
	} else {
		let aProfile_OBJ = await getRegeneratedProfileImage();
		anonymisedProfile_OBJ = { originalUserName: tweetRegenerate_ROW.original_OBJ.username, profile_OBJ: aProfile_OBJ, imageIndex: 0 };
		anonymisedProfiles_LIST.push(anonymisedProfile_OBJ);
	}

	displayAnonymisedProfile(tweetRegenerate_ROW.regenerated_VIEW, anonymisedProfile_OBJ);

	tweetRegenerate_ROW.anonymised_OBJ.message = await getRephrasedMessage();

	isRenegerating = false;
}

function displayAnonymisedProfile(regenerated_VIEW, anonymisedProfile_OBJ) {
	const { imageIndex, profile_OBJ } = anonymisedProfile_OBJ;
	const { name, surName, userName, genFaces } = profile_OBJ;
	updateName(name + " " + surName, regenerated_VIEW);
	updateUserName(userName, regenerated_VIEW);

	updateProfileImage(genFaces.data.faces[imageIndex].urls, regenerated_VIEW);
}

async function getRephrasedMessage() {
	var { regenerated_VIEW } = activeTweet_regenerate_ROW;
	updateContent("Loading...", regenerated_VIEW);

	const { content } = await getOpenAiRephrasedMessage();

	updateContent(content, regenerated_VIEW);

	return content;
}

async function getOpenAiRephrasedMessage() {
	var response = await fetch(server + "openai", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			hashtagToEndOfString: true, // if true we move hashtag to end of sentence as we've seen empty strings returned
			replaceHandles: "handle", // if specified we replace handles with this string
			model: "text-davinci-003",
			max_tokens: 500,
			prompt: "rephrase",
			content: activeTweet_regenerate_ROW.original_OBJ.content,
		}),
	});

	const { ok } = response;

	var success = false;
	var content = null;

	if (ok) {
		success = true;
		let data = await response.json();
		content = data.bot.trim(); // trims any trailing spaces/'\n'
		console.log("%c ➜ ", "background:#00FFbc;", "openAI server success data:", data);
	} else {
		console.log("%c ➜ ", "background:#ff1cbc;", "openAI server fail:", response);
		content = "Sorry, something went wrong, please try again later - " + response.statusText + " " + response.status;
	}

	return {
		success: success,
		content: content,
	};
}

async function getRegeneratedProfileImage() {
	var response = await fetch(server + "randomProfile", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			type: null, // "female" or "male" if not specified returns random female or male
		}),
	});

	var ranProfile_OBJ = null;

	const { ok } = response;

	if (ok) {
		ranProfile_OBJ = await response.json();
	} else {
		console.log("%c ➜ ", "background:#ff1cbc;", "error getting regenerated profile image", response);
	}

	return ranProfile_OBJ;
}

var updateName = (name, tweet_VIEW) => {
	tweet_VIEW.querySelector(".name").textContent = name;
};
var updateUserName = (name, tweet_VIEW) => {
	tweet_VIEW.querySelector(".userName").textContent = "@" + name;
};

var updateContent = (message, tweet_VIEW) => {
	tweet_VIEW.querySelector(".message").textContent = message;
};

var updateProfileImage = (urls_LIST, tweet_VIEW) => {

	const resolution = "128"; // pixels

	var urlDisplay;

	urls_LIST.forEach((url) => {
		for (let res in url) {
			if (url.hasOwnProperty(res)) {
				if (res == resolution) {
					urlDisplay = url[res];
				}
			}
		}
	});
	tweet_VIEW.querySelector("img").src = urlDisplay;
};

function getRegeneratedTweetView(tweetRegenerate_ROW) {
	var div = document.createElement("div");
	div.className = "tweet backColourRegenerated";

	div.innerHTML = `<div class="profileContainer"><img class="profileImage profileImageChoice"/></div>
	<div class="tweetContent">
		<div><span class="name" contenteditable="true"></span><span class="userName" contenteditable="true"></span></div>
		<div class="message" contenteditable="true"></div>
	</div>`;

	div.querySelector(".name").addEventListener("input", (e) => {
		tweetRegenerate_ROW.regenerated_OBJ.name = e.target.textContent;
		debounceSaveRegenerated(tweetRegenerate_ROW.tweet_id);
	});
	div.querySelector(".userName").addEventListener("input", (e) => {
		tweetRegenerate_ROW.regenerated_OBJ.username = e.target.textContent;
		debounceSaveRegenerated(tweetRegenerate_ROW.tweet_id);
	});
	div.querySelector(".message").addEventListener("input", (e) => {
		tweetRegenerate_ROW.regenerated_OBJ.content = e.target.textContent;
		debounceSaveRegenerated(tweetRegenerate_ROW.tweet_id);
	});

	div.querySelector(".profileImage").addEventListener("click", () => {
		displayOtherProfileImages(tweetRegenerate_ROW.tweet_id);
	});

	tweetRegenerate_ROW.row_VIEW.appendChild(div);
	return div;
}

function displayOtherProfileImages(tweet_id) {
	var { anonymised_OBJ, regenerated_VIEW } = getTweetById(tweet_id);
	// updateProfileImage(anonymised_OBJ.profile.faces, regenerated_VIEW);
}

function saveRegeneratedTweet(tweet_id) {
	console.log("%c ----➜ ", "background:#00FFbc;", "saveTweet:", tweet_id, getTweetById(tweet_id));
}

var getTweetById = (tweet_id) => {
	return tweets_LIST.find((x) => x.tweet_id == tweet_id);
};

var getAnonymisedByOriginalUserName = (originalUserName) => {
	return anonymisedProfiles_LIST.find((x) => x.originalUserName == originalUserName);
};

chart.chart_data.forEach((tweet_JSON) => {
	initTweetRewordRow(tweet_JSON.row);
});

tweets_LIST.forEach((tweetRow_OBJ) => {
	const { tweet_id } = tweetRow_OBJ;

	tweetRow_OBJ.row_VIEW = document.getElementById(tweet_id);

	tweetRow_OBJ.row_VIEW.getElementsByClassName("regenerateButton")[0].addEventListener("click", () => {
		onTweetSelected(tweet_id);
	});
});
