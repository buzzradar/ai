import { uniqueId } from "lodash";
import bot from "./assets/helloCat.png";
import user from "./assets/user.png";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");
const version = "0.1.1";

// const server = "http://localhost:7347/";
const server = "https://ai-gmed.onrender.com/";

console.log("%c ➜ ", "background:#93f035;", "ibot version:", version, "server:", server);

let loadInterval;

function loader(element) {
	element.textContent = "";

	loadInterval = setInterval(() => {
		element.textContent += ".";

		if (element.textContent.length > 3) {
			element.textContent = "";
		}
	}, 300);
}

function typeText(element, text) {
	let index = 0;

	let interval = setInterval(() => {
		if (index < text.length) {
			element.innerHTML += text.charAt(index);
			index++;
		} else {
			clearInterval(interval);
		}
	}, 20);
}

function chatStripe(isAi, value, uId) {
	return `
    <div class="wrapper ${isAi && "ai"}">
        <div class="chat">
            <div class="profile">
                <img 
                    src=${isAi ? bot : user} 
                    alt="${isAi ? "bot" : "user"}" 
                />
            </div>
            <div class="message" id=${uId}>${value}</div>
        </div>
    </div>
`;
}

const handleSubmit = async (e) => {
	e.preventDefault();

	const data = new FormData(form);
	const userPrompt = data.get("prompt");

	// user's chatstripe
	chatContainer.innerHTML += chatStripe(false, userPrompt);

	// to clear the textarea input
	form.reset();

	// bot's chatstripe
	const uID = uniqueId();

	chatContainer.innerHTML += chatStripe(true, " ", uID);

	// to focus scroll to the bottom
	chatContainer.scrollTop = chatContainer.scrollHeight;

	// specific message div
	const messageDiv = document.getElementById(uID);

	// messageDiv.innerHTML = "..."
	loader(messageDiv);

	const { success, content } = await fetchOpenAI(userPrompt);

	clearInterval(loadInterval);
	messageDiv.innerHTML = " ";

	if (success) {
		typeText(messageDiv, content);
	} else {
		messageDiv.innerHTML = content;
	}
};

async function fetchOpenAI(userPrompt) {
	var response = await fetch(server + "codex", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			prompt: userPrompt,
		}),
	});

	const { ok } = response;

	var success = false;
	var content = null;

	if (ok) {
		console.log("%c ➜ ", "background:#00FFbc;", "openAI server success:", response);
		success = true;
		let data = await response.json();
		content = data.bot.trim(); // trims any trailing spaces/'\n'
	} else {
		console.log("%c ➜ ", "background:#ff1cbc;", "openAI server fail:", response);
		content = "Sorry, something went wrong, please try again later - " + response.statusText + " " + response.status;
	}

	return {
		success: success,
		content: content,
	};
}

form.addEventListener("submit", handleSubmit);

form.addEventListener("keyup", (e) => {
	if (e.keyCode == 13) {
		handleSubmit(e);
	}
});
