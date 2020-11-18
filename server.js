//'use strict'
// -------------------------
// Application Dependencies
// -------------------------
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');

// -------------------------
// Environment variables
// -------------------------
require('dotenv').config();
const HP_API_URL = process.env.HP_API_URL;

// -------------------------
// Application Setup
// -------------------------
const app = express();
const PORT = process.env.PORT || 3000;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({ extended: true }));

// Application Middleware override
app.use(methodOverride('_method'));

// Specify a directory for static resources
app.use(express.static('./public'));
app.use(express.static('./img'));

// Database Setup

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

// Set the view engine for server-side templating

app.set('view engine', 'ejs');


// ----------------------
// ------- Routes -------
// ----------------------
app.get('/home', handleHome);

app.get('/characters', handlecharacters);
app.post('/my-characters', handlefav);
app.get('/my-characters', handlefav1);
app.get('/my-characters/:id', handledetails);
app.put('/my-characters/:id', handleupdate);


// --------------------------------
// ---- Pages Routes functions ----
// --------------------------------
function handleHome(req, res) {

    res.render('index');
}
//-----------------------------------------------------------
function handlecharacters(req, res) {
    let url = HP_API_URL;
    superagent.get(url).then(data => {

        let hpArr = data.body.map(val => {
                return new Character(val)
            })
            //console.log(hpArr);
        res.render('characters', { result: hpArr })

    })
}
//-----------------------------------------------------------

function Character(val) {
    this.name = val.name ? val.name : 'no name';
    this.patronus = val.patronus ? val.patronus : 'no patronus';
    this.alive = val.alive;
    this.image = val.image;
}
// -----------------------------------
// --- CRUD Pages Routes functions ---
// -----------------------------------
//-----------------------------------------------------------
function handlefav(req, res) {
    let { name, image, alive, patronus } = req.body;

    let = sql = `insert into characters (name,image,alive,patronus) values ($1,$2,$3,$4);`;
    let val = [name, image, alive, patronus];
    client.query(sql, val).then(data => {
        //console.log(data);
        res.redirect('/my-characters')
    })
}
//-----------------------------------------------------------

function handlefav1(req, res) {
    let sql = `select * from characters ;`;
    client.query(sql).then(data => {
        res.render('my-characters', { result: data.rows })
    })
}
//-------------------------------------------------------------------
function handledetails(req, res) {
    let sql = `select * from characters where id=$1;`;
    let val = [req.params.id];
    client.query(sql, val).then(data => {
        console.log(data.rows);
        res.render('details', { result: data.rows })
    })
}
//-------------------------------------------------------------------

function handleupdate(req, res) {
    let { name, image, alive, patronus } = req.body;
    let sql = `update characters set name=$1, image=$2, alive=$3, patronus=$4 where id=$5 ;`;
    let val = [name, image, alive, patronus, req.params.id];
    client.query(sql, val).then(data => {
        console.log(data);
        res.redirect(`/details/${req.params.id}`)
    })
}


// Express Runtime
client.connect().then(() => {
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
}).catch(error => console.log(`Could not connect to database\n${error}`));