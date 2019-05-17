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
let session = require('express-session');

app.use(session({
    secret: 'ghjkkqxs',
    resave: false,
    saveUninitialized: true
}));

const config = require('./config')
app.set('jwt-secret', config.secret)

app.use('/', require('./server/main/mainRouter'));
app.use('/cart', require('./server/cart/cartRouter'));
app.use('/product', require('./server/product/productRouter'));
app.use('/purchase', require('./server/purchase/purchaseRouter'));
app.use('/mypage', require('./server/mypage/mypageRouter'));
app.use('/admin/item_manager', require('./server/admin/item_manager/itemManagerRouter'));
app.use('/admin/order_list', require('./server/admin/order_list/orderListRouter'));
app.use('/admin/user_manager', require('./server/admin/user_manager/userManagerRouter'));
app.use('/admin/delivery_manager', require('./server/admin/delivery_manager/deliveryManagerRouter'));
app.use('/user', require('./server/user/userRouter'));

module.exports = app;
