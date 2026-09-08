module.exports = {
    getDBConnection: function() {
        const mysql = require('mysql');
        // Credentials are overridable via environment variables so the DB
        // password can be rotated without touching source code / git history.
        // Defaults match the previous hardcoded values only as a fallback.
        const connection = mysql.createConnection({
            multipleStatements: true,
            host: process.env.DB_HOST || '211.253.9.176',
            port: process.env.DB_PORT || '11000',
            user: process.env.DB_USER || 'gandeurak',
            password: process.env.DB_PASSWORD || 'gandeurak',
            database: process.env.DB_NAME || 'gandeurak'
        });

        return connection;
    }
}