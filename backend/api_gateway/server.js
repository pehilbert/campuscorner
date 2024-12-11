const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/*
Endpoint: POST /api/auth
Description: Checks credentials with authentication service if correct body provided,
creates a token with user's ID if OK, otherwise forwards
failure response.
*/
app.post("/api/auth", async (req, res) => {
    console.log("Request for authentication received");

    if (!req.body.username || !req.body.password) {
        console.log("Not all required data was provided.");
        return res.status(400).send({message: "Not all required data provided"});
    }

    const data = {username: req.body.username, password: req.body.password};

    try {
        const result = await axios.post(`${process.env.AUTH_SERVICE_HOST}/api/auth`, data);

        console.log("Response OK. Response data from server:");
        console.log(result.data);
        
        const token = jwt.sign({id: result.data.id}, process.env.JWT_SECRET_KEY, {expiresIn: '1h'});
        console.log("JWT created successfully. Sending to client.");

        return res.status(200).send({message: result.data.message, token});
    } catch (error) {
        console.error("Error with authentication service:", error);
        
        if (error.response) {
            return res.status(error.response.status).send(error.response.data);
        }
        
        return res.status(500).send({message: "Server Error"});
    }
});

app.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
});