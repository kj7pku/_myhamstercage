var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var geoip = require('geoip-lite');
var url = "mongodb://root:Ny9eMRHYHS@mongodb-1612829049.default.svc.pokrandt.me";

var router = express.Router();

/* GET home page. */

router.get('/', function (req, res, next) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var geo = geoip.lookup(ip);
    res.render('index', {title: 'MyHamsterCage.com'});
});
router.post('/', function (req, res) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var geo = geoip.lookup(ip);

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let licenseFile = req.files.fcc.data;
    let email = req.body.email;
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("Licenses");
        var myobj = {
            email: email,
            licensePDF: licenseFile,
            region: geo.region,
            License: '',
            country: geo.country,
            ll: geo.ll,
            city: geo.city,
            ipaddress: ip,
            time: Date.now(),
            step: 0
        };
        dbo.collection("queue").insertOne(myobj, function (err, res) {
//            if (err) throw err;
            console.log("1 document inserted");
            db.close();
        });
    });

    res.send(res.render('complete', {title: 'MyHamsterCage.com', email: email}));
});

module.exports = router;
