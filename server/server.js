import express from "express";
import cors from "cors";
import codexRouter from "./routes/codex.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
	res.status(200).send({
		message: "Hello from Buzz AI server v2",
	});
});


app.use ("/codex", codexRouter);

app.listen(7347, () => console.log("AI server started on http://localhost:7347"));
