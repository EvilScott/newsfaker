const express = require('express'),
    markov = require('./markov');

// serve views as ejs
const app = express();
app.set('view engine', 'ejs');

// home page
app.get('/', (req, res) => res.render('index'));

// markov endpoint
app.get('/headline', (req, res) => {
    markov.starterKey()
        .then(starter => markov.generateHeadline(starter.split(' ')))
        .then(val => res.json({ headline: val }))
        .catch(err => res.send(err.stack));
});

// start server
app.listen(4000);
