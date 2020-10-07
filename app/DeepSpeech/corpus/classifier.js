var natural = require('natural');
const corpus = require("./corpus")
const PorterStemmerIt = require('../../node_modules/natural/lib/natural/stemmers/porter_stemmer_it');
const { promisify } = require('util')

var NGrams = natural.NGrams;

const SaveClassifier = () => {
    var classifier = new natural.BayesClassifier();
    corpus.forEach(el => {
        let { testo, titolo } = el
        let trigrams = NGrams.trigrams(testo)
        trigrams.forEach(trigram => {
            let text = trigram.join(" ")
            classifier.addDocument(text, titolo);

        })
    })
    classifier.train();
    classifier.save('./classifier.json', function (err, classifier) {
        process.exit()
    });
}

const LoadClassifier = async (text, obj) => {
    return new Promise((resolve, reject) => { 
        natural.BayesClassifier.load('./DeepSpeech/corpus/classifier.json', null, function (err, classifier) {
            if (err) {
                return reject(err);

            } else {
                let guess = classifier.classify(text)
                let data =  { ...obj, guess }
                resolve(data);

            }
        });
    })
}

exports.LoadClassifier = LoadClassifier

//LoadClassifier()
//console.log(classifier.classify('nella mia ora di libertà'));
//SaveClassifier()