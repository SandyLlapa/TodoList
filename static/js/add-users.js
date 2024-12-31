import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const USER_ID = 0; // TODO: insert database user ID
const USERNAME = `C4131F24S002U${USER_ID}`;

console.info('Connecting to database...');

let connection;
try {
    connection = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: USERNAME,
        database: USERNAME,
        password: 'password', // TODO: insert database password
    });
} catch (error) {
    console.error('Failed to connect to database:');
    console.error(error);
    process.exit(1);
}

const SALT_ROUNDS_COUNT = 10;

const USERS = [
    // Place any of the new users you would like to add below in the following format:
    ['new username here', 'new password here'],
];

try {
    for (const [username, plaintextPassword] of USERS) {
        const hashedPassword = bcrypt.hashSync(plaintextPassword, SALT_ROUNDS_COUNT);
        connection.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        console.info(`Successfully created user "${username}".`)
    }

    await connection.commit();
} catch (error) {
    console.error('Failed to add users to the users table:');
    console.error(error);
    process.exitCode = 1;
} finally {
    await connection.end();
}