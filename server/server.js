import express from "express";
import cors from "cors";
import codexRouter from "./routes/codex.js";
// import fakeprofileRouter from "./routes/fakeprofile";

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
// app.use ("/fakeprofile", fakeprofileRouter);

app.listen(7347, () => console.log("AI server started on http://localhost:7347"));
