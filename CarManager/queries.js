const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'CarDB',
    password: '',//enter your password
    port: 5432
})

const getCars = (request, response) => {
    const stmt = 'select car.id as "Car ID",car."Name" as "Car Name",make."name" as "Make", model."Name" as "Model" from car left join make on car.make_id=make.id left join model on car.model_id=model.id order by car.id';
    pool.query(stmt, (error, result) => {
        if (error) {
            throw error;
        }
        response.status(200).json(result.rows)
    })
}

const getCarById = (request, response) => {
    
    const id = parseInt(request.params.id)
    if(id<=0)
    {
        response.status(200).json({
            errorMessage:"Id must be > 0"
        })
        return;
    }
    
    const stmt = 'select car.id as "Car ID",car."Name" as "Car Name",make."name" as "Make", model."Name" as "Model" from car left join make on car.make_id=make.id left join model  on car.model_id=model.id where car.id=$1';
    pool.query(stmt, [id], (error, result) => {
        if (error) {
            throw error;
        }
        if(result.rowCount>0)
            response.status(200).json(result.rows)
        else
            response.status(200).json({info:'No car with id:'+id})
    })
}

module.exports = {
    getCars,
    getCarById
}