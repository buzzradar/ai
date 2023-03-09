import express from "express";
import lodash from "lodash";
import fetch from "node-fetch";
import chalk from "chalk";
import { ImageAnnotatorClient } from "@google-cloud/vision";

import { createRequire } from "node:module";
var require = createRequire(import.meta.url);

var namesFemale = require("../assets/names-female.json");
var namesMale = require("../assets/names-male.json");
var namesSurnames = require("../assets/names-surnames.json");

const router = express.Router();
const genPhotosURL = "https://api.generated.photos/api/v1/faces?api_key=";

var gVisionClient = new ImageAnnotatorClient({
	credentials: JSON.parse(process.env.GOOGLE_CLOUD_BUZZ_KEY),
});

router.post("/", async (req, res) => {
	var { type, profileImageUrl, originalUserName, name } = req.body; // female or male if not specified, random

	console.log("👻", chalk.inverse(" ➜ "), chalk.cyanBright("get anon profile! "));
	console.log(chalk.inverse(" originalUserName:"), chalk.cyanBright(originalUserName));
	console.log(chalk.inverse(" name:"), chalk.cyanBright(name));
	console.log(chalk.inverse(" type:"), chalk.cyanBright(type));
	console.log(chalk.inverse(" profileImageUrl:"), chalk.cyanBright(profileImageUrl));
	console.log(" ");

	var nameFoundInList = false;

	if (!type && name) {
		// if no type specified, but name is, then use name to determine type
		let checkName = name.split(" ")[0].split("-")[0].split("_")[0].toLowerCase();
		let typeOfName = isInNamesList(checkName, namesFemale.data, "female");
		if (!typeOfName) typeOfName = isInNamesList(checkName, namesMale.data, "male");
		if (typeOfName) {
			nameFoundInList = true;
		} else {
			console.log(chalk.red("name not found in names list:"), name);
		}
		type = typeOfName;
	}

	var profileImageLabels = {
		age: ["adult", "young-adult"],
	};

	var emotion = "neutral";

	if (profileImageUrl) {
		let gVisionProfileFace = await getGoogleVision(profileImageUrl);

		console.log(chalk.cyan("gVisionProfileFace:"), gVisionProfileFace);
		if (isPositive(gVisionProfileFace.surpriseLikelihood)) emotion = "surprise";
		if (isPositive(gVisionProfileFace.joyLikelihood)) emotion = "joy";

		console.log(chalk.cyan("emotion:"), emotion);
	}

	var ranProfile_OBJ = getRandomProfile(type, nameFoundInList);

	// * options for generated.photos: https://generated.photos/account#apikey
	const page = "1";
	const per_page = "6";
	const age = lodash.sample(profileImageLabels.age);
	const order = "random";

	var url =
		genPhotosURL +
		process.env.GPHOTOS_API_KEY +
		`&page=${page}&per_page=${per_page}&gender=${ranProfile_OBJ.type}&age=${age}&emotion=${emotion}&order_by=${order}`;

	try {
		ranProfile_OBJ.genFaces = await getGenPhoto(url);
		let { error } = ranProfile_OBJ.genFaces;

		if (error) {
			console.log("uh oh error:", error);
			res.status(200).send({ status: error, statusText: error, error: "generated.photos" });
		} else {
			res.status(200).send(ranProfile_OBJ);
		}
	} catch (error) {
		let status = 500;
		let statusText = "unknown problem";
		// let { response } = error;
		// if (response) {
		// 	console.log(response);
		// 	status = response.status;
		// 	statusText = response.statusText;
		// } else {
		// 	console.log(error);
		// }

		console.log("tried and catch error:", error);

		res.status(200).send({ status: status, statusText: statusText, error: error, jeff: "jeff" });
	}
});

var isInNamesList = (nameCheck, namesList, typeOfName) => {
	var type = null;
	for (let name of namesList) {
		if (name.toLowerCase() == nameCheck) {
			type = typeOfName;
			break;
		}
	}
	return type;
};

var isPositive = (likelihood) => {
	if (likelihood == "VERY_LIKELY" || likelihood == "LIKELY") {
		// https://cloud.google.com/vision/docs/reference/rest/v1/AnnotateImageResponse#Likelihood
		return true;
	} else {
		return false;
	}
};

