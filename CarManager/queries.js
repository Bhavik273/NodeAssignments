const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'CarDB',
    password: 'bhavik273',
    port: 5432
})

const getCars = (request, response) => {
    const stmt = 'select car."Name" as "Car Name",make."name" as "Make", model."Name" as "Model" from car join make on car.make_id=make.id join model  on car.model_id=model.id order by car.id';
    pool.query(stmt, (error, result) => {
        if (error) {
            throw error;
        }
        response.status(200).json(result.rows)
    })
}

const getCarById = (request, response) => {
    const id = parseInt(request.params.id)
    const stmt = 'select car."Name" as "Car Name",make."name" as "Make", model."Name" as "Model" from car join make on car.id=$1 and car.make_id=make.id join model  on car.model_id=model.id';
    pool.query(stmt, [id], (error, result) => {
        if (error) {
            throw error;
        }
        response.status(200).json(result.rows)
    })
}

module.exports = {
    getCars,
    getCarById
}