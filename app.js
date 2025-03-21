const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const multer = require('multer');
const upload = multer({ dest: 'public/images/' }); // Destination folder for uploaded images

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');


// Static files
app.use(express.static('public'));

// Routes
const indexRoutes = require('./routes/index');
const bookingRoutes = require('./routes/booking');
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/order');

app.use('/', indexRoutes);
app.use('/booking', bookingRoutes);
app.use('/admin', adminRoutes);
app.use('/order', orderRoutes);

// Start server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
