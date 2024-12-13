const amqp = require("amqplib");

module.exports = {
    startSubscriber: async () => {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        const exchange = 'user_events';
      
        await channel.assertExchange(exchange, 'fanout', { durable: true });
        const queue = 'authentication_service';
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, exchange, 'user.*');
      
        channel.consume(queue, (msg) => {
            if (msg !== null) {
                console.log(`Message received: ${JSON.stringify(msg)}`);
                console.log(`\tExchange: ${msg.fields.exchange}`);
                console.log(`\tRouting key: ${msg.fields.routingKey}`);
                
                const messageContent = JSON.parse(msg.content.toString());
                console.log(`\tContent: ${JSON.stringify(messageContent)}`);
                
                channel.ack(msg);
            }
        });

        console.log("Subscriber component started");
    }
}