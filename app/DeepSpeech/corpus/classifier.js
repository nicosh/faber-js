const natural = require('natural');
const corpus = require("./corpus")
//const PorterStemmerIt = require('../../node_modules/natural/lib/natural/stemmers/porter_stemmer_it');
const NGrams = natural.NGrams;

const SaveClassifier = () => {
    let classifier = new natural.BayesClassifier();
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

LevenshteinDistance = (t,obj) =>{
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
    return {
        ...obj,
        raw : main[0],
        guess :main[0].titolo
    }
      
}

const classify = (t,obj,c)=>{
    return c ? LoadClassifier(t,obj) : LevenshteinDistance(t,obj)
}

exports.LoadClassifier = classify

//LoadClassifier()
//console.log(classifier.classify('nella mia ora di libertà'));
//SaveClassifier()