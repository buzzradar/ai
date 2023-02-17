import { uniqueId } from "lodash";
const version = "0.0.1";

const server = "http://localhost:7347/";
// const server = "https://ai-gmed.onrender.com/";


const url = server + 'cnl';


fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error(error));