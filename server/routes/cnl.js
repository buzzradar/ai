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
            content: "Hello world, how are you doing!",
            type: 'PLAIN_TEXT',
        };

        // Detects the sentiment of the text
        const [result] = await client.analyzeSentiment({ document });
        const sentiment = result.documentSentiment;

        res.status(200).json({
            text: document.content,
            sentiment: {
                score: sentiment.score,
                magnitude: sentiment.magnitude,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'ERROR: ' + err });
    }

});

export default router;





