const HttpStatusCode = require('http-status-codes')
var validate = require('validator');
var dbConnection = require('../../../utilities/postgresql-connection.js');
var carUtils = require('../../../utilities/car-utils')

exports.addCar = (req, res) => {
    const entityData = {
        carName: req.body.carName,
        carModel: req.body.carModel,
        carMake: req.body.carMake
    }

    function validateFields(req, res) {
        return new Promise((resolve, reject) => {
            let isEmpty = validate.isEmpty(entityData.carMake)
            if (isEmpty) {
                return reject({
                    status: HttpStatusCode.StatusCodes.BAD_REQUEST,
                    result: req.i18n._("CarMakeRequired")
                })
            }

            isEmpty = validate.isEmpty(entityData.carName)
            if (isEmpty) {
                return reject({
                    status: HttpStatusCode.StatusCodes.BAD_REQUEST,
                    result: req.i18n._("CarNameRequired")
                })
            }

            isEmpty = validate.isEmpty(entityData.carModel)
            if (isEmpty) {
                return reject({
                    status: HttpStatusCode.StatusCodes.BAD_REQUEST,
                    result: req.i18n._("CarModelRequired")
                })
            }

            return resolve({
                status: HttpStatusCode.StatusCodes.OK,
                data: entityData
            })
        })
    }

    function addCar(req, entityData) {
        return new Promise(async (resolve, reject) => {
            let isExist = await carUtils.carExists(entityData.carName)
            if (isExist)
                return resolve({
                    status: HttpStatusCode.StatusCodes.OK,
                    message: "Car with name already exists"
                })
            else {
                let modelId = await carUtils.getCarModel(entityData.carModel)
                let makeId = await carUtils.getCarMake(entityData.carMake)
                let query = `INSERT INTO car ("Name",make_id,model_id) VALUES ('${entityData.carName}',${makeId},${modelId}) RETURNING id`
                dbConnection.getResult(query).then(result => {
                    return resolve({
                        status: HttpStatusCode.StatusCodes.OK,
                        message: 'Car Added sucessfully'
                    })
                })
            }
        })
    }

    validateFields(req, res).then(response => {
        addCar(req, response.data).then(response => {
            res.status(response.status).json({
                data: response.data,
                message: response.message
            })
        }).catch(function (error) {
            res.status(error.status).json({
                data: error.data
            });
        });
    }).catch(error => {
        res.status(error.status).json({
            data: error.data,
            result: error.result
        });
    })
}
