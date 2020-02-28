'use strict'

// C library API
const ffi = require('ffi-napi');
// const ref = require('ref'); // Used to make pointer variables for functions

// Express App (Routes)
const express = require("express");
const app = express();
const path = require("path");
const fileUpload = require('express-fileupload');

app.use(fileUpload());
app.use(express.static(path.join(__dirname + '/uploads')));

// Minimization
const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');

// Important, pass in port as in `npm run dev 1234`, do not change
const portNum = process.argv[2];

// Send HTML at root, do not change
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

// Send Style, do not change
app.get('/style.css', function (req, res) {
  //Feel free to change the contents of style.css to prettify your Web app
  res.sendFile(path.join(__dirname + '/public/style.css'));
});

// Send obfuscated JS, do not change
app.get('/index.js', function (req, res) {
  fs.readFile(path.join(__dirname + '/public/index.js'), 'utf8', function (err, contents) {
    const minimizedContents = JavaScriptObfuscator.obfuscate(contents, {
      compact: true,
      controlFlowFlattening: true
    });
    res.contentType('application/javascript');
    res.send(minimizedContents._obfuscatedCode);
  });
});

//Respond to POST requests that upload files to uploads/ directory
app.post('/upload', function (req, res) {
  // var svg_image = req.files.svgIMG;
  if (!req.files) {
    // console.log(req.files);
    return res.status(400).send('No files were uploaded.');
  }

  let uploadFile = req.files.svgIMG;

  // Use the mv() method to place the file somewhere on your server
  uploadFile.mv('uploads/' + uploadFile.name, function (err) {
    if (err) {
      return res.status(500).send(err);
    }

    res.redirect('/');
  });
});

//Respond to GET requests for files in the uploads/ directory
app.get('/uploads/:name', function (req, res) {
  fs.stat('uploads/' + req.params.name, function (err, stat) {
    if (err == null) {
      res.sendFile(path.join(__dirname + '/uploads/' + req.params.name));
    } else {
      console.log('Error in file downloading route: ' + err);
      res.send('');
    }
  });
});

//******************** Your code goes here ******************** 

//Get list of files
app.get('/allFiles', function (req, res) {
  let fileObjToSend = []; // empty list that will contain the details of each file

  // reads the name of all the files in the uploads folder
  fs.readdir(path.join(__dirname + '/uploads/'), (err, files) => {

    if (err) {
      return console.log("ERROR: Couldn't read the files. " + err);
    }

    files.forEach((file) => {
      // temp code, need to export these files to the index.js
      console.log(file);

      // use fs.stat to get info like file size
      let fileInfo = fs.statSync(__dirname + '/uploads/' + file);
      // console.log(fileInfo);

      // Use parser to get info from SVG
      var CLibrary = ffi.Library(__dirname + '/parser/libsvgparse.so', {
        'getJSONofSVG': ['string', ['string']] // [return type, [param type]]
      });

      let returnVal = CLibrary.getJSONofSVG(__dirname + '/uploads/' + file);
      let svgObject = JSON.parse(returnVal);

      if (svgObject === null) {
        console.log('getJSONofSVG returned null. ' + svgObject);
      } else {
        console.log('getJSONofSVG returned: ' + JSON.stringify(svgObject));

        // create 
        var data = {
          fileName: file,
          fileSize: Math.round(fileInfo.size / 1000),
          numRect: svgObject.numRect,
          numCirc: svgObject.numCirc,
          numPath: svgObject.numPaths,
          numGroup: svgObject.numGroups
        }

        fileObjToSend.push(data); // adds the object to the list
      }

      // console.log('\nfileObjToSend contains: ' + JSON.stringify(fileObjToSend));

    });

    console.log('\nfileObjToSend contains: ' + JSON.stringify(fileObjToSend));

    // Export files to client side so the site can be populated with the files
    res.send({
      list: fileObjToSend
    });
  });
});


//Sample endpoint
app.get('/someendpoint', function (req, res) {
  let retStr = req.query.name1 + " " + req.query.name2;
  res.send({
    foo: retStr
  });
});

app.listen(portNum);
console.log('Running app at localhost: ' + portNum);