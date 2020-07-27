var express = require('express');
var path= require('path');
var router = express.Router();
//LOGINSTART
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
//LOGINEND
var db = require("../conexion/conexion");
//PaypalSTART
var paypal= require('paypal-rest-sdk');
//PaypalEND

//LOGINSTART
router.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
router.use(bodyParser.urlencoded({extended : true}));
router.use(bodyParser.json());
//LOGIN

// nodemon para correr el paypal
// api de paypal de la tienda no modificar
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AVwYbWaifjZJssJ0nqphDStJbHydu7sTnJuplN4LwxVqQSiRc8f9ttxKfWwGWk2ZPx2RHybegKvL0JMz',
  'client_secret': 'EOswvGwGC4aNHQkp9WD0q4M2Qld74TdzJBDspsMYzpT6YEZyjjVZoFMg75mHw_YqRkUBBHHQQygbu7BG'
});


router.post('/pay', function(req, res){            
  var manua1 = req.body.manua1; 	
  var pdtoapagar = req.body.productpa; 	
  var pdtoapreci = req.body.productpre;
  var pdtodescri = req.body.descripmanu;   

  var create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {        
        "return_url": "http://localhost:3000/success?id="+ manua1 +"&prec="+ pdtoapreci +"",
        "cancel_url": "http://localhost:3000/productos"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": ""+ pdtoapagar +"",
                "sku":  ""+ manua1 +"",
                "price": ""+ pdtoapreci +"",
                "currency": "MXN",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "MXN",
            "total": ""+ pdtoapreci +""
        },
        "description": ""+ pdtodescri +""
    }]
};
 

paypal.payment.create(create_payment_json, function (error, payment) {
  if (error) {
      throw error;
  } else {
    for(var i=0;i<payment.links.length; i++){
      if(payment.links[i].rel=='approval_url'){       
        res.redirect(payment.links[i].href);         
      }
    }       
  }
});

}); 

router.get('/success',function(req, res, next) { 
  var id = req.query.id;
  var prec = req.query.prec;
  var payerId = req.query.PayerID;
  var paymentId = req.query.paymentId;  
  
  if (id != '' && prec != ''){    
    var sql = "SELECT * FROM manual Where Idmanual="+ id +"";
  
    db.query(sql, function (err, result){          
    if(err) throw err;  
      
      var execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{  
            "amount": { 
            "currency": "MXN",
            "total": ""+ prec +""
          }
        }]
      };
      
      paypal.payment.execute(paymentId, execute_payment_json, function (error, payment){
        if (error){
            console.log(error.response);
            throw error;
        }else {         
          console.log(JSON.stringify(payment));          
          db.query("INSERT INTO venta (id,  Idmanual) VALUES ('"+ req.session.userId +"', '"+ id +"')", function(err,VENTAcomprada){
            if (err) throw err; 
            db.query("update manual set cantidaddispo = cantidaddispo - 1 where Idmanual = '"+ id +"'", function(err,VENTAcomprada){
              if (err) throw err; 
              res.render('sucess', { title: 'Descarga del manual', Manual: result, nombre: 'Hola '+ req.session.nombre });                
            });              
          });  
                                                                                                                                      
        }
      });           
    });             
  }else{
    res.redirect('/404');
  }	  
});

router.post('/pagocarro', function(req, res){            
  var manua1 = req.body.manua1; 	
  var pdtoapagar = req.body.productpa; 	
  var pdtoapreci = req.body.productpre;
  var tota = req.body.totalproductos;
  var pdtodescri = req.body.descripmanu;   


  var create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {        
        "return_url": "http://localhost:3000/successcarro?id="+ manua1 +"&prec="+ pdtoapreci +"&tot="+ tota +"",
        "cancel_url": "http://localhost:3000/productos"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": ""+ pdtoapagar +"",
                "sku":  ""+ manua1 +"",
                "price": ""+ pdtoapreci +"",
                "currency": "MXN",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "MXN",
            "total": ""+ pdtoapreci +""
        },
        "description": ""+ pdtodescri +""
    }]
};
 

paypal.payment.create(create_payment_json, function (error, payment) {
  if (error) {
      throw error;
  } else {
    for(var i=0;i<payment.links.length; i++){
      if(payment.links[i].rel=='approval_url'){       
        res.redirect(payment.links[i].href);         
      }
    }       
  }
});

}); 

