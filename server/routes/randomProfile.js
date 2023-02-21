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

router.post("/", async (req, res) => {
	const type = req.body.type; // female or male if not specified, random

	try {
		res.status(200).send(getRandomProfile(type));
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
			userName = name.toLowerCase();
			break;
		case 1:
			userName = surName.toLowerCase();
			break;
		case 2:
			userName = name.toLowerCase() + surName;
			break;
		case 3:
			userName = name.toLowerCase() + surName.charAt(0);
			break;
		case 4:
			userName = surName.toLowerCase() + name;
			break;
		case 5:
			userName = name.charAt(0) + "_" + surName;
			break;
		case 6:
			userName = name.toLowerCase() + "_" + surName;
			break;
		case 7:
			userName = name.charAt(0) + "-" + surName;
			break;
		case 8:
			userName = name.toLowerCase() + "-" + surName;
			break;
	}

	if (!lodash.random(0, 2)) userName += lodash.random(2, 1000);

	return {
		type: type,
		url: getRandomFaceRackspace(type),
		name: name,
		surName: surName,
		userName: userName,
	};
};

var getRandomFaceRackspace = (type) => {
	const baseURL = "http://0c8eed0b95e8001351c1-cc7a500d9b10d65e67a8ddf30b9c21f5.r33.cf3.rackcdn.com/faces/";

	var totalImages; // total images on rackspace
	if (type == "male") {
		totalImages = 35;
	} else {
		totalImages = 33;
	}

	var id = "00000" + lodash.random(1, totalImages);
	var maxChar = 6;

	if (id.length > maxChar) id = id.slice(id.length - maxChar, id.length);

	return `${baseURL}${type}/${id}.jpg`;
};

export default router;
