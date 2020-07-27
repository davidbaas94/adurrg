var mysql = require('mysql')
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'adurrg',
  multipleStatements: true
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



