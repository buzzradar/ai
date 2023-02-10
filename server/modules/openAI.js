import * as dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";


export default function openAI() {
	dotenv.config();
	const configuration = new Configuration({
		organization: process.env.OPENAI_API_ORG,
		apiKey: process.env.OPENAI_API_KEY,
	});
	return new OpenAIApi(configuration);
}
