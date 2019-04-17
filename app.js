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

const config = require('./config')
app.set('jwt-secret', config.secret)

app.use('/', require('./getter/main/mainGetter'));
app.use('/cart', require('./getter/cart/cartGetter'));
app.use('/product', require('./getter/product/productGetter'));
app.use('/purchase', require('./getter/purchase/purchaseGetter'));
app.use('/mypage', require('./getter/mypage/mypageGetter'));
app.use('/admin/item_manager', require('./getter/admin/item_manager/itemManagerGetter'));
app.use('/admin/order_list', require('./getter/admin/order_list/orderListGetter'));
app.use('/admin/user_manager', require('./getter/admin/user_manager/userManagerGetter'));
app.use('/admin/delivery_manager', require('./getter/admin/delivery_manager/deliveryManagerGetter'));
app.use('/user', require('./getter/user/userGetter'));

module.exports = app;
