const express = require("express");
const bodyParser = require("body-parser");
const db = require("./queries");
const { request } = require("express");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.get('/cars',db.getCars)
app.get('/cars/:id',db.getCarById)

app.listen(port,()=>{
    console.log(`App running on port ${port}`)
})