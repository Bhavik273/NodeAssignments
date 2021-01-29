const express = require("express");
const bodyParser = require("body-parser");
const db = require("./queries");
const multer = require('multer');
const path = require('path')

const storageLocation = "./uploads/car_image"
let storage = multer.diskStorage({
    destination: (request, file, cb) => {
        cb(null, storageLocation)
    },
    filename: (request, file, cb) => {
        var fileType = '';
        if(file.mimetype==='image/png')
            fileType='png'
        else if(file.mimetype==='image/jpeg')
            fileType='jpg'
        cb(null,"image-"+Date.now() +"."+fileType)
    }
})
const upload = multer({storage:storage})

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
app.post('/cars',db.registerCar)
app.delete('/cars/:id',db.deleteCar)
app.put('/cars/:id',db.updateCar)
app.post('/cars/upload/:id',upload.single('carImage'),db.uploadImage)
app.get('/images/:image',(request,response)=>{
    response.status(200).sendFile(path.resolve('./uploads/car_image/'+request.params.image))
})

app.listen(port,()=>{
    console.log(`App running on port ${port}`)
})