async function getGoogleVision(profileImageUrl) {
	var profileFace = {
		joyLikelihood: "VERY_UNLIKELY",
		surpriseLikelihood: "VERY_UNLIKELY",
	};

	// var [resultLabel] = await gVisionClient.labelDetection(profileImageUrl);

	// var labels = resultLabel.labelAnnotations;
	// console.log(chalk.bgBlackBright("[gVision labelDetection]"));
	// labels.forEach((label, i) => console.log(chalk.yellowBright(`[${i + 1}] ${label.description}`)));

	try {
		var [resultFace] = await gVisionClient.faceDetection(profileImageUrl);
		var [face] = resultFace.faceAnnotations; // https://cloud.google.com/vision/docs/reference/rest/v1/AnnotateImageResponse#Likelihood

		if (face) {
			profileFace.joyLikelihood = face.joyLikelihood;
			profileFace.surpriseLikelihood = face.surpriseLikelihood;
		} else {
			console.log(chalk.cyan("google vision no face detected"));
		}
	} catch (err) {
		console.error(err);
	}

	return profileFace;
}

async function getGenPhoto(url) {
	// Default options are marked with *

	console.log("fetch genPhoto", url);
	var response = await fetch(url, {
		method: "GET", // *GET, POST, PUT, DELETE, etc.
		// mode: "cors", // no-cors, *cors, same-origin
		// cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
		// credentials: "same-origin", // include, *same-origin, omit
		// headers: {
		// 	"Content-Type": "application/json",
		// 	// 'Content-Type': 'application/x-www-form-urlencoded',
		// },
		// redirect: "follow", // manual, *follow, error
		// referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
		// body: JSON.stringify(data), // body data type must match "Content-Type" header
	})
		.then((response) => {
			return response.json();
		})
		.then((jsondata) => {
			return { error: false, data: jsondata };
		})
		.catch((error) => {
			return { error: error, data: null };
		});

	// console.log("the response:", response);

	var { error } = response.data;
	if (error) {
		response.error = response.data.error;
		console.log("hi error genPhotos:", error);
	}

	return response;
}

var getRandomProfile = (type, nameFoundInList) => {
	if (!type) {
		if (lodash.random(0, 1)) {
			type = "female";
		} else {
			type = "male";
		}
	}

	var names_LIST;

	if (type == "male") {
		names_LIST = namesMale;
	} else {
		names_LIST = namesFemale;
	}

	var name = lodash.sample(names_LIST.data);
	var surName = lodash.sample(namesSurnames.data);

	var userName;

	switch (lodash.random(0, 8)) {
		case 0:
			userName = name.toLowerCase() + lodash.random(2, 100);
			break;
		case 1:
			userName = surName.toLowerCase() + lodash.random(2, 100);
			break;
		case 2:
			userName = name.toLowerCase() + surName + lodash.random(2, 10);
			break;
		case 3:
			userName = name.toLowerCase() + surName.charAt(0);
			break;
		case 4:
			userName = surName.toLowerCase() + name;
			break;
		case 5:
			userName = getFirstLetterName(name) + "_" + surName;
			break;
		case 6:
			userName = name.toLowerCase() + "_" + surName;
			break;
		case 7:
			userName = getFirstLetterName(name) + "-" + surName;
			break;
		case 8:
			userName = name.toLowerCase() + "-" + surName;
			break;
	}

	if (!lodash.random(0, 2)) userName += lodash.random(2, 10);

	return {
		type: type,
		genFaces: null,
		// urlLib: getRandomFaceLibrary(type),
		name: name,
		surName: surName,
		userName: userName,
		nameFoundInList: nameFoundInList,
	};
};

var getFirstLetterName = (name) => {
	var letter = name.charAt(0);

	if (lodash.random(0, 1)) {
		return letter.toLowerCase();
	} else {
		return letter.toUpperCase();
	}
};

// var getRandomFaceLibrary = (type) => {
// 	const baseURL = "https://staging.buzzradar.com/ai/randomFace/";

// 	var totalImages; // total images on rackspace
// 	if (type == "male") {
// 		totalImages = 35;
// 	} else {
// 		totalImages = 33;
// 	}

// 	var id = "00000" + lodash.random(1, totalImages);
// 	var maxChar = 6;

// 	if (id.length > maxChar) id = id.slice(id.length - maxChar, id.length);

// 	return `${baseURL}${type}/${id}.jpg`;
// };

export default router;