router.get('/successcarro',function(req, res, next) { 
  var id = req.query.id;
  var prec = req.query.prec;
  var totall = req.query.tot;
  var payerId = req.query.PayerID;
  var paymentId = req.query.paymentId;  
  
  if (id != '' && prec != ''){    
    var sql = "SELECT M.Idmanual, M.titulo, M.precio, M.imagen, M.manual FROM carrito O JOIN manual M ON M.Idmanual = O.Idmanual WHERE O.id="+ id +"";
        
    db.query(sql, function (err, result){          
      if(err) throw err;           

      var execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{  
            "amount": { 
            "currency": "MXN",
            "total": ""+ prec +""
          }
        }]
      };

      paypal.payment.execute(paymentId, execute_payment_json, function (error, payment){
        if (error){
            console.log(error.response);
            throw error;
        }else {         
          console.log(JSON.stringify(payment));                                                                                                                                                                  
          db.query("SELECT O.id, M.Idmanual,  CURDATE() AS fecha FROM carrito O JOIN manual M ON M.Idmanual = O.Idmanual WHERE O.id="+ id +"", function(err,insertar){          
             if (err) throw err;  
            db.query("SELECT O.Idmanual FROM carrito O JOIN manual M ON M.Idmanual = O.Idmanual WHERE O.id="+ id +"", function(err,actualizar){          
              if (err) throw err;
                  
              for(var e=0; e<insertar.length; e++){
                db.query("INSERT INTO venta  SET ?", insertar[e],  function(err,VENTcomprada){            
                  if (err) throw err;                                                                                 
                });
              }     
              for(var i=0; i<actualizar.length; i++){
                db.query("update manual SET cantidaddispo = cantidaddispo - 1 WHERE ? ", actualizar[i], function(err,VENcomprada){            
                 if (err) throw err;                                                                                
                });
              }     
              db.query("DELETE FROM carrito WHERE id='"+ req.session.userId +"';", function(err,VENcomprada){            
                if (err) throw err;    
                res.render('successcarro', { title: 'Descarga del manual', Manual: result, nombre: 'Hola '+ req.session.nombre });                                                                                                                                                
              }); 
              
            });                                                       
          });  
        }
      });     
               
    });           
             
  }else{
    res.redirect('/404');
  }	  
});

/* GET home page. */
router.get('/', function(req, res, next) {

  db.query("SELECT Idmanual,titulo,precio,imagen  FROM manual WHERE cantidaddispo>0 ORDER BY Idmanual ASC LIMIT 8;", function(err,inicioman){
    if (err) throw err; 
      db.query("SELECT manual.titulo, manual.descripcion, manual.cantidaddispo, manual.imagen, venta.Idmanual, SUM(1) AS vendidos from manual JOIN venta on manual.Idmanual = venta.Idmanual GROUP BY venta.Idmanual ORDER BY vendidos DESC LIMIT 5 ", function(err,masvendido){
        if (err) throw err; 
          if (req.session.username)
          {
          res.render('index', { title: 'Manuales Digitales de programación', Productos: inicioman, Vendidos: masvendido, nombre: 'Hola '+ req.session.nombre});   
          }
          else{
            res.render('index', { title: 'Manuales Digitales de programación', Productos: inicioman, Vendidos: masvendido, nombre: 'Iniciar sesión' });
          }              
      });      
  });
  
});

