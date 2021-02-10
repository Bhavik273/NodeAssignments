module.exports = {
    dbConnection: {
        user: "postgres",
        password: "",/*Add Password here*/
        host: "localhost",
        database: "CarDB",
        port: 5432
    },
    server: {
        PORT: 3000,
    },
    jwtConfig: {
        algorithm: "HS256",
        secretKey: "Test@12345",
    },
    imagePath: 'http://localhost:3000/images/',
    storagePath: './public/images'

};