import express from "express";
import lodash from "lodash";
// import namesFemale from "../assets/names-female.json";
// import namesMale from "../assets/names-male.json";
// import namesSurnames from "../assets/names-surnames.json";

import { createRequire } from "node:module";
var require = createRequire(import.meta.url);

var namesFemale = require("../assets/names-female.json");
var namesMale = require("../assets/names-male.json");
var namesSurnames = require("../assets/names-surnames.json");

const router = express.Router();
const genPhotosURL = "https://api.generated.photos/api/v1/faces?api_key=";


router.post("/", async (req, res) => {
	const { type } = req.body; // female or male if not specified, random

	console.log("we want type:", type);

	let ranProfile_OBJ = getRandomProfile(type);

	// * options for generated.photos: https://generated.photos/account#apikey
	const page = "1";
	const per_page = "5";
	const age = lodash.sample(["adult", "young-adult"]);
	const order = "random";


	try {

		let url = genPhotosURL + process.env.GPHOTOS_API_KEY + `&page=${page}&per_page=${per_page}&gender=${ranProfile_OBJ.type}&age=${age}&order_by=${order}`;

		console.log ("url:", url);

		ranProfile_OBJ.genFaces = await getGenPhoto(url);

		res.status(200).send(ranProfile_OBJ);
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

		res.status(status).send({ error: status, statusText: statusText });
	}
});

async function getGenPhoto(url) {
	// Default options are marked with *
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
		})
		.finally((e) => {
			return e;
		});

	return response;
}

var getRandomProfile = (type) => {
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
