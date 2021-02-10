const config = require('../../config')
var express = require("express");
var router = express.Router({
    caseSensitive: true,
});
var ensureToken = require('../../utilities/ensure-token.js');

const multer = require('multer');

const storageLocation = config.storagePath
let storage = multer.diskStorage({
    destination: (request, file, cb) => {
        cb(null, storageLocation)
    },
    filename: (request, file, cb) => {
        var fileType = '';
        if (file.mimetype === 'image/png')
            fileType = 'png'
        else if (file.mimetype === 'image/jpeg')
            fileType = 'jpg'
        cb(null, "image-" + Date.now() + "." + fileType)
    }
})
const upload = multer({ storage: storage })

/**
 *  Get All Cars
 * GET: /api/car/all
 */
var getAllCarsCtrl = require('../controllers/car-management/get-all-cars');
router.get("/all", ensureToken, function (req, res) {
    return getAllCarsCtrl.getAllCars(req, res);
});

/**
 *  Get Car By Id
 * GET:  /api/car/1
 */
var getCarByIdCtrl = require("../controllers/car-management/get-car-by-id");
router.get("/:id", ensureToken, function (req, res) {
    return getCarByIdCtrl.getCarById(req, res);
});

/**
 * Add Car
 * POST: /api/car/add
 */
var addCarCtrl = require('../controllers/car-management/add-car');
router.post('/add', ensureToken, (req, res) => {
    return addCarCtrl.addCar(req, res)
})
/**
 * Upload car image
 * POST: /api/car/upload/1
 */
const uploadImageCtrl = require('../controllers/car-management/upload-image')
router.post('/upload/:id', [ensureToken, upload.single('carImage')], (req, res) => {
    return uploadImageCtrl.uploadImage(req, res)
})

/**
 * Update car
 * PUT: /api/car/update/1
 */
const updateCarCtrl = require('../controllers/car-management/update-car')
router.put('/update/:id', ensureToken, (req, res) => {
    return updateCarCtrl.updateCar(req, res)
})

/**
 * Delete Car
 * DELETE: /api/car/delete/1
 */
const deleteCarCtrl = require('../controllers/car-management/delete-car')
router.delete('/delete/:id', ensureToken, (req, res) => {
    return deleteCarCtrl.deleteCar(req, res)
})

module.exports = router
