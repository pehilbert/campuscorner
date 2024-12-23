const amqp = require("amqplib");
const dbUtil = require("./util/database_util");

module.exports = {
    startSubscriber: async () => {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        const exchange = 'user_events';
      
        await channel.assertExchange(exchange, 'fanout', { durable: true });
        const queue = 'email_service';
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, exchange, 'user.*');
      
        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                console.log(`Message received: ${JSON.stringify(msg)}`);
                console.log(`\tExchange: ${msg.fields.exchange}`);
                console.log(`\tRouting key: ${msg.fields.routingKey}`);
                
                const messageContent = JSON.parse(msg.content.toString());
                console.log(`\tContent: ${JSON.stringify(messageContent)}`);

                if (messageContent.origin === 'email_service') {
                    console.log("Skipping message from our own origin");
                    return;
                }
                
                switch (msg.fields.routingKey.split('.')[1]) {
                    /*Created event */
                    case 'created':

                    if (messageContent.id && messageContent.data && messageContent.data.email) {
                        console.log("Creating a new user, ID =", messageContent.id, "email =", messageContent.data.email);

                        try {
                            const sql = `INSERT INTO users (id, email) VALUES (?, ?)`;
                            const values = [parseInt(messageContent.id), messageContent.data.email];
                    
                            console.log("Executing query...");
                    
                            const conn = await dbUtil.connectToDatabase();
                            const [result, fields] = await conn.execute(sql, values);
                            await conn.end();
                    
                            console.log("Result:", result);
                            console.log("Fields:", fields);
                    
                            console.log("User successfully created");
                        } catch (error) {
                            console.error(error);
                        }
                    } else {
                        console.log("No ID and/or data provided to create user.");
                    }

                    break;

                    /* Updated event */
                    case 'updated':

                    if (messageContent.id && messageContent.data && messageContent.data.email) {
                        console.log("Updating user, ID =", messageContent.id);

                        try {
                            const sql = `UPDATE users SET email = ?, verified = FALSE WHERE id = ? LIMIT 1`;
                            const values = [messageContent.data.email, parseInt(messageContent.id)];
                            
                            const fallbackSql = `INSERT INTO users (id, email) VALUES (?, ?)`;
                            const fallbackValues = [parseInt(messageContent.id), messageContent.data.email];
                    
                            console.log("Executing query...");
                    
                            const conn = await dbUtil.connectToDatabase();
                            let [result, fields] = await conn.execute(sql, values);
                    
                            console.log("Result:", result);
                            console.log("Fields:", fields);
                    
                            if (result.affectedRows === 0) {
                                console.log("Requested user not found, creating a new one");
                                console.log("Executing query...");

                                [result, fields] = await conn.execute(fallbackSql, fallbackValues);

                                console.log("Result:", result);
                                console.log("Fields:", fields);

                                console.log("Successfuilly created user");
                            }
                            else {
                                console.log("Succesfully updated user");
                            }

                            await conn.end();
                        } catch (error) {
                            console.error(error);
                        }
                    } else {
                        console.log("No ID and/or data provided to update.");
                    }

                    break;

                    /* Deleted event */
                    case 'deleted':

                    if (messageContent.id) {
                        console.log("Deleting user ID", messageContent.id);

                        try {
                            const sql = `DELETE FROM users WHERE id = ?`;
                            const values = [parseInt(messageContent.id)];
                    
                            console.log("Executing query...");
                    
                            const conn = await dbUtil.connectToDatabase();
                            const [result, fields] = await conn.execute(sql, values);
                            await conn.end();
                    
                            console.log("Result:", result);
                            console.log("Fields:", fields);
                    
                            if (result.affectedRows === 0) {
                                console.log("Requested user not found");
                            }
                            else {
                                console.log("Succesfully deleted user");
                            }
                        } catch (error) {
                            console.error(error);
                        }
                    } else {
                        console.log("No ID provided to delete.");
                    }

                    break;
                }

                channel.ack(msg);
            }
        });

        console.log("Subscriber component started");
    }
}