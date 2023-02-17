import express from "express";
import * as dotenv from 'dotenv';
import cors from "cors";
import codexRouter from "./routes/codex.js";
import cnlRouter from "./routes/cnl.js";
// import fakeprofileRouter from "./routes/fakeprofile";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const version = "0.0.1";

app.get("/", async (req, res) => {
	res.status(200).send({
		message: "Hello! Buzz AI server v" + version + " is running.",
	});
});


app.use ("/codex", codexRouter);
app.use ("/cnl", cnlRouter);
// app.use ("/fakeprofile", fakeprofileRouter);

if (process.env.NODE_ENV === 'production') {
	const server = "http://localhost:7347/";
} else {
	const server = "https://cnl.onrender.com";
}

function displayServer(){
	var server = "http://localhost:7347/";
	if (process.env.NODE_ENV === 'production') {
		server = "https://cnl.onrender.com";
	}
	console.log("AI server started on " + server);
}

app.listen(7347, () => displayServer() );
