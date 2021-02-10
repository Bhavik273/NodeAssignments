var dbConnection = require('../../../utilities/postgresql-connection.js');
var validate = require('validator');
var HttpStatusCode = require("http-status-codes");
var config = require('../../../../../Demo NodeProject/nodesampleproject/config')

exports.getCarById = function (req, res) {
    var entityData = {
        Id: req.params.id
    };

    function validateFields(req, res) {
        return new Promise(function (resolve, reject) {
            var isUserIdEmpty = validate.isEmpty(entityData.Id);
            if (isUserIdEmpty) {
                return resolve({
                    status: HttpStatusCode.StatusCodes.BAD_REQUEST,
                    result: req.i18n.__('UserIdRequired')
                });
                //return res.status(400).send({ result: req.i18n.__('UserIdRequired') });
            }

            return resolve({
                status: HttpStatusCode.StatusCodes.OK,
                data: entityData
            });
        });
    }

    function getCarById(req, entityData) {
        return new Promise(function (resolve, reject) {
            const sqlQuery = 'select c."Name",m."name",mo."Name",array_agg(img.imagename) images from car c left join make m on c.make_id=m.id ' +
                'left join model mo on c.model_id=mo.id left join carimages img on c.id=img.car_id WHERE c.id = ' + entityData.Id + ' GROUP BY c.id,m."name",mo."Name"';
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
                        message: "No Record found"
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
        getCarById(req, response.data).then(function (response) {
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