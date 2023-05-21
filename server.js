'use strict'
const express = require('express');
const server = express();

const cors = require('cors');
const axios = require('axios');
server.use(cors());
require('dotenv').config();
const apiKey = process.env.api_key;
const db = process.env.db;

const pg = require('pg');
const client = new pg.Client(db);
const PORT = process.env.PORT;
server.use(express.json());
client.connect()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`running on port ${PORT},Im ready..`)
        });
    });

function MovieApi(id, title, release_date, poster_path, overview) {
    this.id = id;
    this.title = title;
    this.release_date = release_date;
    this.poster_path = poster_path;
    this.overview = overview
}

let obj2 = {
    status: 500,
    resonseText: "Sorry, something went wrong"
};

server.delete('/deletitem/:id', deletitem);
server.put('/updateFavList', updateFavList);
server.put('/updateFavList', updateFavList);
server.get('/gitFavList', gitFavList);
server.post('/addToFav', addToFav);
server.get('/trending', TrendyMoviesEveryWeek);
server.get('/servererror', (req, res) => {
    res.status(500).send("Page Not Found");
});
server.get('*', (req, res) => {
    res.status(404).send(JSON.stringify(obj2));
});
server.use(errorHandler)
function TrendyMoviesEveryWeek(req, res) {
    try {

        let url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`;
        axios.get(url)
            .then(result => {

                let MovieApiList = result.data.results.map(item => {
                    let movie = new MovieApi(item.id, item.title, item.release_date, item.poster_path, item.overview)
                    return movie;
                })

                res.send(MovieApiList);
            })
            .catch((error) => {
                res.status(500).send(error);
            })
    }
    catch (error) {
        errorHandler(error, req, res);
    }
}
function gitFavList(req, res) {
    

       let sql=`SELECT * FROM favlist`
      client.query(sql)
      .then(data=>{
        console.log(data.rows);
        res.send(data.rows);
      })
      .catch(error => {
        errorHandler(error, req, res);
    })
    
}
function addToFav(req, res) {
    const favArray = req.body;
    const sql = `INSERT INTO favlist (id,title, release_date, overview, comment)
    VALUES ($1, $2, $3,$4,$5);`
    const values = [favArray.id,favArray.title, favArray.release_date, favArray.overview, favArray.comment];
    client.query(sql, values)
        .then(data => {
            res.send('data has been added');
        })
        .catch(error => {
            errorHandler(error, req, res);
        })
}

function updateFavList(req,res){
    const updatedData = req.body;
    const sql = `UPDATE favlist
    SET title = $1, release_date = $2, overview=$3,comment=$4 WHERE id=${updatedData.id};`
    const values = [updatedData.title, updatedData.release_date, updatedData.overview, updatedData.comment];
    client.query(sql, values)
    .then(data => {
        const sql = `SELECT * FROM favlist;`;
        client.query(sql)
            .then(allData => {
                res.send(allData.rows)
            })
            .catch((error) => {
                errorHandler(error, req, res)
            })
    })

        .catch(error => {
            errorHandler(error, req, res);
        })
}
function deletitem(req,res){
    const id = req.params.id;
    const sql = `DELETE FROM favlist WHERE id=${id};`
    client.query(sql)
    .then(data => {
        const sql = `SELECT * FROM favlist;`;
        client.query(sql)
            .then(allData => {
                res.send(allData.rows)
            })
            .catch((error) => {
                errorHandler(error, req, res)
            })
    })

           
        
        .catch(error => {
            errorHandler(error, req, res);
        })
}

function errorHandler(error, req, res) {
    const err = {
        errNum: 500,
        msg: error
    }
    res.status(500).send(err);
}
