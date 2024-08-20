
const {Pool} = require('pg');

const client = new Pool({
    "user" : "ubuntu",
    "password" : "1234",
    "host" : "localhost",
    "port" : 5432,
    "database" : "web",
    "max" : 5 // 이거 추가됨
})

// client.connect();

// const mysql= require("mysql2/promise");
// // const pool = mariadb.createPool({
// //     host: "localhost",
// //     port : 3306,
// //     user: "stageus",
// //     password: "1234",
// //     database: "web",
// //     connectionLimit: 10,
// //  });

// const tmp = async () => {
//     const mariadb = await mysql.createConnection({
//         host: "localhost",
//         user: "stageus",
//         password: "1234",
//         database: "web"
//     });

//     return mariadb
// }

    

    // const mariadb =  mysql.createConnection({
    //     host: "localhost",
    //     user: "stageus",
    //     password: "1234",
    //     database: "web"
    // });
    
    // module.exports = mariadb




module.exports = client;

