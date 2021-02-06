const dotenv = require('dotenv').config();
const os = require('os');
const morgan = require('morgan');
const http = require('http');
const express = require('express');

const app = express();

// Body parser
app.use(express.json());

// dev logging middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}
// Api Root { v1 }
app.use('/api/v1/', (req, res) => res.send({success:true, data:'This a full functional delivery API '}));

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