module.exports = {
    getDBConnection: function() {
        const mysql = require('sync-mysql');
        const connection = new mysql({
            host: '14.63.168.58',
            user: 'chatbot',
            password: 'chatbot',
            database: 'gandeurak'
        });

        return connection;
    }
}