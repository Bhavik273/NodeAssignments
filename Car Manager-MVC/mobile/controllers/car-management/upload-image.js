const HttpStatusCode = require('http-status-codes')
var validate = require('validator');
var dbConnection = require('../../../utilities/postgresql-connection.js');
const fs = require('fs')

exports.uploadImage = (req, res) => {
    var entityData = {
        Id: req.params.id
    };

    function validateFields(req, res) {
        return new Promise(function (resolve, reject) {
            //check if request has any valid file uploaded
            if (!req.file) {
                return resolve({
                    status: HttpStatusCode.StatusCodes.BAD_REQUEST,
                    result: req.i18n.__('ImageNotFound')
                });
            }
            var isCarIdEmpty = validate.isEmpty(entityData.Id);
            if (isCarIdEmpty) {
                return resolve({
                    status: HttpStatusCode.StatusCodes.BAD_REQUEST,
                    result: req.i18n.__('CarIdRequired')
                });
                //return res.status(400).send({ result: req.i18n.__('UserIdRequired') });
            }

            var isCarIdValid = validate.isInt(entityData.Id)

            if (!isCarIdValid) {
                fs.unlink(req.file.path, (err) => { if (err) console.log(err) })
                return reject({
                    status: HttpStatusCode.StatusCodes.BAD_REQUEST,
                    result: req.i18n.__('CarIdInvalid')
                })
            }
            let id = parseInt(entityData.Id)
            if (id < 1) {
                fs.unlink(req.file.path, (err) => { if (err) console.log(err) })
                return reject({
                    status: HttpStatusCode.StatusCodes.BAD_REQUEST,
                    result: req.i18n.__('CarIdPositive')
                })
            }

            return resolve({
                status: HttpStatusCode.StatusCodes.OK,
                data: entityData
            });
        });
    }

    function uploadImage(req, entityData) {
        return new Promise((resolve, reject) => {
            //check if there is any car with given id
            let query = `SELECT id FROM car WHERE id=${parseInt(entityData.Id)}`
            dbConnection.getResult(query)//await pool.query('SELECT id FROM car WHERE id=$1', [id])
                .then(result => {
                    //car with Id is found
                    if (result.data.length > 0) {
                        //Insert corrosponding record in carImages table
                        let query = "INSERT INTO carImages(car_id,imagename,createdate) VALUES (" + parseInt(entityData.Id) + ",'" +
                            req.file.filename + "','" + new Date().toISOString() + "')"
                        dbConnection.getResult(query)
                            .then(result => {
                                return resolve({
                                    status: HttpStatusCode.StatusCodes.OK,
                                    data: result,
                                    message: 'Record listed successfully!!!'
                                });
                            })
                    }
                    //no car with given ID
                    else {
                        //remove uploaded image from storage
                        fs.unlink(req.file.path, (err) => { if (err) console.log(err) })
                        return resolve({
                            status: HttpStatusCode.StatusCodes.OK,
                            message: `No car with id:${entityData.Id}`
                        })
                    }
                }).catch(function (error) {
                    res.status(error.status).json({
                        data: error.data
                    });
                });
        })
    }

    validateFields(req, res).then(function (response) {
        uploadImage(req, response.data).then(function (response) {
            res.status(response.status).json({
                data: response.data,
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
                data: error.data,
                result: error.result
            });
        });

}
