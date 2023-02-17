// Import our custom CSS
import '../scss/styles.scss'
import * as bootstrap from 'bootstrap'
const form = document.querySelector("form");
const resultContainer = document.querySelector("#result_container");
const version = "0.0.1";


var server = "http://localhost:7347/";
if (process.env.NODE_ENV === 'production') {
	server = "https://cnl.onrender.com";
}
console.log("%c ➜ ", "background:#93f035;", "CNL version:", version, "server:", server);

const handleSubmit = async (e) => {
	e.preventDefault();
	result_container.innerHTML = "";

	const data = new FormData(form);
	const copyToAnalyse = data.get("copy");

	console.log(copyToAnalyse);

	const { success, resultFromGoogle } = await fetchCNL(copyToAnalyse);
	result_container.innerHTML = JSON.stringify(resultFromGoogle, undefined, 2);

	var sentimentColumn = document.querySelector('.sentiment-col p');
	sentimentColumn.innerHTML = "<strong>Sentiment: </strong>"+resultFromGoogle.result.documentSentiment.score+"<br><strong>Magnitude: </strong>"+resultFromGoogle.result.documentSentiment.magnitude;

	var categoriesColumn = document.querySelector('.categories-col p');
	categoriesColumn.innerHTML = JSON.stringify(resultFromGoogle.result.categories, undefined, 2);;
	
};


async function fetchCNL(copyToAnalyse) {
	
	var response = await fetch(server + "cnl", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			copyToAnalyse: copyToAnalyse,
		}),
	});

	const { ok } = response;

	var success = false;
	var resultFromGoogle = null;

	if (ok) {
		success = true;
		let data = await response.json();
		resultFromGoogle = data;
		console.log("%c ➜ ", "background:#00FFbc;", "CNL Server success:", resultFromGoogle);
	} else {
		console.log("%c ➜ ", "background:#ff1cbc;", "CNL Server fail:", response);
		resultFromGoogle = "Sorry, something went wrong, please try again later - " + response.statusText + " " + response.status;
	}

	return {
		success: success,
		resultFromGoogle: resultFromGoogle,
	};
}


form.addEventListener("submit", handleSubmit);

form.addEventListener("keyup", (e) => {
	if (e.keyCode == 13) {
		handleSubmit(e);
	}
});