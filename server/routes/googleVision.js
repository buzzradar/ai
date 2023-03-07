import express from "express";
import { ImageAnnotatorClient } from "@google-cloud/vision";

var router = express.Router();
// console.log("GOOGLE KEY CHECK....");
// console.log(process.env.GOOGLE_CLOUD_BUZZ_KEY);

var gVisionClient = new ImageAnnotatorClient({
	credentials: JSON.parse(process.env.GOOGLE_CLOUD_BUZZ_KEY),
});

// Define a POST route that analyzes the sentiment of a text
router.post("/", async (req, res) => {

	// https://cloud.google.com/vision/docs/reference/rest/v1/AnnotateImageResponse#Likelihood

	try {
		// var [result] = await gVisionClient.labelDetection("./testAssets/testImage.jpeg");
		var [result] = await gVisionClient.labelDetection("https://pbs.twimg.com/profile_images/1562026991741812737/41K8x-B2.jpg");
        // var [result] = await gVisionClient.faceDetection("https://pbs.twimg.com/profile_images/1562026991741812737/41K8x-B2.jpg");
        console.log ("result:", result);

		var labels = result.labelAnnotations;
		console.log("Labels:");
		labels.forEach((label) => console.log(label.description));

		res.status(200).json({
			result: result,
		});

	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "ERROR: " + err });
	}
});

export default router;
