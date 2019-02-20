let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let engines = require('consolidate');

let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'views')));
app.engine('html', engines.mustache);
app.set('view engine', 'html');

app.use('/', require('./getter/main/mainRouter'));
app.use('/cart', require('./getter/cart/cartRouter'));
app.use('/product', require('./getter/product/productRouter'));
app.use('/purchase', require('./getter/purchase/purchaseRouter'));
app.use('/admin', require('./getter/admin/adminRouter'));

module.exports = app;
