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
  'updateDescOfSVG': ['string', ['string', 'string']],
  'updateOtherAttribute': ['string', ['string', 'string', 'int', 'string', 'string']],
  'scaleShapes': ['string', ['string', 'string', 'string']],
  'addCircleToSVG': ['string', ['string', 'string', 'string', 'string', 'string']],
  'addRectToSVG': ['string', ['string', 'string', 'string', 'string', 'string', 'string']],
  'createNewSVGfromUser': ['string', ['string', 'string', 'string']]
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
    // res.status(500);
    return /* res.status(400).send('No files were uploaded.') */;
  }

  var existingFiles = fs.readdirSync(__dirname + "/uploads/");
  console.log(existingFiles);
  for (const file of existingFiles) {
    console.log(file);
    if (file == uploadFile.name) {
      // console.log('Same file doodz');
      return res.redirect('/');
    }
  }

  // Use the mv() method to place the file somewhere on your server
  uploadFile.mv('uploads/' + uploadFile.name, function (err) {
    if (err) {
      return res.status(500).send(err);
    }

      /* CHECK IF THE UPLOAD FILE IS VALID HERE */
    var isFileValid = CLibrary.validateSVGforServer(__dirname + "/uploads/" + uploadFile.name);

    if (isFileValid == false) { // if file isn't valid remove it
      // return res.status(400).send("Invalid file upload");
      // try {
      //   // remove file
      //   fs.unlinkSync(__dirname +  '/uploads/' + uploadFile.name);
      //   console.log('Deleted invalid file');
      // } catch (err) { 
      //   console.error('Failed to delete invalid file. Err: ' + err);
      // }
    }

    res.redirect('/');
  });
});

