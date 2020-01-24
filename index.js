const express = require('express');
const bodyParser = require('body-parser');
var app = require('express')();

var http = require('http').Server(app);
var io = require('socket.io')(http);


var cors = require('cors');
var dateFormat = require('dateformat');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
//var url = "mongodb://savecosmos:8RDXIKNbPhriD7x1MZH2XhQhj4MBIax4RLLmKolstAbRLDWkP30IRg74lNKw3ZFTOEvnDnJWcuQsPxNvOLcRIQ==@savecosmos.documents.azure.com:10255/?ssl=true";
var url = "mongodb://localhost:27017/";
var dateFormat = require('dateformat');
var moment = require('moment');
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());


function headerSet(error,res,result){
  if (error) throw error;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');    
  res.send(result);
}
function errorHandle(err){
  if (err) throw err;
}
function weekBefore(req,res,isLogic){
  


  MongoClient.connect(url, function(err, db) {
      errorHandle(err);
      
var dbo = db.db("temp");
      dbo.collection("temp").findOne({"inputData.dataSource":req.body.dataSource}, function(error, result) {
          errorHandle(error);
          
          var filterSource = result !=null ? result.inputData.find(function(data){return(data.dataSource ==req.body.dataSource)}) : null;
          if(filterSource !=null){

            var usaTime = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
  var date = new Date(usaTime);
  date.setDate(date.getDate() - 7);
  var weekBefore = dateFormat(date, "yyyy-mm-dd HH:MM:ss");

var current =date;
            var maxDate =  new Date ( current );
            maxDate.setMinutes ( current.getMinutes() + filterSource.inputcommand.timeInterval /60000 );
  
            var minDate =  new Date ( current );
            minDate.setMinutes ( current.getMinutes() - filterSource.inputcommand.timeInterval /60000 );
            var closest = filterSource.readingTemperature.reduce(function(prev, curr) {
              return (Math.abs(new Date(curr.createtime) - new Date(weekBefore)) < Math.abs(new Date(prev.createtime) - new Date(weekBefore)) ? curr : prev);
              
          });
          closest.active =true;
            if(minDate < new Date(closest.createtime) && new Date(closest.createtime) < maxDate){
              headerSet(error,res,closest);
            }else{
              var dataRs = {
                responsecode :200,
                  response:"data Not Found"
                 }
             return  headerSet(error,res,dataRs);
            }
          }else{
            var dataRs = {
               responsecode :200,
                 response:"data Not Found"
                }
            return  headerSet(error,res,dataRs);
          }
         
            // });
          // if(minDate<new Date(closest.createtime) && new Date(closest.createtime)<maxDate){
          //   closest.active =true;
          //   return isLogic ? closest : headerSet(error,res,closest);
          // }else{
          //  var data = {
          //    responsecode :200,
          //    response:"data Not Found"
          //  }
        //  }
         // var found = filterSource.readingTemperature.filter(function(data){return(data.createtime.split(":")[0] == weekBefore)})
       
        });
      });
}

app.get('/', (req, res) => {
  MongoClient.connect(url, function(err, db) {
    errorHandle(err);
    
var dbo = db.db("temp");
    dbo.collection("temp").findOne({}, function(error, result) {
      headerSet(error,res,result);
    });
    });
});
io.on('connection', function(socket) {
   console.log('A user connected');

  socket.on('clientEvent', function(data) {
      console.log(data);
   });
   socket.on('disconnect', function () {
      console.log('A user disconnected');
   });
});




app.post('/sensorDetails', (req, res) => {

  MongoClient.connect(url, function(error1, db) {
      errorHandle(error1);
      var usaTime = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
      var date = new Date(usaTime);
    var dateToday = dateFormat(date, "yyyy-mm-dd HH:MM:ss");
    
   // var hisData = weekBefore(histrocalData,res,logicSide);

    if(req.body.keyInput.keyName == 'Comfy'){

    }else if(req.body.keyInput.keyName == 'Hot'){

    }else if(req.body.keyInput.keyName == 'Cold'){

    }


    var fulljson={
      "result_code": 1,
      "inputData": [
        {
          "dataSource": req.body.dataSource,
          "readingTemperature": [
            {
              "macAddress": req.body.macAddress,
              "createtime": dateToday,
              "temperature": req.body.temperature,
              "temperatureUnit": req.body.temperatureUnit,
              "dataSourceLocation": req.body.dataSourceLocation,
              "keyInput": req.body.keyInput
            }
          ],
          "inputcommand": req.body.inputcommand
        }
      ]
    }
    var nodatSource ={ $addToSet: { "inputData":{
      "dataSource": req.body.dataSource,
      "readingTemperature": [
        {
          "macAddress": req.body.macAddress,
          "createtime":  dateToday,
          "temperature": req.body.temperature,
          "temperatureUnit": req.body.temperatureUnit,
          "dataSourceLocation": req.body.dataSourceLocation,
          "keyInput": req.body.keyInput
        }
      ],
      "inputcommand": req.body.inputcommand
    }
  }
  }
    var dataField = { $addToSet: { 
      "inputData.$.readingTemperature": {
       "macAddress" : req.body.macAddress,
      "createtime" :  dateToday,
      "temperature" : req.body.temperature,
      "temperatureUnit" : req.body.temperatureUnit,
      "dataSourceLocation" : req.body.dataSourceLocation,
      "keyInput" : req.body.keyInput
    } } }
    
var dbo = db.db("temp");
    dbo.collection("temp").findOne({inputData: {$exists: true, $not: {$size: 0}}},function(error2,response){
      errorHandle(error2);
      if(response !=null){
        dbo.collection("temp").findOne({"inputData.dataSource":req.body.dataSource}, function(error3, result) {
          errorHandle(error3);
          if(result !=null){
            dbo.collection("temp").updateMany( { "inputData.dataSource": req.body.dataSource },
            dataField, function(error4, result1) {
              errorHandle(error4);
              var sendData={
                "responsecode":200,
                "data":"Data Stored SucessFully"
              }
              headerSet(error4,res,sendData);
            
            });
          }else{
            dbo.collection("temp").updateMany( {inputData: {$exists: true, $not: {$size: 0}}},
              nodatSource, function(error5, result2) {
              errorHandle(error5);
              var sendData={
                "responsecode":200,
                "data":"Data Stored SucessFully"
              }
              headerSet(error5,res,sendData);
            });
           
          }
        })
      }else{
        dbo.collection("temp").insertOne(fulljson, function(error6, newEntryRes) {
          errorHandle(error6);
          var sendData={
            "responsecode":200,
            "data":"Data Stored SucessFully"
          }
          headerSet(error6,res,newEntryRes);
          
        });
      }

    })
    

      });
});
app.post('/today', (req, res) => {
   console.log(req.body.dataSource);
  // req.body.dataSource = 124;
   weekBefore(req,res)
 
});


app.post('/uirequest',(req, res) => {
console.log(req.body);
var date = new Date();
var weekBefore = dateFormat(date, "yyyy-mm-dd HH:mm:ss");
res.setHeader('Access-Control-Allow-Origin', '*');    
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');    
res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');      
res.setHeader('Access-Control-Allow-Credentials', true); 
res.send('Request sent');
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("temp");
  dbo.collection("temp").findOne({}, function(err, result) {
console.log(result);
  });

});

});




http.listen(8080, () => {
    console.log("Server is listening on port 8080");
});