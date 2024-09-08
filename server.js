const mongoose = require('mongoose'); // Object modeling for node.js (helps implement MVC)
const dotenv = require('dotenv'); // loads environment variables from a .env file into process.env

//Listen to Uncaught Exceptions
process.on('uncaughtException', (err, origin) => {
  console.error(err.name, err.message);
  console.error(`${origin} - Shutting down ...`);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

//Database connection
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
mongoose.connect(DB).then(() => console.log('DB Connection successful'));

//Create Express App
const app = require('./app');

//Listen
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(
    `App is running on port ${port} in ${process.env.NODE_ENV} mode ...`,
  );
});

// An Unhandled Rejection is also an Uncaught Exception, with origin = 'unhandledRejection''
// Therefore, this is okay, but not really necessary
process.on('unhandledRejection', (reason) => {
  console.error(reason.name, reason.message);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('👋🏻 SIGTERM receive. Shutting down gracefully.');
  server.close(() => console.log('🛑 Process Terminated'));
});