/* GET Info de Produtos. */
router.get('/info', function(req, res, next) {
  if (req.session.username){
    var id = req.query.id; 	

	  if (id != ''){    
      var sql = "SELECT * FROM manual Where Idmanual="+ id +"";
    
      db.query(sql, function (err, result){          
      if(err) throw err;                  
        db.query("SELECT * FROM manual ORDER BY Idmanual DESC LIMIT 3 ", function(err,interesar){
          if (err) throw err;
            db.query("SELECT usuarios.Nombres, comentarios.comentario from comentarios JOIN usuarios on comentarios.id =usuarios.id WHERE comentarios.Idmanual="+ id +" ", function(err,comentari){
              if (err) throw err;
                db.query("SELECT Idmanual FROM carrito WHERE id='"+ req.session.userId +"' AND Idmanual="+ id +" ", function(err,agregarcarro){
                  if (err) throw err;
                    if(agregarcarro.length>0){
                      res.render('info', { title: 'Información del Producto', Manual: result, Sugerencia: interesar, Comentarios: comentari, Agrega: 'valido', nombre: 'Hola '+ req.session.nombre });                                                               
                    }else{
                      res.render('info', { title: 'Información del Producto', Manual: result, Sugerencia: interesar, Comentarios: comentari, Agrega: 'novalido', nombre: 'Hola '+ req.session.nombre });                                                           
                    }
                });                                
            });            
        });
       
      });             
    }else{
    res.render('404', { title: 'No encontrado' });
    }		
  }
  else{
    res.redirect('/login');
  }    
});


router.post('/info', function(req, res){   

    var sql = "INSERT INTO carrito (id,  Idmanual) VALUES ('"+ req.session.userId +"', '"+ req.body.manue +"')";
    
    db.query(sql, function (err, result) {     
      if(err) throw err;          
        res.redirect('/carrito'); 
    } );
});

router.post('/infoo', function(req, res){ 

    var sqls = "INSERT INTO comentarios (id,  Idmanual, comentario) VALUES ('"+ req.session.userId +"', '"+ req.body.manualll +"', '"+ req.body.coment +"')";    
    db.query(sqls, function (err, comenagre) {     
      if(err) throw err;          
        var id = req.body.manualll; 	
	    if (id != ''){    
        var sql = "SELECT * FROM manual Where Idmanual="+ id +"";
        db.query(sql, function (err, result){          
        if(err) throw err;   
        db.query("SELECT * FROM manual ORDER BY Idmanual DESC LIMIT 3 ", function(err,interesar){
          if (err) throw err; 
            db.query("SELECT usuarios.Nombres, comentarios.comentario from comentarios JOIN usuarios on comentarios.id =usuarios.id WHERE comentarios.Idmanual="+ id +" ", function(err,comentari){
              if (err) throw err;            
                  db.query("SELECT Idmanual FROM carrito WHERE id='"+ req.session.userId +"' AND Idmanual="+ id +" ", function(err,agregarcarro){
                  if (err) throw err;       
                  if(agregarcarro.length>0){
                    res.render('info', { title: 'Información del Producto', Manual: result, Sugerencia: interesar, Comentarios: comentari, Agrega: 'valido', nombre: 'Hola '+ req.session.nombre });                                                               
                  }else{
                    res.render('info', { title: 'Información del Producto', Manual: result, Sugerencia: interesar, Comentarios: comentari, Agrega: 'novalido', nombre: 'Hola '+ req.session.nombre });                                                           
                  }
                });                                
            });            
        });
       
    } );             
  }else
  {
    res.render('404', { title: 'No encontrado' });
  }		     
  });

});

/* GET  acerca. */
router.get('/acerca', function(req, res, next) {
  if (req.session.username){
    res.render('acerca', { title: 'Acerca de Nosotros', nombre: 'Hola '+ req.session.nombre });
  }
  else{
    res.render('acerca', { title: 'Acerca de Nosotros', nombre: 'Iniciar sesión' });
  }
});

/* GET  indexadmin. */
router.get('/admin', function(req, res, next) {
  if (req.session.username){
    res.render('admin', { title: 'Administración del Sistema', nombre: 'Hola '+ req.session.nombre});   
  }else{         
    res.redirect('/login');
  }  
});

/* GET  carrito de compras. */
router.get('/carrito', function(req, res, next) {
  if (req.session.username){
    db.query("SELECT M.Idmanual, M.titulo, M.cantidaddispo, M.precio, M.imagen FROM carrito O JOIN manual M ON M.Idmanual = O.Idmanual WHERE O.id='"+ req.session.userId +"'", function(err,carro){
      if (err) throw err;           
        db.query("SELECT COUNT(O.id) AS totalproductos, O.id, M.cantidaddispo, SUM( M.precio) AS total FROM carrito O JOIN manual M ON M.Idmanual = O.Idmanual WHERE o.id='"+ req.session.userId +"' ORDER BY M.cantidaddispo ASC", function(err,totalcarro){
          if (err) throw err; 
            res.render('carrito', { title: 'Carrito de Compras', Micarrito: carro, Totalcarrito: totalcarro, nombre: 'Hola '+ req.session.nombre  });
        });               
    }); 
  }else{         
    res.redirect('/login');         
  }   
});


