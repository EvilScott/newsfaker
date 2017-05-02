const fs = require('fs'),
    _ = require('lodash'),
    Q = require('q'),
    redis = require('redis').createClient('6379', 'redis'),
    DICT_KEY = process.env.DICT_KEY || 'newsfaker:dict',
    MAX_LENGTH = process.env.MAX_LENGTH || 30,
    PREFIX = process.env.PREFIX || 3;

const markov = {
    dictionaryExists: () => {
        return Q.ninvoke(redis, 'exists', DICT_KEY);
    },

    removeDictionary: () => {
        return Q.ninvoke(redis, 'del', DICT_KEY).then(() => {
            console.log('Old dictionary removed...');
        });
    },

    generateDictionary: () => {
        return Q.nfcall(fs.readFile, 'headlines.txt', 'utf8').then(data => {
            let dict = {};
            console.log('Generating dictionary...');
            data.split("\n").forEach(line => {
                let words = `^ ${line.replace(/[^\w\s]/g, '').toUpperCase()} $`.split(' ');
                let prefixWords = words.splice(0, PREFIX);
                while (words.length > PREFIX) {
                    while (prefixWords.length < PREFIX) prefixWords.push(words.shift());
                    if (!dict.hasOwnProperty(prefixWords.join(' '))) dict[prefixWords.join(' ')] = [];
                    dict[prefixWords.join(' ')].push(words[0].trim());
                    prefixWords.shift();
                }
            });
            console.log('Saving to redis...');
            const dictValues = _.flatten(_.map(dict, (val, key) => [key, val.join(',')]));
            return Q.ninvoke(redis, 'hmset', DICT_KEY, dictValues)
                .then(_ => console.log('Finished!'))
                .catch(err => console.log(err.stack));
        });
    },

    starterKey: () => {
        return Q.ninvoke(redis, 'hkeys', DICT_KEY)
            .then(keys => _.sample(keys.filter(key => key.split(' ')[0] === '^')));
    },

    generateHeadline: (headline) => {
        return Q.ninvoke(redis, 'hget', DICT_KEY, headline.slice(-1 * PREFIX).join(' ')).then(words => {
            if (words !== null && headline.slice(-1) !== '$' && headline.length < MAX_LENGTH) {
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

if (require.main === module) markov.removeDictionary().then(markov.generateDictionary);
