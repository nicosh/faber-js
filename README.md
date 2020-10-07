This application use mozilla deepspeech to perform Speech-To-Text searches on a given corpus.  

# Faber-js
## why
Faber-js is POC of real time speech-to-text application.  
It uses [mozilla DeepSpeech](https://github.com/mozilla/DeepSpeech) and the [Node.JS / Electron.JS package](https://deepspeech.readthedocs.io/en/v0.8.2/USING.html#using-the-node-js-electron-js-package)  with the  [Italian Model](https://github.com/MozillaItalia/DeepSpeech-Italian-Model) for speech-to-text extraction,
and [Natural](https://github.com/NaturalNode/natural) for text classification.


## About  
The purpose of the app is to try  to guess which de andrè song you are singing (or reading)  
The app  streams the microphone audio from the browser to a NodeJS server (using socket.io) where DeepSpeech  will read the buffer and a classifier will classify the  DeepSpeech result.  
You can find out more about the corpus [here](https://github.com/nicosh/faber-js/tree/main/app/DeepSpeech/corpus) while [here](https://github.com/nicosh/faber-js/blob/main/app/DeepSpeech/corpus/classifier.js) you can see how to train and load the classifier. 





## Installation
### with docker
`git clone https://github.com/nicosh/faber-js.git`  
`cd faber-js`  
`docker build --tag "faberjs" .`  
`docker run  -p 3000:3000 faberjs`  

### manual installation 
clone the repo :  
`git clone https://github.com/nicosh/faber-js.git`  

Please note that you need sox, and it need to be added  to PATH (on windows)
https://github.com/JoFrhwld/FAVE/wiki/Sox-on-Windows

Also you need do manually download the models from `https://github.com/MozillaItalia/DeepSpeech-Italian-Model/releases/download/2020.08.07/model_tensorflow_it.tar.xz` 
and move them inside `app/DeepSpeech/models`  

Then:  
`cd faber-js/app`  
`npm install`  

Build for production: 
`npm run build`  
`npm run start`  

or run in dev mode  
`npm run dev`  

