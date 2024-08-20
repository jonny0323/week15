
const {Client} = require("pg");
const Query = require('pg').Query

var client = new Client({
    user : 'stageus',
    host : 'localhost',
    database : 'postgres',
    password : '1234',
    port : 3306
})




const mysql= require("mysql2/promise");
// const pool = mariadb.createPool({
//     host: "localhost",
//     port : 3306,
//     user: "stageus",
//     password: "1234",
//     database: "web",
//     connectionLimit: 10,
//  });

const tmp = async () => {
    const mariadb = await mysql.createConnection({
        host: "localhost",
        user: "stageus",
        password: "1234",
        database: "web"
    });

    return mariadb
}

    

    // const mariadb =  mysql.createConnection({
    //     host: "localhost",
    //     user: "stageus",
    //     password: "1234",
    //     database: "web"
    // });
    
    // module.exports = mariadb




module.exports = tmp

