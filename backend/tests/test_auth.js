const axios = require("axios");
const AUTH_API_ENDPOINT = "http://localhost:5001";
const API_GATEWAY_ENDPOINT = "http://localhost:5000";

function testLog(testId, message) {
    console.log(`Test #${testId} | ${message}`);
}

async function testCreateUser(testId, username, email, password) {
    try {
        testLog(testId, "Testing create user...");
        testLog(testId, `username=${username}, email=${email}, password=${password}`);
        const response = await axios.post(`${AUTH_API_ENDPOINT}/api/users`, {username, email, password});
        testLog(testId, `Response: ${response.status} ${JSON.stringify(response.data)}`);

        return response.data.id;
    } catch (error) {
        testLog(testId, `Error: ${error.status} ${JSON.stringify(error.response.data)}`);
        return -1;
    }
}

async function testGetUser(testId, id) {
    try {
        testLog(testId, "Testing get user...");
        testLog(testId, `id=${id}`);
        const response = await axios.get(`${AUTH_API_ENDPOINT}/api/users/${id}`);
        testLog(testId, `Response: ${response.status} ${JSON.stringify(response.data)}`);

        return response.data;
    } catch (error) {
        testLog(testId, `Error: ${error.status} ${JSON.stringify(error.response.data)}`);
        testDeleteUser(testId, id);
        return null;
    }
}

async function testUpdateUser(testId, id, body) {
    try {
        testLog(testId, "Testing update user...");
        testLog(testId, `id=${id} body=${JSON.stringify(body)}`);
        const response = await axios.put(`${AUTH_API_ENDPOINT}/api/users/${id}`, body);
        testLog(testId, `Response: ${response.status} ${JSON.stringify(response.data)}`);

        return response.data;
    } catch (error) {
        testLog(testId, `Error: ${error.status} ${JSON.stringify(error.response.data)}`);
        testDeleteUser(testId, id);
        return null;
    }
}

async function testDeleteUser(testId, id) {
    try {
        testLog(testId, "Testing delete user...");
        testLog(testId, `id=${id}`);
        const response = await axios.delete(`${AUTH_API_ENDPOINT}/api/users/${id}`);
        testLog(testId, `Response: ${response.status} ${JSON.stringify(response.data)}`);

        return response.data;
    } catch (error) {
        testLog(testId, `Error: ${error.status} ${JSON.stringify(error.response.data)}`);
        return null;
    }
}

async function testAuthentication(testId, username, password) {
    try {
        testLog(testId, "Testing authentication...");
        testLog(testId, `username=${username}, password=${password}`);
        const response = await axios.post(`${API_GATEWAY_ENDPOINT}/api/auth`, {username, password});
        testLog(testId, `Response: ${response.status} ${JSON.stringify(response.data)}`);

        return response.data;
    } catch (error) {
        testLog(testId, `Error: ${error.status} ${JSON.stringify(error.response.data)}`);
        return null;
    }
}

// Adds the entry, gets it, updates it, and gets it again
async function testLifeCycle(testId, username, email, password) {
    testLog(testId, "FULL LIFECYCLE TEST");

    let id = await testCreateUser(testId, username, email, password);

    if (id === -1) {
        testLog(testId, "Test failed to create user.");
        return false;
    }

    let userData = await testGetUser(testId, id);

    if (!userData || userData.username !== username || userData.email !== userData.email) {
        testLog(testId, "Test failed to get created user.");
        return false;
    }

    let newUsername = username + "12345";
    let updateResult = await testUpdateUser(testId, id, {username: newUsername});

    if (!updateResult) {
        testLog(testId, "Test failed to update user.");
        return false;
    }

    userData = await testGetUser(testId, id);

    if (!userData || userData.username !== newUsername || userData.email !== userData.email) {
        testLog(testId, "Test failed to get updated user.");
        return false;
    }

    let deleteResult = await testDeleteUser(testId, id);

    if (!deleteResult) {
        testLog(testId, "Test failed to delete user.");
        return false;
    }

    testLog(testId, "FULL LIFECYCLE TEST PASSED");
    return true;
}

async function testAuthenticationLifeCycle(testId, username, email, password) {
    testLog(testId, "FULL AUTHENTICATION LIFECYCLE TEST");

    let id = await testCreateUser(testId, username, email, password);

    if (id === -1) {
        testLog(testId, "Test failed to create user.");
        return false;
    }

    let correctAuthResult = await testAuthentication(testId, username, password);

    if (!correctAuthResult) {
        testLog(testId, "Test failed to authenticate correct credentials.");
        return false;
    }

    let incorrectAuthResult = await testAuthentication(testId, username, password + "123");

    if (incorrectAuthResult) {
        testLog(testId, "Test failed to reject incorrect credentials.");
        return false;
    }

    let deleteResult = await testDeleteUser(testId, id);

    if (!deleteResult) {
        testLog(testId, "Test failed to delete user when done.");
        return false;
    }

    testLog(testId, "FULL AUTHENTICATION LIFECYCLE TEST PASSED");
}

async function test() {
    await testLifeCycle(1, "test", "test@example.com", "mysecretpassword");
    console.log();
    await testAuthenticationLifeCycle(2, "authtest", "authtest@example.com", "supersecretauthpassword");
}

test();