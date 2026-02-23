const express = require("express");
const app = express();
const cors = require("cors");
const mysql = require("mysql2");
//load the passwords
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


//To recieve JSON data FROM frontend
app.use(express.json());
//To allow frontend - backend call
app.use(cors());

//Connecting the DB
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false
    }
});

//Testing connection:
db.connect((err) => {
    if (err) {
        console.error("❌ Error connecting to MySQL:", err.message);
        return;
    }
    console.log("✅ Connected to Aiven MySQL Cloud Database 'exofinder'!");
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
    // Changes : Added condition for the game mode where all stars are required and not ust first 50
    if (req.query.limit === 'all') {
        // If React asks for 'all', we skip the LIMIT entirely to fetch the whole DB!
        // (We don't append anything to the SQL string here)
    } else {
        // Otherwise, fallback to the standard 50-per-page for the Database view
        const page = parseInt(req.query.page) || 1;
        const limit = 50;
        const offset = (page - 1) * limit;
        sql += ` LIMIT ${limit} OFFSET ${offset}`;
    }

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

// AI LORE GENERATOR ENDPOINT
app.post('/api/lore', async (req, res) => {
    try {
        // 1. Receive the star data from the frontend
        const { starName, spectralType, distance, planetsCount } = req.body;

        // 2. Build the exact prompt for Gemini
        const prompt = `You are a futuristic starship tactical computer. 
        Write a strict 2-sentence system analysis for a star named ${starName}. 
        Data: Spectral Type is ${spectralType || 'Unknown'}, Distance is ${distance || 'Unknown'} light years, Orbiting planets: ${planetsCount}. 
        Tone: Cold, analytical, sci-fi, and professional. Do not use quotation marks or conversational greetings.`;

        // 3. Ask Gemini to generate the content
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        // 4. Send the text back to the frontend
        res.json({ lore: response.text });

    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ error: "Tactical computer offline. Unable to generate lore." });
    }
});

const PORT = process.env.PORT ||  3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})