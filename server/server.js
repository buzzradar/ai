import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import openaiRouter from "./routes/openai.js";
import cnlRouter from "./routes/cnl.js";
import randomProfile from "./routes/randomProfile.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const version = "0.0.4c";

app.get("/", async (req, res) => {
	res.status(200).send({
		message: "Hello! Buzz AI server v" + version + " is running.",
	});
});


app.use ("/cnl", cnlRouter);
app.use ("/randomProfile", randomProfile);
app.use ("/openai", openaiRouter);

app.listen(7347, () => console.log("AI server started on http://localhost:7347"));
