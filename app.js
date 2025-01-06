const express = require("express");
const dotenv = require("dotenv");
const pg = require("pg");
const bodyParser = require("body-parser");
const { exportedFunctions } = require('./public/WeatherCalculator');

var session = require("express-session");

/* Reading global variables from config file */
dotenv.config();
const PORT = process.env.PORT;
const conString = process.env.DB_CON_STRING;

if (conString == undefined) {
    console.log("ERROR: environment variable DB_CON_STRING not set.");
    process.exit(1);
}

const dbConfig = {
    connectionString: conString,
    ssl: { rejectUnauthorized: false }
}

var dbClient = new pg.Client(dbConfig);
dbClient.connect();

const urlencodedParser = bodyParser.urlencoded({
    extended: false
});

app = express();

app.use(session({
    secret: "This is a secret!",
    resave: true,
    saveUninitialized: true
}));

//turn on serving static files (required for delivering css to client)
app.use(express.static("public"));
//configure template engine
app.set("views", "views");
app.set("view engine", "pug");

//"npm i bootstrap-icons" needed to use Bootstrap icons as "i" element in pug
/* Release 0 static values:
const { readingsArray } = require('./public/staticValues');
const stations = [readingsArray[0][0], readingsArray[1][0], readingsArray[2][0]];
*/
app.get('/', (req, res) => {
    if (req.session.user != undefined) {
       res.redirect("/dashboard");
    } else {
        res.render("index");
    }
});

app.post("/", urlencodedParser, (req, res) => {
    var userEmail = req.body.email;
    var userPass = req.body.passwort;

    dbClient.query("SELECT * FROM users WHERE email=$1 AND passwort=$2", [userEmail, userPass], (dbError, dbResponse) => {
        if (dbResponse.rows.length == 0) {
            res.render("index", {
                login_error: "Die Anmeldung war nicht erfolgreich. Bitte überprüfen Sie Ihre E-Mail-Adresse und Passwort und versuchen Sie es erneut!"
            });
        } else {
            req.session.user = {
                userId: dbResponse.rows[0].id
            };
            res.redirect("/dashboard");
        }
    });
});

app.get('/signup', (req, res) => {
    if (req.session.user != undefined) {
        res.redirect("/dashboard");
    } else {
        res.render("signup");
    }
});

app.post('/signup', urlencodedParser, (req, res) => {
    var userEmail = req.body.email;
    var userVorname = req.body.vorname;
    var userNachname = req.body.nachname;
    var userPasswort = req.body.passwort;

    dbClient.query("SELECT * FROM users WHERE email=$1", [userEmail], (dbError, dbResponse) => {
        if (dbResponse.rows.length == 0) {
            dbClient.query("INSERT INTO users (email, vorname, nachname, passwort) VALUES ($1, $2, $3, $4)", [userEmail, userVorname, userNachname, userPasswort], (dbError, dbResponse) => {
                res.redirect('/');
            });
        } else {
            res.render("signup", {
                already_used_email: userEmail
            });
        }
    });
});

app.get('/dashboard', async (req, res) => {
    if (req.session.user != undefined) {
        try {
            var userId = req.session.user.userId;
            var dbResponse = await dbClient.query("SELECT id FROM stations WHERE user_id=$1", [userId]);
            var stationsCounter = dbResponse.rows.length;
            var stationsIds = dbResponse.rows;
            var stations = [];
            for (var i = 0; i < stationsCounter; i++) {
                var dbReadingsResponse = await dbClient.query("SELECT name, latitude, longitude, wetter, temperatur, wind, luftdruck, readings.station_id AS id, windrichtung FROM readings JOIN stations ON readings.station_id = stations.id WHERE station_id=$1 ORDER BY readings.id DESC", [stationsIds[i].id]);
                var readingsForSingleStation = dbReadingsResponse.rows;
                if (readingsForSingleStation[0] === undefined) {
                    var dbStationsResponse = await dbClient.query("SELECT id, name, latitude, longitude FROM stations WHERE id=$1", [stationsIds[i].id]);
                    var stationWithoutReadings = dbStationsResponse.rows[0];
                    stations.push(stationWithoutReadings);
                } else {
                    var topReadingForSingleStation = readingsForSingleStation[0];
                    topReadingForSingleStation.wind_direction = exportedFunctions.calculateWindDirection(topReadingForSingleStation.windrichtung);
                    topReadingForSingleStation.temp_min = exportedFunctions.calculateTempMin(readingsForSingleStation);
                    topReadingForSingleStation.temp_max = exportedFunctions.calculateTempMax(readingsForSingleStation);
                    topReadingForSingleStation.wind_min = exportedFunctions.calculateWindspeedMin(readingsForSingleStation);
                    topReadingForSingleStation.wind_max = exportedFunctions.calculateWindspeedMax(readingsForSingleStation);
                    topReadingForSingleStation.luftdruck_min = exportedFunctions.calculatePressureMin(readingsForSingleStation);
                    topReadingForSingleStation.luftdruck_max = exportedFunctions.calculatePressureMax(readingsForSingleStation);
                    topReadingForSingleStation.temp_trend = exportedFunctions.calculateTemperatureTrend(readingsForSingleStation);
                    topReadingForSingleStation.wind_trend = exportedFunctions.calculateWindspeedTrend(readingsForSingleStation);
                    topReadingForSingleStation.luftdruck_trend = exportedFunctions.calculatePressureTrend(readingsForSingleStation);
                    stations.push(topReadingForSingleStation);
                }
            }
            res.render("dashboard", { stations: stations });
        } catch (e) {
            console.log("Error fetching stations: " + e);
        }
    } else {
        res.redirect('/');
    }
});

