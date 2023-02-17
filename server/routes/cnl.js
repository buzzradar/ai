import express from "express";
const router = express.Router();
import { LanguageServiceClient } from "@google-cloud/language";
import lunarArcJSON from '../apiKeys/lunar-arc-378014-d3455e8e0581.json' assert { type: "json" };

console.log ("%c ➜ ", "background:#00FFbc;", "lunarArcJSON", lunarArcJSON);


// Creates a client
const client = new LanguageServiceClient({
    credentials: lunarArcJSON,
});

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





