import express from "express";
import openAI from "../modules/openAI.js";
import chalk from "chalk";

const router = express.Router();

const openai = openAI();

router.post("/", async (req, res) => {
	try {
		let { prompt, content, model, max_tokens, frequency_penalty, presence_penalty, temperature, top_p, hashtagToEndOfString, replaceHandles, removeURLs } =
			req.body;

		if (model == undefined) model = "text-davinci-003";
		if (temperature == undefined) temperature = 0;
		if (max_tokens == undefined) max_tokens = 2049;
		if (top_p == undefined) top_p = 1;
		if (removeURLs == undefined) removeURLs = false;
		if (frequency_penalty == undefined) frequency_penalty = 0.5;
		if (presence_penalty == undefined) presence_penalty = 0;
		if (content == undefined) content = null;
		if (hashtagToEndOfString == undefined) hashtagToEndOfString = false; // if true we move hashtag to end of sentence as we've seen empty strings returned

		console.log("🍔", chalk.inverse(" ➜ "), chalk.magentaBright("open ai! "));
		console.log(chalk.inverse(" model:"), chalk.magentaBright(model));
		console.log(chalk.inverse(" max_tokens:"), chalk.magentaBright(max_tokens));
		console.log(chalk.inverse(" removeURLs:"), chalk.magentaBright(removeURLs));
		console.log(chalk.inverse(" hashtagToEndOfString:"), chalk.magentaBright(hashtagToEndOfString));
		console.log(chalk.inverse(" prompt:"), chalk.magentaBright(prompt));
		console.log(chalk.inverse(" content:"), chalk.magentaBright(content));
		console.log(" ");

		if (content) {
			// if we get content we marry up, otherwise we just use prompt
			// * we need this as when we get a hashtag first sometimes we can empty string back
			if (hashtagToEndOfString) content = moveHashtagToEndOfString(content);
			if (removeURLs) content = removeThoseURLs(content);
			if (replaceHandles) content = replaceTheHandles(replaceHandles, content);
			prompt = prompt + "\n\n" + content;
		}

		var response = await openai.createCompletion({
			model: model,
			prompt: prompt,
			temperature: 0, // Higher values means the model will take more risks.
			max_tokens: max_tokens, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
			top_p: top_p, // alternative to sampling with temperature, called nucleus sampling
			frequency_penalty: frequency_penalty, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
			presence_penalty: presence_penalty, // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
		});

		// console.log("-- OPEN AI response choices:", response.data.choices);

		res.status(200).send({
			bot: response.data.choices[0].text,
		});
	} catch (error) {
		let status = 500;
		let statusText = "unknown problem";
		let { response } = error;
		if (response) {
			// console.log(response);
			status = response.status;
			statusText = response.statusText;
		} else {
			console.log(error);
		}

		res.status(status).send({ error: status, statusText: statusText });
	}
});

/**
 * moveHashtagToEndOfString
 * * if first word is a hashtag, move it to the end of the string as we've seen empty strings returned
 * @param {string} content
 * @returns {string}
 */

var moveHashtagToEndOfString = (content) => {
	const firstWord = content.replace(/ .*/, "");
	const firstWordLetter = firstWord.slice(0, 1);
	if (firstWordLetter == "#") {
		content = content.replace(firstWord, "");
		content += " " + firstWord;
	}
	return content;
};

/**
 * replace The Handles
 * * replace the handles with the new handle
 * @param {string} replaceHandles
 * @param {string} content
 * @returns {string}
 */

var replaceTheHandles = (replaceHandles, content) => {
	return content.replace(/@(\w+)/g, "@" + replaceHandles);
};

/**
 * remove those urls
 * * removes all urls from the string
 * @param {string} content
 * @returns {string}
 */

var removeThoseURLs = (content) => {
	return content.replace(/(?:https?|ftp):\/\/[\n\S]+/g, "");
};

export default router;
