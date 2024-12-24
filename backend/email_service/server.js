const express = require("express");
const cors = require("cors");
const {startSubscriber} = require("./subscriber");
const {sendEmail} = require("./util/email_util");
const dbUtil = require("./util/database_util");

const VERIFICATION_EMAIL_SUBJECT = "CampusCorner - Verify Your Email";
const VERIFICATION_EMAIL_CONTENT = `
<p>Hello,</p>
<br/>
<p>Your CampusCorner verification code is <b>CODE</b></p>
`;

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

/************************/
/* SYNCHRONOUS REST API */
/************************/

app.get("/test", async (req, res) => {
    res.status(200).send("Hello from email service!");
});

/*
Endpoint: GET /api/status/<user_id>
Description: Retrieves a user's email verification status
*/
app.get("/api/status/:id", async (req, res) => {
    console.log("Request to get status for user ID =", req.params.id);

    try {
        const sql = "SELECT verified FROM users WHERE id = ?";
        const values = [parseInt(req.params.id)];

        const conn = await dbUtil.connectToDatabase();
        const [rows, fields] = await conn.execute(sql, values);
        await conn.end();

        console.log("Rows:", rows);
        console.log("Fields:", fields);

        if (rows.length === 0) {
            console.log(`User with ID ${req.params.id} not found`);
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
Endpoint: GET /api/code/<user_id>
Description: Sends an email to the user's email with their verification code
*/
app.get("/api/code/:id", async (req, res) => {
    console.log("Request to send code to user's email, id =", req.params.id);

    try {
        console.log("Querying database...");

        const sql = "SELECT email, code FROM users WHERE id = ?";
        const values = [parseInt(req.params.id)];

        const conn = await dbUtil.connectToDatabase();
        const [rows, fields] = await conn.execute(sql, values);

        console.log("Rows:", rows);
        console.log("Fields:", fields);

        if (rows.length === 0) {
            console.log("User not found");
            return res.status(404).send({message: "Not found"});
        }

        console.log("Sending email...");

        const finalEmailContent = VERIFICATION_EMAIL_CONTENT.replace("CODE", rows[0].code).trim();
        await sendEmail(rows[0].email, VERIFICATION_EMAIL_SUBJECT, null, finalEmailContent);

        console.log("Email successfully sent");

        return res.status(200).send({message: "Email sent to email address associated with account"});
    } catch (error) {
        console.error(error);
        return res.status(500).send({message: "Server error"});
    }
});

/*
Endpoint: POST /api/verify/:id
Description: Tries to verify a user's email using a verification code provided in the
body
*/
app.post("/api/verify/:id", async (req, res) => {
    console.log("Request to verify user's email, id =", req.params.id);

    if (!req.body.code) {
        console.log("Code not provided in the body");
        return res.status(400).send({message: "No code provided"});
    }

    try {
        console.log("Finding user code...");

        const sql = "SELECT code, verified FROM users WHERE id = ?";
        const values = [parseInt(req.params.id)];

        const conn = await dbUtil.connectToDatabase();
        let [rows, fields] = await conn.execute(sql, values);

        console.log("Rows:", rows);
        console.log("Fields:", fields);

        if (rows.length === 0) {
            console.log(`User with ID ${req.params.id} not found`);
            return res.status(404).send({message: "Not found"});
        }

        console.log(`User found: ${rows[0]}`);

        if (rows[0].verified === true) {
            console.log("User was already verified");
            return res.status(400).send({message: "User already verified"});
        }

        if (req.body.code.toUpperCase() === rows[0].code.toUpperCase()) {
            console.log("Code was correct. Updating status...");

            let [result, fields] = await conn.execute("UPDATE users SET verified = TRUE WHERE id = ? LIMIT 1", [parseInt(req.params.id)]);

            console.log("Result:", result);
            console.log("Fields:", fields);

            await conn.end();

            return res.status(200).send({message: "User successfully verified"});
        }

        return res.status(400).send({message: "Invalid or incorrect code"});
    } catch (error) {
        console.error(error);
        return res.status(500).send({message: "Server error"});
    }
});

/* Start the synchrnous REST API server */

app.listen(port, () => {
    console.log(`Email service API running on ${port}`);
});

/* Start asynchronous subscriber component (RabbitMQ) */
startSubscriber();