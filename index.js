const dotenv = require('dotenv').config();
const os = require('os');
const morgan = require('morgan');
const http = require('http');
const express = require('express');
const db = require("./config/db");

const app = express();

// Body parser
app.use(express.json());

// dev logging middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

// Routes
const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');
const categoryRoute = require('./routes/category');
const companyRoute = require('./routes/company');
const menuItemRoute = require('./routes/menuItem');
const customerRoute = require('./routes/customer');
const addressRoute = require('./routes/address');
const basketRoute = require('./routes/basket');
const orderRoute = require('./routes/order');

// Routes initialize
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/categories', categoryRoute);
app.use('/api/v1/companies', companyRoute);
app.use('/api/v1/menu-items', menuItemRoute);
app.use('/api/v1/customers', customerRoute);
app.use('/api/v1/addresses', addressRoute);
app.use('/api/v1/baskets', basketRoute);
app.use('/api/v1/orders', orderRoute);

/** Get port from environment and store in Express. */
const port = process.env.PORT || "3000";
app.set("port", port);

/** catch 404 and forward to error handler */
app.use('*', (req, res) => {
    return res.status(404).json({
      success: false,
      message: 'API endpoint doesnt exist'
    })
  });
  
  /** Create HTTP server. */
  const server = http.createServer(app);
 
  /** Listen on provided port, on all network interfaces. */
  server.listen(port);
  /** Event listener for HTTP server "listening" event. */
  server.on("listening", () => {
    console.log(`Listening on port:: ${os.hostname()}:${port}/`)
  });