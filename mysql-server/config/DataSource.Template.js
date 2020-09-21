const mysql = require("mysql");

const DataSource = mysql.createConnection({
    host: "",
    user: "",
    password: "",
    database: "",
});
DataSource.connect();

module.exports = DataSource;
