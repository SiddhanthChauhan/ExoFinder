const fs = require('fs');
const csv = require('csv-parser');
const mysql = require('mysql2/promise'); //Promise for ASYNC AWAIT
require('dotenv').config();

async function seedDatabase() {
    //Connection to MySQL ( the database )
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    })

    console.log("✅ Connected to Vault. Starting ETL Pipeline...");
    const results = [];

    //EXTRACTION PHASE!!
    fs.createReadStream('exoplanets.csv')
        //Ignoring the '#' in csv file
        .pipe(csv({ comment: '#' }))
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            console.log(`📦 Extracted ${results.length} rows from CSV.`);
            console.log(`Testing the pipeline with the first 5 rows...`);


            for (let row of results) {


                //TRANSFORMATION PHASEEEEE!!
                const starName = row.hostname;
                const planetName = row.pl_name;
                const specType = row.st_spectype || 'Unknown';
                const tempK = parseFloat(row.st_teff) || null;
                // 1 Parsec = 3.262 Light Years
                const distLy = parseFloat(row.sy_dist) ? (parseFloat(row.sy_dist) * 3.262).toFixed(2) : null;

                // Telescope Coordinates
                const ra = parseFloat(row.ra) || null;
                const dec = parseFloat(row.dec) || null;
                const vMag = parseFloat(row.sy_vmag) || null;

                // Planet Details
                const massJup = parseFloat(row.pl_bmassj) || null;
                const radJup = parseFloat(row.pl_radj) || null;
                const orbPer = parseFloat(row.pl_orbper) || null;
                const eqTemp = parseFloat(row.pl_eqt) || null;


                //isHabitable Logic : Goldilocks
                let isHabitable = false;
                if (radJup != null && eqTemp != null) {
                    if (radJup < 0.25 && (eqTemp >= 200 && eqTemp <= 320)) {
                        isHabitable = true;
                    }
                }


                //LOADING PHASEEE!!
                //CHECKING == ENABLING IDEMPOTENCY
                //Checking if star already in DB
                const [existingStars] = await db.query('SELECT id FROM stars WHERE name=?', [starName]);
                let starId;

                if (existingStars.length > 0) {
                    starId = existingStars[0].id;
                }
                else {
                    const [starResult] = await db.query(
                        'INSERT INTO stars (name, spectral_type, temperature_k, distance_ly, ra, dec_deg, v_mag) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [starName, specType, tempK, distLy, ra, dec, vMag]
                    );
                    starId = starResult.insertId;
                    console.log(`⭐ Created Star: ${starName}`);
                }

                //Creating the planet linked to star after checking if it exists

                const [existingPlanets] = await db.query('SELECT id FROM planets WHERE name=?', [planetName]);
                if (existingPlanets.length > 0) {
                    // It exists! Skip it.
                    console.log(`   ⏩ Skipped Duplicate Planet: ${planetName}`);
                }
                else {
                    // It doesn't exist! Create it.
                    await db.query(
                        'INSERT INTO planets (name, star_id, mass_jup, radius_jup, orbital_period_days, is_habitable) VALUES (?, ?, ?, ?, ?, ?)',
                        [planetName, starId, massJup, radJup, orbPer, isHabitable]
                    );
                    console.log(`   🪐 Created Planet: ${planetName}`);
                }


            }

            console.log("✅ Test Batch Complete! Check MySQL Workbench.");
            process.exit(); //Stops the node to run after it completes
        })
}

seedDatabase(); //Fire it