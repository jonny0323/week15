const mariadb = require("mysql");
// const pool = mariadb.createPool({
//     host: "localhost",
//     port : 3306,
//     user: "stageus",
//     password: "1234",
//     database: "web",
//     connectionLimit: 10,
//  });

const conn = mariadb.createConnection({
    host: "localhost",
    port : 3306,
    user: "stageus",
    password: "1234",
    database: "web",
 });
 
 conn.connect()

 module.exports = conn