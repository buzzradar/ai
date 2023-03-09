import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import openaiRouter from "./routes/openai.js";
import cnlRouter from "./routes/cnl.js";
import gVision from "./routes/googleVision.js";
import anonProfile from "./routes/anonProfile.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const version = "0.0.5a";

app.get("/", async (req, res) => {
	res.status(200).send({
		message: "Hello! Buzz AI server v" + version + " is running.",
	});
});

app.use("/cnl", cnlRouter);
app.use("/anonProfile", anonProfile);
app.use("/openai", openaiRouter);
app.use("/gVision", gVision);

app.listen(7347, () => console.log("AI server started on http://localhost:7347"));
Ì