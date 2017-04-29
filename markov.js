const fs = require('fs'),
    _ = require('lodash'),
    Q = require('q'),
    redis = require('redis').createClient('6379', 'redis'),
    DICT_KEY = process.env.DICT_KEY || 'newsfaker:dict',
    MAX_LENGTH = process.env.MAX_LENGTH || 10;
    //TODO prefix setting

const markov = {
    dictionaryExists: () => {
        return Q.ninvoke(redis, 'exists', DICT_KEY);
    },

    generateDictionary: () => {
        return Q.nfcall(fs.readFile, 'headlines.txt', 'utf8').then(data => {
            let dict = {};
            console.log('Generating markov dictionary...');
            data.split("\n").forEach(line => {
                let words = `^ ${line.replace(/[^\w\s]/g, '')} $`.split(' ');
                while (words.length > 1) {
                    let word = words.shift();
                    if (!dict.hasOwnProperty(word)) dict[word] = [];
                    dict[word].push(words[0].trim());
                }
            });
            const dictValues = _.flatten(_.map(dict, (val, key) => [key, val.join(',')]));
            Q.ninvoke(redis, 'hmset', DICT_KEY, ...dictValues)
                .then(_ => console.log('Finished generating dictionary!'))
                .catch(err => console.log(err.stack));
        });
    },

    generateHeadline: (headline = ['^']) => {
        const lastWord = headline[headline.length - 1];
        return Q.ninvoke(redis, 'hget', DICT_KEY, lastWord).then(words => {
            if (lastWord !== null && lastWord !== '$' && headline.length < MAX_LENGTH) {
                headline.push(_.sample(words.split(',')));
                return markov.generateHeadline(headline);
            } else {
                headline.shift();
                headline.pop();
                return headline.join(' ');
            }
        });
    }
};

module.exports = markov;
