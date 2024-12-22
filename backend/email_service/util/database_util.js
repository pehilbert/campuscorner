const mysql = require('mysql2/promise');

module.exports = {
    connectToDatabase: async () => {
        const MAX_RETRIES = 5;
        let retries = 0;

        while (retries < MAX_RETRIES) {
            try {
                const connection = await mysql.createConnection({
                    host: process.env.DB_HOST,
                    user: process.env.DB_USER,
                    password: process.env.DB_PASSWORD,
                    database: process.env.DB_NAME,
                });

                console.log('Connected to the database');
                return connection;
            } catch (err) {
                console.error(`Database connection failed: ${err.message}`);
                retries += 1;
                console.log(`Retrying (${retries}/${MAX_RETRIES})...`);
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
        }

        throw new Error('Could not connect to the database after several attempts');
    }
}
