
require("dotenv").config();

const express = require("express");
const path = require('path'); 
const app = express();
const db = require("./app/Model");
const Port = process.env.PORT || 40001;
const indexRouter = require('./app/Routes/indexRoutes'); 

app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 

app.set('views', path.join(__dirname, '/app/views')); 

app.set('view engine', 'pug'); 
app.use(express.static(path.join(__dirname, 'public'))); 


app.use('/', indexRouter); 
require("./app/Routes/employeeRoutes")(app); 


require("./app/Routes/AssetCategoryRoutes")(app); 
require("./app/Routes/assetRoutes")(app); 
require("./app/Routes/transactionRoutes")(app); 


db.sequelize 
  .sync({ force: false }) 
  .then(() => { 
    console.log("DataBse Is connected with DB"); 


    app.listen(Port, () => { 
      console.log(`Server Is running On ${Port}`); 
    });
  })

  .catch((err) => { 
    console.error("Failed To connect With DB", err); 
  });