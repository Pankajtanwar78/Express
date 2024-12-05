const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB)
  .then(() => console.log('DB connection successful'))
  .catch(err => console.log(err));

// console.log(app.get('env')); // environment variable set by express
// console.log(process.env); // show all the environment variable set by nodejs

// NODE_ENV=development nodemon server.js  => To set the environment variable while running the app

const port = process.env.PORT || 3000;
app.listen(port, () => {
  // console.log('App running on port 3000...');
});
