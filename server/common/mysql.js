module.exports = {
    getDBConnection: function() {
        const mysql = require('mysql');
        const connection = mysql.createConnection({
            multipleStatements: true,
            host: '211.253.9.176',
            port: '11000',
            user: 'gandeurak',
            password: 'gandeurak',
            database: 'gandeurak'
        });

        return connection;
    }
}