## Installation
### with docker
`git clone https://github.com/nicosh/faber-js.git`  
`cd faber-js`  
`docker build --tag "faberjs" .`  
`docker run  -p 3000:3000 faberjs`  

### manual isntallation 
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

