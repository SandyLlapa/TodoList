import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const USER_ID = 30; // TODO: insert database user ID
const USERNAME = `C4131F24S002U${USER_ID}`;

console.info('Connecting to database...');

let connection;
try {
    connection = await mysql.createConnection({
        host: 'cse-mysql-classes-01.cse.umn.edu',
        port: 3306,
        user: USERNAME,
        database: USERNAME,
        password: 'llapa016', // TODO: insert database password
    });
} catch (error) {
    console.error('Failed to connect to database:');
    console.error(error);
    process.exit(1);
}

console.info('Connected to database, creating users table...');

try {
    await connection.query(
        'CREATE TABLE IF NOT EXISTS users (\
            username VARCHAR(255) PRIMARY KEY,\
            password VARCHAR(255)\
        );'
    );
} catch (error) {
    console.error('Failed to create users table:');
    console.error(error);
    await connection.end();
    process.exit(1);
}

console.info('Successfully created users table, inserting admin user into users table...');

const SALT_ROUNDS_COUNT = 10;
// Note: inserting this grader user is required so that we can grade your assignment.
const GRADER_USERNAME = 'grader';
const GRADER_PLAINTEXT_PASSWORD = 'myfavoritepassword';

try {
    const hashedPassword = bcrypt.hashSync(GRADER_PLAINTEXT_PASSWORD, SALT_ROUNDS_COUNT);
    connection.query('INSERT INTO users (username, password) VALUES (?, ?)', [GRADER_USERNAME, hashedPassword]);
    console.info(`Successfully created user "${GRADER_USERNAME}".`)

    await connection.commit();
} catch (error) {
    console.error('Failed to add users to the users table:');
    console.error(error);
    process.exitCode = 1;
} finally {
    await connection.end();
}