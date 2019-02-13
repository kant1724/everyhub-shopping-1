var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var engines = require('consolidate');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'views')));
app.engine('html', engines.mustache);
app.set('view engine', 'html');

app.use('/', require('./server/main/mainRouter'));
app.use('/cart', require('./server/cart/cartRouter'));
app.use('/product', require('./server/product/productRouter'));
app.use('/purchase', require('./server/purchase/purchaseRouter'));

module.exports = app;
