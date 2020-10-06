## Installation
### with docker
`git clone https://github.com/nicosh/faber.js.git`
`cd faber.js`
`docker build --tag "faberjs" .`
`docker run  -p 3000:3000 faberjs`

### manual isntallation 
On windows you need sox, and it need to be added  to PATH
https://github.com/JoFrhwld/FAVE/wiki/Sox-on-Windows

`git clone https://github.com/nicosh/faber.js.git`
`cd faber.js/app`
`npm install`

Build for production 
`npm run build`
`npm run start`

or run in dev mode 
`npm run dev`

