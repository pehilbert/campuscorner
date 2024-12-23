const express = require("express");
const cors = require("cors");
const {startSubscriber} = require("./subscriber");

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.get("/test", async (req, res) => {
    res.status(200).send("Hello from email service!");
});

app.listen(port, () => {
    console.log(`Email service API running on ${port}`);
});

/* Start asynchronous subscriber component (RabbitMQ) */
startSubscriber();