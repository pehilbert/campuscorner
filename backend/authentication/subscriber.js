const amqp = require("amqplib");
const dbUtil = require("./util/database_util");

module.exports = {
    startSubscriber: async () => {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        const exchange = 'user_events';
      
        await channel.assertExchange(exchange, 'fanout', { durable: true });
        const queue = 'authentication_service';
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, exchange, 'user.*');
      
        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                console.log(`Message received: ${JSON.stringify(msg)}`);
                console.log(`\tExchange: ${msg.fields.exchange}`);
                console.log(`\tRouting key: ${msg.fields.routingKey}`);
                
                const messageContent = JSON.parse(msg.content.toString());
                console.log(`\tContent: ${JSON.stringify(messageContent)}`);
                
                switch (msg.fields.routingKey.split('.')[1]) {
                    /* Updated event */
                    case 'updated':

                    updates = []
                    values = []

                    if (messageContent.id && messageContent.data) {
                        if (messageContent.data.username) {
                            updates.push("username = ?");
                            values.push(messageContent.username);
                        }

                        if (messageContent.data.email) {
                            updates.push("email = ?");
                            values.push(messageContent.email);
                        }

                        console.log("Updating user, updates =", updates, "values =", values);

                        try {
                            const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ? LIMIT 1`;
                            values.push(parseInt(messageContent.id));
                    
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
                                console.log("Succesfully updated user");
                            }
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