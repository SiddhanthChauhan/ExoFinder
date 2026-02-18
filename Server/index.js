const express = require("express");
const app = express();
const cors = require("cors");
const mysql = require("mysql2");
//load the passwords
require('dotenv').config();

//To recieve JSON data FROM frontend
app.use(express.json());
//To allow frontend - backend call
app.use(cors());

//Connecting the DB
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

//Testing connection:
db.connect((err) => {
    if (err) {
        console.error("❌ Error connecting to MySQL:", err.message);
        return;
    }
    console.log("✅ Connected to MySQL Database 'exofinder'!");
})

//Check server running
app.get('/', (req, res) => {
    res.send("ExoFinder Backend is Linked Now! 🚀");
})

//Stars Route
app.get('/stars', (req, res) => {
    let sql = "SELECT * FROM stars";//this query gets sent to sql
    const searchTerm = req.query.search;

    let params = [];

    if (searchTerm) {
        sql += " WHERE name LIKE ?";
        params.push(`%${searchTerm}%`);
    }
    sql += " LIMIT 50"; //Limiting to 50

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Error fetching stars:", err);
            res.status(500).send("Database Error");
            return;
        }
        res.json(results);
    });
});

//Planets Route
app.get('/planets', (req, res) => {
    const sql = `SELECT planets.*,stars.name AS star_name 
    FROM planets 
    JOIN stars ON planets.star_id=stars.id`

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching planets:", err);
            res.status(500).send("Database Error");
            return;
        }
        res.json(results);
    })
})

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})