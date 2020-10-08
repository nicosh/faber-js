const natural = require('natural');
const corpus = require("./corpus")
const PorterStemmerIt = require('../../node_modules/natural/lib/natural/stemmers/porter_stemmer_it');
const NGrams = natural.NGrams;
const SaveClassifier = () => {
    let classifier = new natural.BayesClassifier(PorterStemmerIt);
    corpus.forEach(el => {
        let { testo, titolo } = el
        let trigrams = NGrams.trigrams(testo)
        let bigrams = NGrams.bigrams(testo)
        let Fgrams = NGrams.ngrams(testo, 4)
        Fgrams.forEach(Fgram => {
            let text = Fgram.join(" ")
            classifier.addDocument(Fgram, titolo);
            classifier.addDocument(text, titolo);
        })
        bigrams.forEach(bigram => {
            let text = bigram.join(" ")
            classifier.addDocument(bigram, titolo);
            classifier.addDocument(text, titolo);
        })
        trigrams.forEach(trigram => {
            let text = trigram.join(" ")
            classifier.addDocument(trigram, titolo);
            classifier.addDocument(text, titolo);
        })
    })
    classifier.train();
    classifier.save('./classifier.test.json', function (err, classifier) {
        process.exit()
    });
}

const LoadClassifier =  (text) => {
    natural.BayesClassifier.load('./classifier.test.json', null, function (err, classifier) {
        let guess = classifier.classify(text)
        console.log(guess)

    });
}
LevenshteinDistance = (t) =>{
    const corpus = require("./corpus")
    let main = []
    corpus.forEach(el =>{
        try{
            let {testo,titolo} = el
            let result = natural.LevenshteinDistance(t, testo, {search: true})
            main.push({titolo,...result})
        }catch(e){

        }
    })
    main.sort(function(a, b) {
        let  keyA = a.distance
        let  keyB = b.distance
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
      });
      console.log("LevenshteinDistance ",main[0].titolo)
}

//SaveClassifier()
//LoadClassifier("di marnella")
//LevenshteinDistance("di marnella")
