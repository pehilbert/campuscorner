const bcrypt = require('bcryptjs');
const express = require("express");
const cors = require("cors");
const dbUtil = require("./util/database_util");

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

/* User data endpoints */

/*
Endpoint: POST /api/users
Description: Creates a new user, returns ID if successful
*/
app.post("/api/users", async (req, res) => {
    console.log("Received request to create user");

    if (!req.body.username || !req.body.password || !req.body.email) {
        console.log("Request was missing required fields");
        return res.status(400).send({message: "Missing required data fields"});
    }

    try {
        const sql = 'INSERT INTO users (username, email, pass) VALUES (?, ?, ?)';

        const hashedPassword = await bcrypt.hash(req.body.password, parseInt(process.env.SALT_ROUNDS));
        const values = [req.body.username, req.body.email, hashedPassword];
        
        console.log("Executing query...");

        const conn = await dbUtil.connectToDatabase();
        const [result, fields] = await conn.execute(sql, values);
        await conn.end();

        console.log("Result:", result);
        console.log("Fields:", fields);
        
        if (result.insertId) {
            console.log("Query successful");
            return res.status(201).send({id: result.insertId.toString()});
        }

        console.log("Query failed");
        return res.status(500).send({message: "Failed to create user"});
    } catch (error) {
        console.error("Error:", error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).send({ message: "Username or email already exists" });
        }

        return res.status(500).send({ message: "Server error" });
    }
});

/*
Endpoint: GET /api/users/:id
Description: Returns the username and email of user with ID
*/
app.get("/api/users/:id", async (req, res) => {
    console.log(`Received request to read user, id=${req.params.id}`);
    const idNum = parseInt(req.params.id);

    if (isNaN(idNum)) {
        console.log("ID was invalid");
        return res.status(400).send({message: "Invalid user ID"});
    }

    try {
        const sql = `SELECT username, email FROM users WHERE id = ?`;
        const values = [idNum];

        console.log("Exeucting query...");

        const conn = await dbUtil.connectToDatabase();
        const [rows, fields] = await conn.execute(sql, values);
        await conn.end();

        console.log("Rows:", rows);
        console.log("Fields:", fields);

        if (rows.length === 0) {
            console.log(`User with ID ${idNum} not found`);
            return res.status(404).send({message: "Not found"});
        }

        console.log(`User found: ${rows[0]}`);
        return res.status(200).send(rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).send({message: "Server error"});
    }
});

/*
Endpoint: PUT /api/users/:id
Description: Updates information provided in body for user with ID
*/
app.put("/api/users/:id", async (req, res) => {
    console.log(`Received request to update user, id=${req.params.id}`);
    const idNum = parseInt(req.params.id);

    if (isNaN(idNum)) {
        console.log("ID was invalid");
        return res.status(400).send({message: "Invalid user ID"});
    }

    const updates = [];
    const values = [];

    if (req.body.username) {
        updates.push("username = ?");
        values.push(req.body.username);
    }
    if (req.body.email) {
        updates.push("email = ?");
        values.push(req.body.email);
    }
    if (req.body.password) {
        const hashedPassword = await bcrypt.hash(req.body.password, parseInt(process.env.SALT_ROUNDS || 10));
        updates.push("pass = ?");
        values.push(hashedPassword);
    }
    
    if (updates.length === 0) {
        console.log("Request was missing required fields");
        return res.status(400).send({ message: "No fields provided for update" });
    }

    try {
        const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ? LIMIT 1`;
        values.push(idNum);

        const conn = await dbUtil.connectToDatabase();
        const [result, fields] = await conn.execute(sql, values);
        await conn.end();

        console.log("Result:", result);
        console.log("Fields:", fields);

        if (result.affectedRows === 0) {
            return res.status(404).send({message: "User not found"});
        }

        return res.status(200).send({message: "User updated successfully"});
    } catch (error) {
        console.error(error);
        return res.status(500).send({message: "Server error"});
    }
});

/*
Endpoint: DELETE /api/users/:id
Description: Deletes user with ID
*/
app.delete("/api/users/:id", async (req, res) => {
    console.log(`Received request to delete user, id=${req.params.id}`);
    const idNum = parseInt(req.params.id);

    if (isNaN(idNum)) {
        console.log("ID was invalid");
        return res.status(400).send({message: "Invalid user ID"});
    }

    try {
        const sql = `DELETE FROM users WHERE id = ?`;
        const values = [idNum];

        const conn = await dbUtil.connectToDatabase();
        const [result, fields] = await conn.execute(sql, values);
        await conn.end();

        console.log("Result:", result);
        console.log("Fields:", fields);

        if (result.affectedRows === 0) {
            return res.status(404).send({message: "User not found"});
        }

        return res.status(200).send({message: "User deleted successfully"});
    } catch (error) {
        console.error(error);
        return res.status(500).send({message: "Server error"});
    }
});

/* Authentucation endpoints */

/*
Endpoint: POST /api/auth
Description: Given a username and password, checks credentials against
database, returns OK if correct
*/
app.post("/api/auth", async (req, res) => {
    console.log("Received request for authentication");

    try {
        if (!req.body.username || !req.body.password) {
            console.log("Some data was missing from request");
            return res.status(400).send({message: "Missing required data fields"});
        }

        const sql = `SELECT pass FROM users WHERE username = ?`;
        const values = [req.body.username];

        console.log("Querying database...");

        const conn = await dbUtil.connectToDatabase();
        const [rows, fields] = await conn.execute(sql, values);
        await conn.end();

        if (rows.length === 0) {
            console.log("Authentication failed");
            return res.status(401).send({message: "Username or password was incorrect"});
        }

        const hashedPasswordFromDatabase = rows[0].pass;

        if (await bcrypt.compare(req.body.password, hashedPasswordFromDatabase)) {
            console.log("Authentication successful");
            return res.status(200).send({message: "Correct password"});
        }

        console.log("Authentication failed");
        return res.status(401).send({message: "Username or password was incorrect"});
    } catch (error) {
        console.error(error);
        return res.status(500).send({message: "Server error"});
    }
});

/* Start the server */

app.listen(port, () => {
    console.log(`Authentication service API running on ${port}`);
});