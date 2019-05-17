module.exports = {
    getDBConnection: function() {
        const mysql = require('mysql');
        const connection = mysql.createConnection({
            multipleStatements: true,
            host: '14.63.225.138',
            port: '11001',
            user: 'everyhub',
            password: 'everyhub',
            database: 'everyhubshopping'
        });

        return connection;
    }
}