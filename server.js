const express = require('express'),
    markov = require('./markov');

// serve views as ejs
const app = express();
app.set('view engine', 'ejs');

// home page
app.get('/', (req, res) => res.render('index'));

// markov endpoint
app.get('/headline', (req, res) => {
    markov.generateHeadline()
        .then(val => res.json({ headline: val }))
        .catch(err => res.send(err.stack));
});

// generate dictionary if needed, then start server
markov.dictionaryExists().then(exists => {
    if (exists) {
        app.listen(4000);
    }  else {
        markov.generateDictionary()
            .then(_ => app.listen(4000))
            .catch(err => console.log(err.stack));
    }
}).catch(err => console.log(err.stack));
