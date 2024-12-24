const API_GATEWAY_HOST = "localhost:5000";
const EMAIL_SERVICE_HOST = "localhost:5002";
const axios = require("axios");

async function testCreateUser(data) {
    try {
        const response = await axios.post(`http://${API_GATEWAY_HOST}/api/users`, data);
        console.error("Test create user successful, response:", JSON.stringify(response.data));
        return response.data.id;
    } catch (error) {
        console.error("Test create user failed, response:", error.status, error.data);
        return null;
    }
}

async function testUser(id) {
    console.log("Testing user ID", id);
    
    try {
        console.log("Getting verification status");
        const verificationStatus = await axios.get(`http://${EMAIL_SERVICE_HOST}/api/status/${id}`);
        console.log("Response data:", JSON.stringify(verificationStatus.data));

        console.log("Sending email to user");
        const sendEmail = await axios.get(`http://${EMAIL_SERVICE_HOST}/api/code/${id}`);
        console.log("Response:", JSON.stringify(sendEmail.data));
    } catch (error) {
        console.error(error.status, error.response.data);
    }
}

//testCreateUser({username: "peter", password: "password123", email: "pehilbert03@gmail.com"});
testUser('1');