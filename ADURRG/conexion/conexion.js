var mysql = require('mysql')
var connection = mysql.createConnection({
  host: 'adurrg-mysqldbserver.mysql.database.azure.com',
  user: 'mysqldbuser@adurrg-mysqldbserver',
  password: 'UTM@9cdaw',
  database: 'adurrg',
  multipleStatements: true,
  port: 3306,
  ssl: true
})

connection.connect(
    (err)=>{
        if(!err){
            console.log("Conexión Establecida");
        }else{
            console.log("Conexión No Establecida");
        }
    }
)

module.exports= connection;

/*
connection.query("SELECT * FROM usuarios", function(err,resultados){console.log(resultados)});


connection.end()
*/

