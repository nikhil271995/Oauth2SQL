let mysql = require('mysql');
let pool;
module.exports = {
    getPool: function () {
        if (pool) return pool;
        pool = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: '12345',
            database: 'oauth2',
            connectionLimit: 20,
            supportBigNumbers: true
        });
        return pool;
    }
};
