const mailjet = require("node-mailjet");

module.exports = {
    sendEmail: async (toEmailAddress, subject, text, html) => {
        console.log("Trying to send email to", toEmailAddress);

        try {
            console.log(process.env.MJ_APIKEY_PUBLIC);

            const client = mailjet.apiConnect(
                process.env.MJ_APIKEY_PUBLIC,
                process.env.MJ_APIKEY_PRIVATE
            );

            const result = await client.post("send", {'version': 'v3.1'}).request({
                "Messages": [
                    {
                        "From": {
                            "Email": process.env.SENDER_EMAIL,
                            "Name": process.env.SENDER_NAME
                        },
                        "To": [
                            {
                                "Email": toEmailAddress
                            }
                        ],
                        "Subject": subject,
                        "TextPart": text || "",
                        "HTMLPart": html || ""
                    }
                ]
            });
            
            console.log("Email successfully sent.");
            console.log(result.body);
        } catch (error) {
            console.error(error);
        }
    }
}