router.post('/carrito', function(req, res){ 
    console.log(req.body);
    var sql = "DELETE FROM carrito WHERE id='"+ req.session.userId +"' AND Idmanual='"+ req.body.idman +"';";    
    db.query(sql, function (err, result) {     
      if(err) throw err;        
        res.redirect('/carrito');
    });
});


/* GET  agregar manual. */
router.get('/agregar', function(req, res, next) {
  if (req.session.username){
    res.render('agregar', { title: 'Agregar un Nuevo Manual', nombre: 'Hola '+ req.session.nombre});   
  }else{         
    res.redirect('/login');         
  }  
});

/* GET  login. */
router.get('/login', function(req, res, next) {
  if (req.session.username){
    if (req.session.tipous==2){
      res.redirect('/admin');
    }else{
      res.redirect('/');
    }
  }else{         
    res.render('login', { title: 'Inicio de Sesión', message: '', nombre: 'Iniciar sesión' });
  } 
});

/* GET  productos. */
router.get('/productos', function(req, res, next) {

  db.query("SELECT * FROM manual WHERE cantidaddispo>0", function(err,resultados){
    if (err) throw err;      
      if (req.session.username){
        res.render('productos', { title: 'Todos los Productos', Manuales: resultados, nombre: 'Hola '+ req.session.nombre });
      }else{         
        res.render('productos', { title: 'Todos los Productos', Manuales: resultados, nombre: 'Iniciar Sesión'});
      }       
  });
  
});

/* GET  registro. */
router.get('/registro', function(req, res, next) { 
  if (req.session.username){
    res.redirect('/');         
  }else{         
    res.render('registro', { title: 'Nuevos Usuarios', nombre: 'Iniciar Sesión'});
  }   
});

router.post('/registro', function(req, res){ 

    var sql = "INSERT INTO usuarios (Nombres, Apellidos, correo, contrasena, tipo) VALUES ('"+ req.body.nombre +"', '"+ req.body.apellido +"', '"+ req.body.correo +"','"+ req.body.contra +"', 1)";
    
    db.query(sql, function (err, result) {     
      if(err) throw err;          
        res.render('login', { title: 'Login', message: 'Te Registraste Exitosamente, Ahora ya puedes Iniciar Sesión', nombre: 'Iniciar Sesión' });             
    } );
});

/* GET  ventas. */
router.get('/ventas', function(req, res, next) {

  db.query("SELECT O.fecha, M.titulo, M.precio, M.imagen, E.Nombres, E.Apellidos FROM venta O JOIN manual M ON M.Idmanual = O.Idmanual JOIN usuarios E ON E.id=O.id ", function(err,ventahecha){
    if (err) throw err; 
      db.query("SELECT SUM( M.precio) AS total FROM venta O JOIN manual M ON M.Idmanual = O.Idmanual ", function(err,totalhecho){
        if (err) throw err; 
          db.query("SELECT M.titulo, M.precio, O.fecha, M.imagen, E.Nombres, E.Apellidos FROM venta O JOIN manual M ON M.Idmanual = O.Idmanual JOIN usuarios E ON E.id=O.id WHERE fecha=(SELECT CURDATE() ) ", function(err,ventahoy){
            if (err) throw err;          
              if (req.session.username){
                res.render('ventas', { title: 'Todas las Ventas', VentasHechas: ventahecha, VentaTotal: totalhecho, VentasdeHoy: ventahoy, nombre: 'Hola '+ req.session.nombre });   
              }
              else{         
                res.redirect('/login');         
              }  
          }); 
      });      
  });  
});

/* GET  compras. */
router.get('/compras', function(req, res, next) {
  if (req.session.username){
    db.query("SELECT M.titulo, M.precio, O.fecha, M.imagen FROM venta O JOIN manual M ON M.Idmanual = O.Idmanual JOIN usuarios E ON E.id=O.id WHERE O.id='"+ req.session.userId +"' ", function(err,comprado){
      if (err) throw err; 
        res.render('compras', { title: 'Mis Compras', MisCompras: comprado, nombre: 'Hola '+ req.session.nombre });              
    });
  }
  else{         
    res.redirect('/login');  
  }     
});

