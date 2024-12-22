// The purpose of this file is to test the asynchronous data updates using RabbitMQ

const axios = require("axios");
const API_GATEWAY_HOST = "localhost:5000";

async function testCreateUser(data) {
    try {
        const response = await axios.post(`http://${API_GATEWAY_HOST}/api/users`, data);
        console.error("Test create user successful, response:", JSON.stringify(response.data));
        return response.data.id;
    } catch (error) {
        console.error("Test create user failed, response:", error);
        return null;
    }
}

async function testUpdateUser(id, data) {
    try {
        const response = await axios.put(`http://${API_GATEWAY_HOST}/api/users/${id}`, data);
        console.error("Test update user successful, response:", JSON.stringify(response.data));
    } catch (error) {
        console.error("Test update user failed, response:", error);
    }
}

async function testDeleteUser(id) {
    try {
        const response = await axios.delete(`http://${API_GATEWAY_HOST}/api/users/${id}`);
        console.error("Test delete user successful, response:", JSON.stringify(response.data));
    } catch (error) {
        console.error("Test delete user failed, response:", error);
    }
}

async function fullTest(data, updateData) {
    const userId = await testCreateUser(data);

    if (userId) {
        await testUpdateUser(userId, updateData);
        
        console.log("Waiting to test delete");
        await setTimeout(() => {}, 3000);

        await testDeleteUser(userId);
    }
}

fullTest({username: "test", password: "password123", email: "test@example.com"}, {username: "test1234"});