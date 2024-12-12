const amqp = require('amqplib');

module.exports = {
    publishEvent: async (exchange, event, data) => {
        const connection = await amqp.connect(`amqp://${process.env.RABBITMQ_URL}`);
        const channel = await connection.createChannel();

        await channel.assertExchange(exchange, 'fanout', { durable: true });
        const routingKey = `user.${event.toLowerCase()}`;

        channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(data)));
        console.log(`Published event: ${event}`);

        await channel.close();
        await connection.close();
    }
}