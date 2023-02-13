import { uniqueId } from "lodash";
import bot from "./assets/ibot.png";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

const server = "http://localhost:7347/";
// const server = "https://ai-gmed.onrender.com/";

console.log("%c ➜ ", "background:#93f035;", "server:", server);

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

	console.log("%c ➜ ", "background:#00FFbc;", "userPrompt:", userPrompt);

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

	const response = await fetch(server + "codex", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			prompt: userPrompt,
		}),
	});

	clearInterval(loadInterval);
	messageDiv.innerHTML = " ";

	if (response.ok) {
		const data = await response.json();
		const parsedData = data.bot.trim(); // trims any trailing spaces/'\n'

		typeText(messageDiv, parsedData);
	} else {
		const err = await response.text();

		// http://localhost:7347/codex 503 (Service Unavailable)

		const {error, statusText} = err;

		messageDiv.innerHTML = "Something went wrong: "+error+" "+statusText;
		console.log (err);
	}
};

form.addEventListener("submit", handleSubmit);

form.addEventListener("keyup", (e) => {
	if (e.keyCode == 13) {
		handleSubmit(e);
	}
});