/* GET  404. */
router.get('/404', function(req, res, next) {
  if (req.session.username){
    res.render('404', { title: 'No Encontrado', nombre: 'Hola '+ req.session.nombre });
  }
  else{
    res.render('404', { title: 'No Encontrado', nombre: 'Iniciar sesión' });
  }
});

//LOGIN
router.post('/login', function(req, res) {
	var username = req.body.correo;
  var password = req.body.contrasena;
  var id;
	if (username && password) {
		db.query('SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?', [username, password], function(error, results, fields) {			
		  if (results.length > 0) {
        id = results[0].id;
		    req.session.loggedin = true;
        req.session.username = username;
        req.session.nombre = results[0].Nombres;
        req.session.userId = results[0].id;
        req.session.tipous = results[0].tipo;

        if(results[0].tipo == 1)
        {
          res.redirect('/'); 
        }else{
          res.redirect('/admin'); 
        }        
			} else {
        res.render('login', { title: 'Inicio de Sesión', message: 'Usuario o contraseña incorrecctos', nombre: 'Iniciar sesión' });        
			}			
			res.end();
		});
	} else {
    res.render('login', { title: 'Inicio de Sesión', message: 'Ingresa usuario y contraseña', nombre: 'Iniciar sesión' });            
		res.end();
	}
});
//LOGIN



//IMAGEN
var multer = require('multer');

const storage = multer.diskStorage({
  destination:path.join(__dirname ,'../public/images'),
  filename:function(req, file, cb){
    const fileName = file.originalname.toLowerCase().split(' ').join('-');
    cb(null, fileName)

  }
});
const upload= multer({storage,
  dest: path.join(__dirname, '../public/images')
});

//GUARDAR El MANUAL
router.post('/agregar',upload.single('manual'),function(req, res){ 
   console.log(req.body);
   var manual= req.file.originalname;
  var sql = "INSERT INTO manual (titulo, descripcion, precio, autor, cantidaddispo,tecnologia, manual, imagen) VALUES ('"+ req.body.titulo +"', '"+ req.body.descripcion +"', '"+ req.body.precio +"','"+ req.body.autor +"','"+ req.body.cantidaddispo +"','"+ req.body.tecnologia +"','"+ manual +"','"+ req.body.imagen +"')";
    db.query(sql, function (err, result) {     
      if(err) throw err
        console.log("Manual Guardado");
        res.redirect('/listaproduc');             
    } );
});

/* GET Lista productos. */
router.get('/listaproduc', function(req, res, next) {

  db.query("SELECT * FROM manual", function(err,resultados){
    console.log(resultados);
    res.render('listaproduc', { title: 'Todos los Productos', Manuales: resultados });
  });
  
});

/* DELETE  Manual. */
router.get('/delete', function(req, res, next) {

  db.query("DELETE FROM manual WHERE Idmanual = ?", req.query.Idmanual,function(err,rs){
  res.redirect('/listaproduc');
  })
});

/* GET  galeria. */
router.get('/galeria', function(req, res, next) {
  res.render('galeria', { title: 'Todas las ventas' });
});

//Galeria de imagenes
router.post('/galeria',upload.single('img'),function(req, res){ 
  console.log(req.body);
  var img= req.file.originalname;
 var sql = "INSERT INTO galeria (imagen) VALUES ('"+img +"')";
   db.query(sql, function (err, result) {     
     if(err) throw err
       console.log("Imagen Guardada");
       res.redirect('/agregar');            
   });
});
// Editar Manual
router.get('/edit', function(req,res,next){
  db.query("SELECT * FROM manual WHERE Idmanual=?", req.query.Idmanual,function(err,resultados){
    console.log(resultados);
    res.render('edit', { title: 'Todos los Productos', Manuales: resultados });
  });
});

//Actualizar Manual
router.post('/edit', function(req,res,next){
  var param=[
    req.body,
    req.query.Idmanual
  ]
  db.query('UPDATE manual SET ? WHERE Idmanual', param,function(err,rs){
    res.redirect('/listaproduc');
  })
});

module.exports = router;
