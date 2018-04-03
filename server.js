const express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cons = require('consolidate'),
    dust = require('dustjs-helpers'),
    pg = require('pg'),
    app = express(),
    multer = require('multer'),
    upload = multer({
        dest: 'uploads/'
    }),
    fs = require('fs'),
    fetch = require('node-fetch');

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var staticPath = path.join(__dirname, '/public');

app.use(express.static(staticPath));

app.listen(3000, function () {
    console.log('Server running on port 3000');
});

app.post('/video', upload.single('video'), function (req, res, next) {
    console.log('/video POST start')
    console.log(req.body.threadtitle)
    console.log(req.body.username)
    console.log(req.file.filename)
    let dt = new Date();
    var utcDate = dt.toUTCString();
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("not able to get connection " + err);
            res.status(400).send(err);
        }
        client.query(`INSERT INTO posts (videopath, thumbnailpath, timecreated, user_id, thread_id)
        VALUES ('uploads/${req.file.filename}.webm','uploads/${req.file.filename}.jpg', ${utcDate}, ${req.body.username}, 2 );`, function (err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
            res.render('threads', {
                threads: result.rows
            });
        });
    });
    res.end(console.log('/video POST end'))

})

app.post('/form', (req,res) => {
    console.log('/form POST start')
    console.log(`Thread Title: ${req.body.threadtitle}`)
    res.end(console.log('/form POST end'))
})

config = {
    host: 'localhost',
    // user: 'ubuntu',
    user: 'aarongross',
    database: 'townsquare_db',
    port: 5432,
    password: 'square',
    max: 10, // max number of connection can be open to database
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle befo$
};
let pool = new pg.Pool(config);

app.engine('dust', cons.dust);
app.set('view engine', 'dust');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

let getSuffix = function (req) {
    return req.url.split('/').pop();
};

// GET 

app.get('/', (req, res) => {
    res.redirect('/threads');
});

app.get('/threads', function (req, res) {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("not able to get connection " + err);
            res.status(400).send(err);
        }
        client.query(` SELECT DISTINCT ON(psts.thread_id) psts.videopath, psts.thumbnailpath, psts.timecreated, 
                            thrds.title, thrds.id, usrs.username
                        FROM threads thrds
                        JOIN posts psts
                        ON psts.thread_id = thrds.id
                        JOIN users usrs
                        ON psts.user_id = usrs.id
                        ORDER BY psts.thread_id, psts.timecreated; `, function (err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
            res.render('threads', {
                threads: result.rows
            });
        });
    });
});

app.get('/thread/*', function (req, res) {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("not able to get connection " + err);
            res.status(400).send(err);
        }
        let postId = parseInt(getSuffix(req)),
            prevPostId = 4;
        console.log('postId1: ', postId);

        let rex = new RegExp('^[0-9]$'); //  '/[0-9]+[\/]?$/');
        if (rex.test(postId)) {
            prevPostId = postId;
            console.log('postId2: ', postId);
        } else {
            postId = prevPostId;
            console.log('postId3: ', postId);
        }

        client.query(` SELECT psts.videopath, psts.thumbnailpath, psts.timecreated, thrds.title, thrds.id, usrs.username, psts.id
                        FROM threads thrds
                        JOIN posts psts
                        ON psts.thread_id = thrds.id
                        JOIN users usrs
                        ON psts.user_id = usrs.id
                        WHERE psts.thread_id = ${postId}
                        ORDER BY psts.timecreated;`, function (err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
            res.render('thread', {
                threads: result.rows
            });
        });
    });
});

app.get('/createPost', function (req, res) {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("not able to get connection " + err);
            res.status(400).send(err);
        }
        client.query('SELECT * from posts', function (err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
            res.render('createPost', {
                posts: result.rows
            });
        });
    });
});

function logFetch(url) {
    return fetch(url)
        .then(response => response.text())
        .then(text => {
            console.log('TEXT', text);
        }).catch(err => {
            console.error('fetch failed', err);
        });
}