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
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const offset = (page - 1) * limit;

    let params = [];

    if (searchTerm) {
        sql += " WHERE name LIKE ?";
        params.push(`%${searchTerm}%`);
    }
    sql += ` LIMIT ${limit} OFFSET ${offset}`;

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

//Route to the star system details
app.get('/stars/:id', (req, res) => {
    const starId = req.params.id;

    //two queries to access the star and its planets
    const starSQL = "SELECT * FROM stars WHERE id=?";
    const planetSQL = "SELECT * FROM planets WHERE star_id=?";

    //finding star
    db.query(starSQL, [starId], (err, starResults) => {
        if (err) return res.status(500).json(err);
        if (starResults.length === 0) return res.status(404).json({ message: "Star not found" });

        //finding its planets
        db.query(planetSQL, [starId], (err, planetResults) => {
            if (err) return res.status(500).json(err);

            //sending them together
            res.json({
                star: starResults[0],
                planets: planetResults
            });
        })
    })
})

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})