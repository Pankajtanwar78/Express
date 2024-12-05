const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');

console.log(app.get('env')); // environment variable set by express
console.log(process.env); // show all the environment variable set by nodejs

// NODE_ENV=development nodemon server.js  => To set the environment variable while running the app

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('App running on port 3000...');
});
