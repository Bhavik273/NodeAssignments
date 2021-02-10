var HttpStatusCode = require("http-status-codes");
var dbConnection = require('../../../utilities/postgresql-connection.js');
var config = require('../../../config')

exports.getAllCars = function (req, res) {
    var entityData = {};

    function validateFields(req, res) {
        return new Promise(function (resolve, reject) {

            return resolve({
                status: HttpStatusCode.StatusCodes.OK,
                data: entityData
            });
        });
    }

    function getAllCars(req, entityData) {
        return new Promise(function (resolve, reject) {
            const sqlQuery = 'select c."Name" as "Car Name",m."name" as "Maker",mo."Name" as "Model",array_agg(img.imagename) images from car c left join make m on c.make_id=m.id ' +
                'left join model mo on c.model_id=mo.id left join carimages img on c.id=img.car_id GROUP BY c.id,m."name",mo."Name"';
            dbConnection.getResult(sqlQuery).then(function (response) {
                if (response.data.length > 0) {
                    response.data.forEach(car => {
                        let list = []
                        if (car.images[0] !== null) {
                            car.images.forEach(image => list.push(config.imagePath + image))
                            car.images = list
                        }
                    });
                    return resolve({
                        status: HttpStatusCode.StatusCodes.OK,
                        data: response,
                        message: 'Record listed successfully!!!'
                    });
                } else {
                    return resolve({
                        status: HttpStatusCode.StatusCodes.OK,
                        data: [],
                        message: 'No record found!!!'
                    });
                }
            })
                .catch(function (error) {
                    res.status(error.status).json({
                        data: error.data
                    });
                });
        });
    }

    validateFields(req, res).then(function (response) {
        getAllCars(req, response.data).then(function (response) {
            res.status(response.status).json({
                data: response.data.data,
                message: response.message
            });
        })
            .catch(function (error) {
                res.status(error.status).json({
                    data: error.data
                });
            });
    })
        .catch(function (error) {
            res.status(error.status).json({
                data: error.data
            });
        });

}
