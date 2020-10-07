const map = require("./corpus/map")
const fs = require('fs')

const buildJson = () => {
    let arr = Object.keys(map)
    let result = []
    arr.forEach(el => {
        try {
            let mapped = map[el].map(elm => {
                return {
                    titolo: elm.titolo,
                    path: elm.path,
                    album: el
                }
            })
            result = [...result, ...mapped]
        } catch (e) {

        }
    })
    let withtext = result.map(el => {
        try {
            var data = fs.readFileSync("./corpus/" + el.path, 'utf8');
            return {
                ...el,
                testo: data.replace(/(\r\n|\n|\r)/gm, " ")
            }
        } catch (e) {
            return false
        }
    })
    let filtered = withtext.filter(el => el != false)
    fs.writeFile('./corpus/corpus.json', JSON.stringify(filtered), 'utf8', ()=>{
        console.log("done")
    });
}

buildJson()