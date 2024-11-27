const express = require("express");

const app = express();
const port = process.env.PORT || 5000;

app.get("/test", async (req, res) => {
    return res.status(200).send("Hello from API Gateway!");
});

app.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
});