//Respond to GET requests for files in the uploads/ directory
app.get('/uploads/:name', function (req, res) {
  // console.log('entered');
  fs.stat('uploads/' + req.params.name, function (err, stat) {
    if (err == null) {
      // console.log(path.join(__dirname + '/uploads/' + req.params.name));
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
        // console.log('getJSONofSVG returned null. ' + svgObject);
      } else {
        // console.log('getJSONofSVG returned: ' + JSON.stringify(svgObject));
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

    // console.log('\nfileObjToSend contains: ' + JSON.stringify(fileObjToSend));
    
    // if (fileObjToSend.length === 0) { // no files
    //   console.log('Howdy do');
    // }

    // Export files to client side so the site can be populated with the files
    res.send({
      list: fileObjToSend
    });
  });
});

// get path links for displaying the image and download link in the table
//Respond to GET requests for files in the uploads/ directory
app.get('/tableImage/:name', function (req, res) {
  // console.log('entered');
  fs.stat('uploads/' + req.params.name, function (err, stat) {
    if (err == null) {
      // console.log(path.join(__dirname + '/uploads/' + req.params.name));
      res.send(path.join(__dirname + '/uploads/' + req.params.name));
      // res.sendFile(path.join(__dirname + '/uploads/' + req.params.name));
    } else {
      console.log('Error in file downloading route: ' + err);
      res.send('');
    }
  });
});

//get main attributes of sent in element
app.get('/getMainAttrs', function (req, res) {
  // console.log('Inside getMainAttrs, received: ' + req.query.elementObj.elemType + " index: " + req.query.elementObj.index);
  var element = req.query.elementObj.elemType;
  var index = req.query.elementObj.index;
  var file = __dirname + '/uploads/' + req.query.elementObj.fileName;

  try {
    var returnVal = CLibrary.getJSONforViewPanel(file);
    // console.log(JSON.parse(returnVal));
    var componentObj = JSON.parse(returnVal);

    if (element.includes('rect')) {
      // console.log(componentObj.rectList[index]);
      res.send(componentObj.rectList[index]);
    } else if (element.includes('circ')) {
      res.send(componentObj.circList[index]);
    } else if (element.includes('path')) {
      res.send(componentObj.pathList[index]);
    } else if (element.includes('group')) {
      res.send(componentObj.groupList[index]);
    }
    
    // if (returnVal != null) {
    //   for (i = 0; )
    //   res.send(returnVal);
    // }
  } catch (err) {
    console.log('Error in getMainAttrs ' + err);
    return res.status(500).send(err);
  }
});

// get other attributes of sent in element
app.get('/getOtherAttrs', function (req, res) {
  // console.log('Inside getOtherAttrs, received: ' + req.query.element + " " + req.query.elemIndex);
  // console.log('Inside getOtherAttrs, received: ' + req.query.elementObj.elemType + " index: " + req.query.elementObj.index);
  var elemType = req.query.elementObj.elemType;
  var elemIndex = req.query.elementObj.index;
  var fileName = req.query.elementObj.fileName;

  try {
    var dirToIMG = path.join(__dirname + '/uploads/' + fileName);
    // console.log("Dir is: " + __dirname + '/uploads/' + fileName);
    // console.log("Dir is: " + dirToIMG);
    var returnVal = CLibrary.getJSONforOtherAttr(dirToIMG, elemType, elemIndex);
    // console.log(`Return of getJSONforOtherAttr: ${returnVal}`);
    if (returnVal != null) {
      res.send(returnVal);
    }
  } catch (err) {
    console.log('Error in getOtherAttrs ' + err);
    return res.status(500).send(err);
  }
});

// sending new title to be updated in SVG itself
app.get('/updateTitle', function (req, res) {
  try {
    var title = req.query.title;
    var file = path.join(__dirname + '/uploads/' + req.query.file);
    // console.log("Received the title: " + title);
    if (title != null) { // user actually wanted to change something
      // console.log("Received the title: " + title);
      // console.log("Filename is: " + file);
      var returnVal = CLibrary.updateTitleOfSVG(file, title);
      // console.log('Return value from updateTitle is: ' + returnVal);

      res.send(returnVal);
    }
  } catch (err) {
    console.log("Error in updateTitle: " + err);
    return res.status(500).send(err);
  }
});

// sending new desc to be updated in SVG itself
app.get('/updateDesc', function (req, res) {
  try {
    var desc = req.query.desc;
    var file = path.join(__dirname + '/uploads/' + req.query.file);
    // console.log("Received the title: " + title);
    if (desc != null) { // user actually wanted to change something
      // console.log("Received the desc: " + desc);
      // console.log("Filename is: " + file);
      var returnVal = CLibrary.updateDescOfSVG(file, desc);
      // console.log('Return value from updateDesc is: ' + returnVal);

      res.send(returnVal);
    }
  } catch (err) {
    console.log("Error in updateDesc: " + err);
    return res.status(500).send(err);
  }
});

// sending user updated other attribute to SVG file
app.get('/updateOtherAttrs', function (req, res) {
  var attrName = req.query.elementObj.attr;
  var attrVal = req.query.elementObj.attrValue;
  var elem = req.query.elementObj.elemType;
  var index = req.query.elementObj.index;
  var file = __dirname + "/uploads/" + req.query.elementObj.fileName;
  try {
    // console.log("Attribute name: " + attrName);
    // console.log("Attribute value: " + attrVal);
    // console.log("Element is: " + elem);
    // console.log("Element index is: " + index);
    // console.log("File targeted is: " + file);
    
    var returnVal = CLibrary.updateOtherAttribute(file, elem, index, attrName, attrVal);
    returnVal = JSON.parse(returnVal);

    if (returnVal == true) { // updated and valid
      res.send(true);
      // console.log("Success");
    } else { // didn't update cuz invalid
      res.send(false);
      // console.log("Failure");
    }

  } catch (err) {
    console.log("Error in updateOtherAttrs. Err: " + err);
    return res.status(500).send(err);
  }
});

// app.get('/addOtherAttrs', function (req, res) {
//   console.log(`Inside addOtherAttrs got: ${req.query.elementObj.fileName}, ${req.query.elementObj.name}, ${req.query.elementObj.value}`);

//   var attrName = req.query.elementObj.attr;
//   var attrVal = req.query.elementObj.attrValue;
//   var elem = req.query.elementObj.elemType;
//   var index = req.query.elementObj.index;
//   var file = __dirname + "/uploads/" + req.query.elementObj.fileName;

//   try {
//     CLibrary.updateOtherAttribute();
//   } catch (err) {
//     console.log("Error in addOtherAttrs. Err: " + err);
//     res.status(500).send(err);
//   }
// });

app.get('/viewSVG/:name', function (req, res) {
  var filename = req.params.name;
  // console.log("WOW" + filename); // test
  try {
    let returnVal = CLibrary.getJSONforViewPanel(__dirname + '/uploads/' + filename);
    // console.log(returnVal);
    let summaryOfSVG = JSON.parse(returnVal);
    // console.log(JSON.stringify(summaryOfSVG));
    res.send(summaryOfSVG);
  } catch (err) {
    console.log("Error in viewSVG: " + err);
    return res.status(500).send(err);
  }
});

// add new shape to selected file
app.get('/addNewComponent', function (req, res) {
  
  try {
    var file = __dirname + '/uploads/' + req.query.shapeObj.fileName;
    var units = req.query.shapeObj.units;
    var returnVal;
    if (req.query.shapeObj.component == "rect") {
      // console.log("RECTSSSZZZ");

      let x = req.query.shapeObj.x;
      let y = req.query.shapeObj.y;
      let w = req.query.shapeObj.w;
      let h = req.query.shapeObj.h;

      returnVal = CLibrary.addRectToSVG(file, x, y, w, h, units);
    } else {
      // console.log("CIRCLESSZZZ");

      let cx = req.query.shapeObj.cx;
      let cy = req.query.shapeObj.cy;
      let r = req.query.shapeObj.r;

      returnVal = CLibrary.addCircleToSVG(file, cx, cy, r, units);
    }
    
    res.send(returnVal);
  } catch (err) {
    console.log("error in addNewComponent: " + err);
    return res.status(500).send(err);
  }
});

// create a new SVG file
app.get('/createSVG', function (req, res) {
  try {
    var file = __dirname + '/uploads/' + req.query.SVGFile.file;
    var title = req.query.SVGFile.title;
    var desc = req.query.SVGFile.desc;
    // console.log(`Hello from createSVG file is ${file} title is ${title} and desc is ${desc}`);

    var returnVal = CLibrary.createNewSVGfromUser(file, title, desc);
    res.send(returnVal);
  } catch (err) {
    console.log("error in createSVG: " + err);
    return res.status(500).send(err);
  }
});

// change the size by factor for all same components
app.get('/scaleShapes', function (req, res) {
  try {
    var factor = req.query.factor;
    var shape = req.query.shape;
    var file = __dirname + "/uploads/" +req.query.file;
    // console.log(`Got factor: ${factor}, shape: ${shape} and file: ${file}`);

    var returnVal = CLibrary.scaleShapes(file, shape, factor);
    // console.log(returnVal);
    res.send(returnVal);
  } catch (err) {
    console.log("error in scalesShapes: " + err);
    return res.status(500).send(err);
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