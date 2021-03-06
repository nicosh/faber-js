
# Faber-js
An application that use mozilla deepspeech to perform Speech-To-Text searches on a given corpus.  
It uses [mozilla DeepSpeech](https://github.com/mozilla/DeepSpeech) and the [Node.JS / Electron.JS package](https://deepspeech.readthedocs.io/en/v0.8.2/USING.html#using-the-node-js-electron-js-package)  with the  [Italian Model](https://github.com/MozillaItalia/DeepSpeech-Italian-Model) for speech-to-text extraction,
and [Natural](https://github.com/NaturalNode/natural) for text classification.

## About  
This project was carried out during  the [Mozilla Italia Developer Contest](https://github.com/MozillaItalia/DeepSpeech-Contest), the purpose of the app is to try  to guess which [Fabrizio De André](https://en.wikipedia.org/wiki/Fabrizio_De_Andr%C3%A9) song you are singing (or, better, reading).  
The app  streams the microphone audio from the browser to a NodeJS server (using socket.io) where DeepSpeech  will read the buffer and a classifier will classify the  DeepSpeech result.  
You can find out more about the corpus [here](https://github.com/nicosh/faber-js/tree/main/app/DeepSpeech/corpus/corpus) while [here](https://github.com/nicosh/faber-js/blob/main/app/DeepSpeech/corpus/classifier.js) you can see how to train and load the classifier. 
At the moment, for text extraction, only 2 (really simple) algorithms are supported : Levenshtein Distance (slower but more accurate) and Bayes Classification (faster but  less accurate).   

Live demo (may be offline) : https://deepspeech.czzncl.dev/
### App settings 

- **Use Levenshtein Distance** : wether using Levenshtein Distance or Bayes for text classification.
- **Show Recognized Text** : wether show or not deepSpeech Recognized text
- **Show Debug Window** : wether show or not a debug windows that contains some information about the app status and payload.
- **Stop recording on recognition** : wether stop speech-to-text and text classification once a sentence is recognized and classified
- **Show matched sentence (instead that song title)*** : Show the matched sentence (of the song) for the current recognized speech-to-text
  
*Only with Levenshtein
## Installation
### with docker
The easiest way to install the app is using docker :   

`git clone https://github.com/nicosh/faber-js.git`  
`cd faber-js`  
`docker build --tag "faberjs" .`  
`docker run  -p 3000:3000 faberjs`  

### manual installation 
Please note that you need python and sox, sox need to be added  to PATH (on windows) see 
https://github.com/JoFrhwld/FAVE/wiki/Sox-on-Windows and https://github.com/nodejs/node-gyp#installation

clone the repo :  
`git clone https://github.com/nicosh/faber-js.git`  
Also you need to manually download the models from `https://github.com/MozillaItalia/DeepSpeech-Italian-Model/releases/download/2020.08.07/transfer_model_tensorflow_it.tar.xz` 
and move them inside `app/DeepSpeech/models`  

Then:  
`cd faber-js/app`  
`npm install`  

Build for production:  
`npm run build`  
`npm run start`  

or run in dev mode  
`npm run dev`  

## Tests and know issues
At the moment seems that voice recognition using .wav files have better performance compared to voice recognition using live streaming.  
Some simple test using static files can be found [here](https://github.com/nicosh/faber-js/blob/main/app/DeepSpeech/test.js). 
To compare the results is enough to run the app and try to pronounce the same sentences as the files above or just play the files and record the speakers with the microphone. 
Some things to investigate : 
- Maybe live streaming need a better configuration / fine tuning
- Microphone noise / surrounding noise  affects too much speech-to-text extraction
- Live streaming performances with good quality microphones vs cheap / lowquality 
