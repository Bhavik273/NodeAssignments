const HttpStatusCode = require('http-status-codes')
var validate = require('validator');
var dbConnection = require('../../../utilities/postgresql-connection.js');

exports.deleteCar = (req, res) => {
    var entityData = {
        id: req.params.id
    }

    function validateFields(req, res) {
        return new Promise((resolve, reject) => {
            let isCarIdValid = validate.isInt(entityData.id)

            if (!isCarIdValid) {
                return reject({
                    status: HttpStatusCode.StatusCodes.BAD_REQUEST,
                    result: req.i18n.__('CarIdInvalid')
                })
            }
            let id = parseInt(entityData.id)
            if (id < 1) {
                return reject({
                    status: HttpStatusCode.StatusCodes.BAD_REQUEST,
                    result: req.i18n.__('CarIdPositive')
                })
            }
            return resolve({
                status: HttpStatusCode.StatusCodes.OK,
                data: entityData
            })
        })
    }

    function deleteCar(req, entityData) {
        return new Promise((resolve, reject) => {
            let query = `DELETE FROM car WHERE id=${entityData.id}`
            dbConnection.getResult(query).then(result => {
                return resolve({
                    status: HttpStatusCode.StatusCodes.OK,
                    result: `Car deleted with id:${entityData.id}`
                })
            })
        })
    }

    validateFields(req, res).then((response) => {
        deleteCar(req, response.data).then(response => {
            res.status(response.status).json({
                data: response.data,
                message: response.result
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