var csv = require('csv-to-json');
var express = require('express');
var app = express();

var obj = { filename: __dirname + "\\ATTL1-CSV.csv" };

app.use("/js", express.static(__dirname + '/js'));
app.use("/css", express.static(__dirname + '/css'));
app.use("/lib", express.static(__dirname + '/node-proj4js/lib'));

app.get('/getCSV',function(req,res){
    csv.parse(obj,function(err, json){
        for(var i = 0; i < json.length; i++){
            json[i].Lat = parseFloat(json[i].Lat);
            json[i].Lng = parseFloat(json[i].Lng);
        }
        res.send(JSON.stringify(json));
    });
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '\\Pages\\Map.html');
});
 
app.listen(3000);