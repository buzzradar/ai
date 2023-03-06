
import express from "express";
const router = express.Router();
import { googleVision } from "@google-cloud/vision";
//import lunarArcJSON from '../apiKeys/lunar-arc-378014-d3455e8e0581.json' assert { type: "json" };

// console.log("GOOGLE KEY CHECK....");
// console.log(process.env.GOOGLE_CLOUD_KEY);

// Creates a client
const vision = new googleVision({
    credentials: JSON.parse(process.env.GOOGLE_CLOUD_BUZZ_KEY)
});

const client = new vision.ImageAnnotatorClient();

// Define a POST route that analyzes the sentiment of a text
router.post('/', async (req, res) => {
    
    try {
        const document = {
            content: req.body.copyToAnalyse,
            type: 'PLAIN_TEXT',
        };

        // The encoding type of the text, default is UTF8
        const encodingType = 'UTF8';

        // The features to extract from the text
        const features = {
            extractSyntax: false,
            extractEntities: false,
            extractDocumentSentiment: true,
            extractEntitySentiment: true,
            classifyText: true,
        };

        const [result] = await client.annotateText({
            document: {content: document.content, type: 'PLAIN_TEXT', language: 'en'}, 
            features: features, 
            encodingType: encodingType
        });


        res.status(200).json({
            result: result,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'ERROR: ' + err });
    }

});

export default router;





