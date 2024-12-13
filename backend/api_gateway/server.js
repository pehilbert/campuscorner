const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const {publishEvent} = require("./rabbitmq_util");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/* Users endpoints */

/*
Endpoint: GET /api/users/test_rabbitmq
Description: Sends test event to rabbitmq
*/
app.get("/api/users/test_rabbitmq", async (req, res) => {
    console.log("Request to test users RabbitMQ received");
    
    try {
        await publishEvent('user_events', 'test', {message: "Hello world!"});
        console.log("Published event to RabbitMQ");
        return res.status(200).send({message: "Test successful"});
    } catch (error) {
        console.error("Something went wrong publishing to RabbitMQ:", error);
        return res.status(500).send({message: "Something went wrong"});
    }
});

/*
Endpoint: GET /api/users/:id
Description: Returns username and email of the user
*/
app.get("/api/users/:id", async (req, res) => {
    console.log("Request to fetch user info received");

    try {
        const response = await axios.get(`${process.env.AUTH_SERVICE_URL}/api/users`);

        console.log("Data fetched:");
        console.log(JSON.stringify(response.data));

        return res.status(response.status).send(response.data);
    } catch (error) {
        console.error("Error fetching user info:", error);

        if (error.response) {
            return res.status(error.response.status).send(error.response.data);
        }

        return res.status(500).send({message: "Server error"});
    }
});

/*
Endpoint: POST /api/users
Description: Directly requests for the authentication service to
create a user. If successful, publishes an event for other services
to create the user as well. This is so that we can get a user ID.
*/
app.post("/api/users", async (req, res) => {
    console.log("Request to create user received");

    if (!req.body.username || !req.body.password || !req.body.email) {
        console.log("Not all required data was provided.");
        return res.status(400).send({message: "Not all required data provided"});
    }

    try {
        const data = {username: req.body.username, password: req.body.password, email: req.body.email};
        const response = await axios.post(`${process.env.AUTH_SERVICE_URL}/api/users`, data);
        const id = response.data.id;

        await publishEvent('user_events', 'created', {id, data: req.body});
        return res.status(201).send({message: "User successfully created"});
    } catch (error) {
        console.error("Error creating user:", error);

        if (error.response) {
            return res.status(error.response.status).send(error.response.data);
        }

        return res.status(500).send({message: "Server error"});
    }
});

/*
Endpoint: PUT/DELETE /api/users/:id
Description: Publishes events for updating and deleting users
*/
app.put("/api/users/:id", async (req, res) => {
    console.log("Request to update user received");

    try {
        const id = parseInt(req.params.id);
        await publishEvent('user_events', 'updated', {id, data: req.body});
        return res.status(200).send({message: "User successfully updated"});
    } catch (error) {
        console.error("Error publishing update event:", error);
        return res.status(500).send({message: "Server error"});
    }
});

app.delete("/api/users/:id", async (req, res) => {
    console.log("Request to delete user received");

    try {
        const id = parseInt(req.params.id);
        await publishEvent('user_events', 'deleted', {id, data: req.body});
        return res.status(200).send({message: "User successfully deleted"});
    } catch (error) {
        console.error("Error publishing delete event:", error);
        return res.status(500).send({message: "Server error"});
    }
});

/* Authentication endpoints*/

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
        const result = await axios.post(`${process.env.AUTH_SERVICE_URL}/api/auth`, data);

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