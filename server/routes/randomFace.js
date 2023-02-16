import express from "express";
import lodash from "lodash";

const router = express.Router();

router.post("/", async (req, res) => {

	const type = req.body.type; // female or male if not specified, random

	console.log ("we want type:", type);

	var face = getRandomFaceRackspace(type);

	try {
		res.status(200).send({
			face: face,
		});
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

var getRandomFaceRackspace = (type) => {
	const baseURL = "http://0c8eed0b95e8001351c1-cc7a500d9b10d65e67a8ddf30b9c21f5.r33.cf3.rackcdn.com/faces/";

	if (!type) {
		if (lodash.random(0, 1)) {
			type = "female";
		} else {
			type = "male";
		}
	}
	var totalImages;
	if (type == "female") {
		totalImages = 20;
	} else {
		totalImages = 23;
	}

	var id = "00000" + lodash.random(1, totalImages);
	var maxChar = 6;

	if (id.length > maxChar) id = id.slice(id.length - maxChar, id.length);

	return {
		type: type,
		url: `${baseURL}${type}/${id}.jpg`,
	};
};

export default router;
