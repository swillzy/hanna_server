const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(favicon(path.join(__dirname, 'src', 'assets', 'hanna.ico')));
app.set('trust proxy', true);

const _tokens = [
    'eb61178531214ebff5d1cd77005bbb5b951912de5df631369880b444a7a6213f' // hanna app
];

const accessWriteStream = fs.createWriteStream('./src/access.log', {
    flags: 'a'
});

// mongodb database connection
const dbPath = 'mongodb://127.0.0.1:27017/hanna';
const dbOptions = { useNewUrlParser: true, useUnifiedTopology: true };
const mongo = mongoose.connect(dbPath, dbOptions);
mongo.then(() => {
    console.log('Connected to database');
}, err => {
    console.error(err);
});

app.get('/', () => {
    return;
});

app.get('/hanna', (req, res) => {
    console.log('/hanna/getdata' + JSON.stringify(req.query));
    res.redirect('/hanna/getdata?' + JSON.stringify(req.query).replace(/:/g, '=').replace(/[{}]/g, '').replace(/,/g, '&').replace(/"/g, ''));
});

app.get('/hanna/getdata', (req, res) => {
    if (!req.query._token || !_tokens.includes(req.query._token)) {
        res.send({ 'status': 403, 'error': 'You need to provide a valid _token' }); 
    } else {
        accessWriteStream.write(`[${getDate()}] ${req.query._token} on ${req.ip} >> GET_HANNA_DATA${os.EOL}`);
        res.sendStatus(200);
    }
});

app.post('/hanna/setname', (req, res) => {
    if (!req.body._token || !_tokens.includes(req.body._token)) {
        res.send({ 'status': 403, 'error': 'You need to provide a valid _token' }); 
    } else {
        accessWriteStream.write(`[${getDate()}] ${req.body._token} on ${req.ip} >> SET_HANNA_NAME >> ${req.body.newname}${os.EOL}`);
        res.sendStatus(200);
    }
});

const listener = app.listen(8000, function () {
    console.log('Linstening to port ' + listener.address().port);
});

function getDate() {
    var date = new Date();
    var datetime = date.getDate().toString().padStart(2, '0') + '/' + (date.getMonth() + 1).toString().padStart(2, '0') + '/' + date.getFullYear() + '-' + date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0') + ':' + date.getSeconds().toString().padStart(2, '0');

    return datetime;
}