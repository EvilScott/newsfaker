var express = require('express'),
    redis = require('redis').createClient('6379', 'redis');

var app = express();
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.render('index');
});

app.listen(4000);