app.post('/dashboard', urlencodedParser, (req, res) => {
    var stationId = req.body.station_id;
    var stationName = req.body.station_name;
    var stationLatitude = req.body.station_latitude;
    var stationLongitude = req.body.station_longitude;

    if (req.session.user != undefined) {
        var userId = req.session.user.userId;
        if (stationId != undefined) {
            dbClient.query("DELETE FROM readings WHERE station_id=$1", [stationId], (dbError, dbResponse) => {
                dbClient.query("DELETE FROM stations WHERE id=$1", [stationId], (dbError, dbResponse) => {
                    res.redirect('dashboard');
                });
            });
        } else {
            dbClient.query("INSERT INTO stations (name, latitude, longitude, user_id) VALUES ($1, $2, $3, $4)", [stationName, stationLatitude, stationLongitude, userId], (dbError, dbResponse) => {
                res.redirect('dashboard');
            });
        }
    } else {
        res.redirect('/');
    }
});

app.get('/stations/:id', async (req, res) => {
    const stationId = req.params.id;
    if (req.session.user != undefined) {
        try {
            var userId = req.session.user.userId;
            var dbResponseStations = await dbClient.query("SELECT * FROM stations WHERE id=$1 AND user_id=$2", [stationId, userId]);
            var userStationIds = dbResponseStations.rows;
            if (userStationIds.length === 0) {
                res.redirect("/dashboard");
            } else {
                var dbResponse = await dbClient.query("SELECT name, latitude, longitude, readings.id AS reading_id, zeitpunkt, wetter, temperatur, wind, luftdruck, station_id, windrichtung FROM readings JOIN stations ON readings.station_id = stations.id WHERE station_id=$1 ORDER BY reading_id DESC", [stationId]);
                var readingsForSingleStation = dbResponse.rows;
                if (readingsForSingleStation.length === 0) {
                    var dbNewResponse = await dbClient.query("SELECT stations.id AS station_id, name, latitude, longitude FROM stations WHERE id=$1", [stationId]);
                    readingsForSingleStation = dbNewResponse.rows;
                } else {
                    readingsForSingleStation[0].wind_direction = exportedFunctions.calculateWindDirection(readingsForSingleStation[0].windrichtung);
                    readingsForSingleStation[0].temp_min = exportedFunctions.calculateTempMin(readingsForSingleStation);
                    readingsForSingleStation[0].temp_max = exportedFunctions.calculateTempMax(readingsForSingleStation);
                    readingsForSingleStation[0].wind_min = exportedFunctions.calculateWindspeedMin(readingsForSingleStation);
                    readingsForSingleStation[0].wind_max = exportedFunctions.calculateWindspeedMax(readingsForSingleStation);
                    readingsForSingleStation[0].luftdruck_min = exportedFunctions.calculatePressureMin(readingsForSingleStation);
                    readingsForSingleStation[0].luftdruck_max = exportedFunctions.calculatePressureMax(readingsForSingleStation);
                    readingsForSingleStation[0].temp_trend = exportedFunctions.calculateTemperatureTrend(readingsForSingleStation);
                    readingsForSingleStation[0].wind_trend = exportedFunctions.calculateWindspeedTrend(readingsForSingleStation);
                    readingsForSingleStation[0].luftdruck_trend = exportedFunctions.calculatePressureTrend(readingsForSingleStation);
                }
                res.render("station", {
                    readings: readingsForSingleStation
                });
            }
        } catch (e) {
            console.log("Error fetching readings: " + e);
        }
    } else {
        res.redirect('/');
    }
});

app.post('/stations', urlencodedParser, (req, res) => {
    var stationId = req.body.station_id;
    var readingId = req.body.reading_id;
    var readingCode = req.body.reading_wetter;
    var readingTemp = req.body.reading_temperatur;
    var readingWindSpeed = req.body.reading_wind_speed;
    var readingWindRichtung = req.body.reading_wind_richtung;
    if (readingWindRichtung > 360) {
        readingWindRichtung = readingWindRichtung - 360;
    }
    var readingLuftdruck = req.body.reading_luftdruck;

    if (req.session.user != undefined) {
        if (readingId != undefined) {
            dbClient.query("DELETE FROM readings WHERE id=$1", [readingId], (dbError, dbResponse) => {
                res.redirect('/stations/'+stationId);
            });
        } else {
            dbClient.query("INSERT INTO readings (wetter, temperatur, wind, luftdruck, station_id, windrichtung, zeitpunkt) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)", [readingCode, readingTemp, readingWindSpeed, readingLuftdruck, stationId, readingWindRichtung], (dbError, dbResponse) => {
                res.redirect('/stations/'+stationId);
            });
        }
    } else {
        res.redirect('/');
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy( (err) => {
        console.log("Session destroyed.");
    })
    res.render("index");
});

app.listen(PORT, function() {
  console.log(`Weathertop running and listening on port ${PORT}`);
});
