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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  // console.log('App running on port 3000...');
});
