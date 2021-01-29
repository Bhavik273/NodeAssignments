const fs = require('fs')
const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'CarDB',
    password: 'bhavik273',//enter your password
    port: 5432
})
const getCars = async (request, response) => {
    const stmt = 'select car.id as "CarID",car."Name" as "Car Name",make."name" as "Make", model."Name" as "Model" from car ' +
        'left join make on car.make_id=make.id left join model on car.model_id=model.id order by car.id';
    pool.query(stmt, async(error, result) => {
        if (error) {
            throw error;
        }
        let carDetails = result.rows
        result = await pool.query('SELECT car_id,imagename FROM carimages')
        if(result.rowCount>0)
        {
            let images = result.rows;
            carDetails.forEach(element => {
                //element = Object(element)
                let list = []
                images.filter(ele=>{
                    if(ele.car_id==element.CarID)
                        list.push({image:`${request.protocol}://${request.get('host')}/images/${ele.imagename}`})
                })
                //console.log(`images for id:${element.CarId}:`,list);
                element.images=list
            });
        }
        //console.log(carDetails);
        response.status(200).json(carDetails)
    })
}

const getCarById = (request, response) => {

    const id = parseInt(request.params.id)
    if (id <= 0) {
        request.file.
            response.status(200).json({
                errorMessage: "Id must be > 0"
            })
        return;
    }

    const stmt = 'select car.id as "Car ID",car."Name" as "Car Name",make."name" as "Make", model."Name" as "Model" from car left join make on car.make_id=make.id left join model  on car.model_id=model.id where car.id=$1';
    pool.query(stmt, [id], (error, result) => {
        if (error) {
            throw error;
        }
        if (result.rowCount > 0)
            response.status(200).json(result.rows)
        else
            response.status(200).json({ info: 'No car with id:' + id })
    })
}

const registerCar = async (request, response) => {
    let carName = request.body.carName
    let carModel = request.body.carModel
    let carMake = request.body.carMake
    //check if carName already exist

    if (await carExists(carName))
        response.status(200).json({ info: "Car with name already exists" })
    else {

        let modelId = await getCarModel(carModel)
        let makeId = await getCarMake(carMake)
        console.log("modelId:", modelId, "makeId:", makeId);
        pool.query('INSERT INTO car ("Name",make_id,model_id) VALUES ($1,$2,$3) RETURNING id', [carName, makeId, modelId], (error, result) => {
            response.status(200).json(`Car registerd with ID:${result.rows[0].id}`)
        })
    }
}

const updateCar = async (request, response) => {
    const carName = request.body.carName
    const carModel = request.body.carModel
    const carMake = request.body.carMake
    const id = parseInt(request.params.id)

    console.log(request.file.path)
    if (id <= 0) {
        response.status(200).json({ info: `id must be > 0 found:${id}` })
        return
    }

    let result = await pool.query('SELECT id FROM car WHERE id=$1', [id])
    if (result.rowCount > 0) {
        if (await carExists(carName))
        {    
            response.status(200).json({ info: `car already exist with name:${carName}` })
        }
        else {
            let modelId = await getCarModel(carModel)
            let makeId = await getCarMake(carMake)
            pool.query('UPDATE car SET "Name"=$1, make_id=$2, model_id=$3 WHERE id=$4', [carName, makeId, modelId, id])
                .then(result => {
                    if (result.rowCount > 0)
                        response.status(200).json({ info: "car updated successfully" })
                    else
                        response.status(200).json({ info: "update operation failed" })
                })
        }
    } else {
        response.status(200).json({ info: `No car with id:${id}` })
    }
}

const deleteCar = (request, response) => {
    let id = parseInt(request.params.id)
    if (id <= 0) {
        response.status(200).json({
            errorMessage: "Id must be > 0"
        })
        return;
    }
    pool.query('DELETE FROM car WHERE id=$1', [id], (error, result) => {
        if (error) throw error;
        response.status(200).json(`Car deleted with id:${id}`)
    })
}

const uploadImage = async (request, response, next) => {
    const id = parseInt(request.params.id)

    //check if request has any valid file uploaded
    if (!request.file) {
        response.status(500)
        return next(error)
    }

    //check if user has provided with valid Id
    if (id <= 0) {
        //if Id is not valid remove uploaded file from storage
        fs.unlink(request.file.path,(err)=>{if(err) console.log(err)})
        response.status(200).json({ info: `id must be > 0 found:${id}` })
        return
    }

    //check if there is any car with given id
    let result = await pool.query('SELECT id FROM car WHERE id=$1', [id])
    //car with Id is found
    if (result.rowCount > 0) {
        //Insert corrosponding record in carImages table
        pool.query('INSERT INTO carImages(car_id,imagename,createdate) VALUES ($1,$2,$3)', [id, request.file.filename, new Date().toISOString()])
            .then(result => {
                response.status(200).json({ info: "image Uploaded Successfully" })
            })
            .catch(error => {
                fs.unlink(request.file.path,(err)=>{if(err) console.log(err)})
                response.status(200).json({ error: "Error on Server" })
                throw error
            })
    }
    //no car with given ID
    else
    {
        //remove uploaded image from storage
        fs.unlink(request.file.path,(err)=>{if(err) console.log(err)})
        response.status(200).json({ info: `No car with id:${id}` })
    }
}

async function getCarModel(carModel) {
    var modelId;
    let result = await pool.query('SELECT id,"Name" from model where LOWER("Name")=LOWER($1)', [carModel])
    if (result.rowCount > 0)
        modelId = result.rows[0].id;
    else {
        result = await pool.query('INSERT INTO model("Name") VALUES($1) RETURNING id', [carModel])
            .then(result => {
                modelId = result.rows[0].id;
            })
    }
    return modelId
}

async function getCarMake(carMake) {
    var makeId;
    result = await pool.query('Select id from make where LOWER(make."name")=LOWER($1)', [carMake])

    if (result.rowCount > 0)
        makeId = result.rows[0].id;
    else {
        rsult = await pool.query('INSERT INTO make(name) VALUES($1) RETURNING id', [carMake])
            .then(result => {
                makeId = result.rows[0].id;
            })
    }
    return makeId
}

async function carExists(carName) {
    let result = await pool.query('SELECT car."Name" from car where LOWER(car."Name")=LOWER($1)', [carName])
    return result.rowCount > 0
}

module.exports = {
    getCars,
    getCarById,
    registerCar,
    updateCar,
    deleteCar,
    uploadImage
}