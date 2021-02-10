var dbConnection = require('./postgresql-connection');

exports.getCarModel = async (carModel) => {
    return new Promise((resolve, reject) => {
        let query = `SELECT id,"Name" from model where LOWER("Name")=LOWER('${carModel}')`
        dbConnection.getResult(query)
            .then(result => {
                if (result.data.length > 0)
                    return resolve(result.data[0].id)
                else {
                    query = `INSERT INTO model("Name") VALUES('${carModel}') RETURNING id`
                    dbConnection.getResult(query).then(result => {
                        return resolve(result.data[0].id)
                    })
                }
            })
    });
}

exports.getCarMake = async (carMake) => {
    return new Promise((resolve, reject) => {
        let query = `Select id from make where LOWER(make."name")=LOWER('${carMake}')`
        dbConnection.getResult(query)
            .then(result => {
                if (result.data.length > 0)
                    return resolve(result.data[0].id)

                else {
                    dbConnection.getResult(`INSERT INTO make(name) VALUES('${carMake}') RETURNING id`)
                        .then(result => {
                            return resolve(result.data[0].id)
                        })
                }
            })
    });
}

exports.carExists = async (carName) => {
    return new Promise((resolve, reject) => {
        let query = `SELECT car."Name" from car where LOWER(car."Name")=LOWER('${carName}')`
        dbConnection.getResult(query).then(result => {
            return resolve(result.data.length > 0)
        })
    });
}