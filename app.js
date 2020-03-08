'use strict'

// C library API
const ffi = require('ffi-napi');
// const ref = require('ref'); // Used to make pointer variables for functions

// Express App (Routes)
const express = require("express");
const app = express();
const path = require("path");
const fileUpload = require('express-fileupload');
// const popup = require('popups');


app.use(fileUpload());
app.use(express.static(path.join(__dirname + '/uploads')));

// Minimization
const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');

// Important, pass in port as in `npm run dev 1234`, do not change
const portNum = process.argv[2];

// Use parser to get info from SVG
const CLibrary = ffi.Library(__dirname + '/libsvgparse.so', {
  'getJSONofSVG': ['string', ['string']], // [return type, [param type]]
  'getJSONforViewPanel': ['string', ['string']],
  'getJSONforOtherAttr': ['string', ['string', 'string', 'int']],
  'validateSVGforServer': ['string', ['string']],
  'updateTitleOfSVG': ['string', ['string', 'string']],
  'updateDescOfSVG': ['string', ['string', 'string']]
});

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

  if (uploadFile == null) { // check if no files were sent in
    res.redirect('/');
    res.status(500);
    return /* res.status(400).send('No files were uploaded.') */;
  }

  // Use the mv() method to place the file somewhere on your server
  uploadFile.mv('uploads/' + uploadFile.name, function (err) {
    if (err) {
      return res.status(500).send(err);
    }

      /* CHECK IF THE UPLOAD FILE IS VALID HERE */
    var isFileValid = CLibrary.validateSVGforServer();

    if (!isFileValid) { // if file isn't valid remove it
      return res.status(400).send("Invalid file upload");
    }

    res.redirect('/');
  });
});

//Respond to GET requests for files in the uploads/ directory
app.get('/uploads/:name', function (req, res) {
  console.log('entered');
  fs.stat('uploads/' + req.params.name, function (err, stat) {
    if (err == null) {
      console.log(path.join(__dirname + '/uploads/' + req.params.name));
      // res.send(path.join(__dirname + '/uploads/' + req.params.name));
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

      let returnVal = CLibrary.getJSONofSVG(__dirname + '/uploads/' + file);
      let svgObject = JSON.parse(returnVal);

      if (svgObject === null) {
        console.log('getJSONofSVG returned null. ' + svgObject);
      } else {
        console.log('getJSONofSVG returned: ' + JSON.stringify(svgObject));
        // console.log('getJSONofSVG returned: ' + JSON.parse(svgObject));

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
    
    if (fileObjToSend.length === 0) { // no files
      console.log('Howdy do');
    }

    // Export files to client side so the site can be populated with the files
    res.send({
      list: fileObjToSend
    });
  });
});

// get path links for displaying the image and download link in the table
//Respond to GET requests for files in the uploads/ directory
app.get('/tableImage/:name', function (req, res) {
  console.log('entered');
  fs.stat('uploads/' + req.params.name, function (err, stat) {
    if (err == null) {
      console.log(path.join(__dirname + '/uploads/' + req.params.name));
      res.send(path.join(__dirname + '/uploads/' + req.params.name));
      // res.sendFile(path.join(__dirname + '/uploads/' + req.params.name));
    } else {
      console.log('Error in file downloading route: ' + err);
      res.send('');
    }
  });
});

// get other attributes of sent in element
app.get('/getOtherAttrs', function (req, res) {
  // console.log('Inside getOtherAttrs, received: ' + req.query.element + " " + req.query.elemIndex);
  console.log('Inside getOtherAttrs, received: ' + req.query.elementObj.elemType + " index: " + req.query.elementObj.index);
  var elemType = req.query.elementObj.elemType;
  var elemIndex = req.query.elementObj.index;
  var fileName = req.query.elementObj.fileName;

  try {
    var dirToIMG = path.join(__dirname + '/uploads/' + fileName);
    // console.log("Dir is: " + __dirname + '/uploads/' + fileName);
    console.log("Dir is: " + dirToIMG);
    var returnVal = CLibrary.getJSONforOtherAttr(dirToIMG, elemType, elemIndex);
    console.log(`Return of getJSONforOtherAttr: ${returnVal}`);
    if (returnVal != null) {
      res.send(returnVal);
    }
  } catch (err) {
    console.log('Error in getOtherAttrs ' + err);
    return res.status(500).send(err);
  }
});

// sending new title to be updated in SVG itself
app.post('/updateTitle', function (res, req) {
  try {
    if (res.query.title != null) { // user actually wanted to change something

    }
  } catch (err) {
    console.log("Error in updateTitle: " + err);
  }
});

// sending new desc to be updated in SVG itself

app.get('/viewSVG/:name', function (req, res) {
  var filename = req.params.name;
  console.log("WOW" + filename); // test
  try {
    let returnVal = CLibrary.getJSONforViewPanel(__dirname + '/uploads/' + filename);
    // console.log(returnVal);
    let summaryOfSVG = JSON.parse(returnVal);
    console.log(JSON.stringify(summaryOfSVG));
    res.send(summaryOfSVG);
  } catch (err) {
    console.log("Error in viewSVG: " + err);
  }
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