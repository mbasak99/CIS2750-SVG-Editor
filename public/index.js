// Put all onload AJAX calls here, and event listeners
$(document).ready(function () {
  // On page-load AJAX Example
  // $.ajax({
  //   type: 'get', //Request type
  //   dataType: 'json', //Data type - we will use JSON for almost everything 
  //   url: '/someendpoint', //The server endpoint we are connecting to
  //   data: {
  //     name1: "Value 1",
  //     name2: "Value 2"
  //   },
  //   success: function (data) {
  //     /*  Do something with returned object
  //         Note that what we get is an object, not a string, 
  //         so we do not need to parse it on the server.
  //         JavaScript really does handle JSONs seamlessly
  //     */
  //     $('#blah').html("On page load, received string '" + data.foo + "' from server");
  //     //We write the object to the console to show that the request was successful
  //     console.log(data);

  //   },
  //   fail: function (error) {
  //     // Non-200 return, do something with error
  //     $('#blah').html("On page load, received error from server");
  //     console.log(error);
  //   }
  // });

  // // Event listener form example , we can use this instead explicitly listening for events
  // // No redirects if possible
  // $('#someform').submit(function (e) {
  //   $('#blah').html("Form has data: " + $('#entryBox').val());
  //   e.preventDefault();
  //   //Pass data to the Ajax call, so it gets passed to the server
  //   $.ajax({
  //     //Create an object for connecting to another waypoint
  //   });
  // });

  $('#new-svg-name').val('');
  $('#new-svg-title').val('');
  $('#new-svg-desc').val('');

  // Use the object sent from the server to update the website
  $.ajax({
    type: 'get', // Get Request
    dataType: 'json',
    url: '/allFiles', // The server path
    success: function (data) { // Got the info
      console.log(data);
      // console.log("data");

      // update the table with the data I just received
      $('.log-data-body').html(function (content) {

        content += '<tr>';

        //headers
        content += '<td class="file-log"><strong>Image (click to download)</strong></td>'
        content += '<td class="file-log"><strong>File name (click to download)</strong></td>'
        content += '<td class="file-log"><strong>File size (KB)</strong></td>'
        content += '<td class="file-log"><strong># of Rectangles</strong></td>'
        content += '<td class="file-log"><strong># of Circles</strong></td>'
        content += '<td class="file-log"><strong># of Paths</strong></td>'
        content += '<td class="file-log"><strong># of Groups</strong></td>'

        content += '</tr>';

        if (data.list == 0) {
          content += "<tr>";

          content += "<td colspan=7><h3>There are no files uploaded</h3></td>";

          content += "</tr>";
        }

        for (const element of data.list) {
          // use innerHTML for td and outerHTML when handling another SVG
          content += '<tr class="log-data">';
          // console.log("YEEETT" + element);
          // console.log("YEEETT" + JSON.stringify(element));

          // table data
          content += `<td><a href="../uploads/${element.fileName}" download><img src="../uploads/${element.fileName}" alt="Image of ${element.fileName}"></a></td>`; // Show image
          content += `<td><a href="../uploads/${element.fileName}" download>${element.fileName}</td>`;
          content += '<td><strong>' + element.fileSize + ' KB</strong>' + '</td>';
          content += '<td>' + element.numRect + '</td>';
          content += '<td>' + element.numCirc + '</td>';
          content += '<td>' + element.numPath + '</td>';
          content += '<td>' + element.numGroup + '</td>';

          content += '</tr>';
        }
        // Allow user to upload SVG images section
        content +=
          `<tr>
          <td colspan="7">
            <h3>Upload an SVG file here</h3>
            <form id="upload-svg" method="post" action="/upload" enctype="multipart/form-data">
              <label>Select an SVG to upload here: </label>
              <input type="file" name="svgIMG" id="SVG-file-browser" accept=".svg">
              <br>
              <input id="submitBtn" type="submit" value="Upload SVG">
            </form>
          </td>
        </tr>`;
        // me trying to make the upload a little better (above is the old upload)
        // `<tr>
        //   <td colspan="7">
        //     <h3>Upload an SVG file here</h3>
        //     <form id="upload-svg">
        //       <label>Select an SVG to upload here: </label>
        //       <input type="file" name="svgIMG" id="SVG-file-browser" accept=".svg">
        //       <br>
        //       <input id="submitBtn" type="submit" value="Upload SVG" onclick="userUploadFile()">
        //     </form>
        //   </td>
        // </tr>`;

        return content;
      });

      // fill the files in file list in the add shapes list
      $('#file-chooser-shape').html(function (content) {
        if (data.list.length == 0) {
          content += "<option>There are no files to choose from...</option>";
        } else {
          content += "<option>Please select the file to add to</option>";
        }

        for (const element of data.list) {
          content += `<option>${element.fileName}</option>`;
        }

        return content;
      });

      $('#upload-svg').submit(function () {
        if ($('#SVG-file-browser').val() == 0 || $('#SVG-file-browser').val() == null || $('#SVG-file-browser').val() == undefined) {
          alert("No file selected! Please select a file");
          // event.preventDefault();
        } else {
          alert("File successfully uploaded!");
        }
        // console.log('STOP!!!');
      });

      $('#factor-size').val(''); // clear any value

      // Need to update the values in the drop down
      $('#svgSelector').html(function (content) {
        content += '<option>Please select an image to view</option>';
        for (const element of data.list) {
          content += `<option>${element.fileName}</option>`;
        }

        return content;
      });

      // clear new other attr fields
      $('#add-other-attr-name').val('');
      $('#add-other-attr-value').val('');

      // createShowAttr(null); // creates a disabled drop down for other attributes

      // Need to get the index of chosen value in drop down
      $('#shape-list').prop('selectedIndex', 0);
      $('#svgSelector').change(function () {
        var selectedVal = $(this).children('option:selected').val();
        console.log('You have chosen: ' + selectedVal);
        // console.log('You have chosen: ' + $(this).selectedIndex);

        $('#edit-main-attr-body').slideUp('slow'); // prevent the user from making invalid choices
        $('#add-edit-attr-table').slideUp('slow');
        // $('#shape-attr-input').slideUp('slow');

        if ($(this).prop('selectedIndex') == 0) {
          $('.view-data-body').html(function (content) {
            content +=
              `<tr>
            <td class="view-panel title"><strong>Title</strong></td>
            <td colspan="2" class="view-panel desc"><strong>Description</strong></td>
            </tr>
            <tr>
            <td class="title">Please select an image</td>
            <td colspan="2" class="desc">Please select an image</td>
            </tr>
            <tr>
            <td id="component"><strong>Component</strong></td>
            <td id="summary"><strong>Summary</strong></td>
            <td id="otherAttr"><strong>Other Attributes</strong></td>
            </tr>
            <tr class="view-data">
            <td>Please select an image</td>
            <td>Please select an image</td>
            <td>Please select an image</td>
            </tr>`;

            return content;
          });



          $('#showAttr').html(function () {
            var content = "<option>Please select an element's attribute to show</option>";
            return content;
          });

          $('#edit-title-desc-table').slideUp("slow"); // prevent the user from making invalid choices

          return;
        }

        // Update the SVG View Panel with SVG summaries
        $.ajax({
          type: 'get',
          dataType: 'json',
          url: '/viewSVG/' + selectedVal,
          success: function (data) {
            console.log('Dabberz');
            console.log(data);

            $('.view-data-body').html(function (content) {
              /* Returned objects contains:
                  title: string
                  desc: string
                  rectList: array
                  circList: array
                  pathList: array
                  groupList: array */

              // include view of the SVG
              content +=
                `<tr>
                <td colspan="7" class="view-panel"><img src="../uploads/${selectedVal}" alt="Image of ${selectedVal}"></td>
              </tr>`;

              // title and desc
              content +=
                `<tr>
                <td class="view-panel title"><strong>Title</strong></td>
                <td colspan="2" class="view-panel desc"><strong>Description</strong></td>
              </tr>`;

              // title and desc values
              content += '<tr>';

              if (data.title == "") { // there's no title
                content += '<td class="title"><i>(EMPTY)</i></td>'
              } else {
                content += `<td class="title"><p>${data.title}</p></td>`;
              }

              if (data.desc == "") { // there's no desc
                content += '<td colspan="2" class="desc"><i>(EMPTY)</i></td>';
              } else {
                content += `<td colspan="2" class="desc"><p>${data.desc}</p></td>`;
              }
              content += '</tr>';

              // component, summary and other attributes
              content +=
                `<tr>
                <td id="component"><strong>Component</strong></td>
                <td id="summary"><strong>Summary</strong></td>
                <td id="otherAttr"><strong>Other Attributes</strong></td>
              </tr>`;

              // fill in rectangle info
              var rectNum = 1;
              for (const rect of data.rectList) { // traversing each index of rectList each index is an object
                // console.log("Here we go" + rect.units);
                // console.log("Here we go" + rect.x);
                // console.log("Here we go 2" + JSON.stringify(element.x));
                let units = rect.units;
                content += '<tr class="view-data">';
                content += `<td>Rectangle ${rectNum}</td>`;
                content += `<td><p>Upper left corner: x = ${rect.x}, y = ${rect.y} Width: ${rect.w}${units}, Height: ${rect.h}${units}</p></td>`;
                content += `<td>${rect.numAttr}</td>`;
                content += '</tr>';
                rectNum++;
              }

              // fill in circle info
              var circNum = 1;
              for (const circle of data.circList) {
                let units = circle.units;
                content += '<tr class="view-data">';
                content += `<td>Circle ${circNum}</td>`;
                content += `<td><p>Centre: x = ${circle.cx}, y = ${circle.cy} Radius: ${circle.r}${units}</p></td>`;
                content += `<td>${circle.numAttr}</td>`;
                content += '</tr>';
                circNum++;
              }

              //fill in path info
              var pathNum = 1;
              for (const path of data.pathList) {
                // console.log(path.d.length );
                content += '<tr class="view-data">';
                content += `<td>Path ${pathNum}</td>`;

                if (path.d.length > 64) {
                  let newStr = path.d.slice(0, 65); // goes from index 0 to 64
                  content += `<td><p>Path data = ${newStr}<strong>...</strong></p></td>`;
                } else {
                  content += `<td><p>Path data = ${path.d}</p></td>`;
                }

                content += `<td>${path.numAttr}</td>`;
                content += '</tr>';
                pathNum++;
              }

              // fill in group info
              var groupNum = 1;
              for (const group of data.groupList) {
                content += '<tr class="view-data">';
                content += `<td>Group ${groupNum}</td>`;
                content += `<td><p>${group.children} children elements</p></td>`;
                content += `<td>${group.numAttr}</td>`;
                content += '</tr>';
                groupNum++;
              }

              // create a show attributes button
              if (data.rectList.length > 0 || data.circList.length > 0 || data.pathList.length > 0 || data.groupList.length > 0) { // there must be elements in order to show attributes
                createShowAttr('exists', data);
                // createShowMainAttr();
                // createShowAttr(null);
              } else {
                createShowAttr(null);
              }

              return content;
            });

            // update the body of the edit title/desc table
            $('#edit-title-desc-table').html(function () {
              console.log("entered editing of title and desc table");
              var content = '<tr>';
              // title block
              content += '<td>Title: </td>';
              content +=
                `<td>
                    <div class="input-group mb-3">
                      <input type="text" id="edit-title" class="form-control" value="${data.title}" aria-label="Recipient's username" aria-describedby="button-addon2">
                      <div class="input-group-append">
                        <button class="btn btn-outline-secondary title-submit" onclick="editTitle()" type="button" id="button-addon2">Save Edit</button>
                      </div>
                    </div>
                </td>`;
              content += '</tr>';

              // desc block
              content += '<td>Description: </td>';
              content +=
                `<td>
                    <div class="input-group mb-3">
                      <input type="text" id="edit-desc" class="form-control" value="${data.desc}" aria-label="Recipient's username" aria-describedby="button-addon2">
                      <div class="input-group-append">
                        <button class="btn btn-outline-secondary desc-submit" onclick="editDesc()" type="button" id="button-addon2">Save Edit</button>
                      </div>
                    </div>
                </td>`;

              console.log("EDITING TITLE AND DESC: " + JSON.stringify(data));
              return content;
            });
          },
          fail: function (error) {
            console.log("ERR in SVG Panel summary " + error);
          }
        });

      });

      // Parse the drop down to display actual other attributes
      $('#showAttr').change(function () {
        var selectVal = $(this).children('option:selected').val();
        console.log('You have chosen DAB: ' + selectVal);
        if ($(this).prop('selectedIndex') > 0) { // they need to pick an element whose elements to view
          $('#add-edit-attr-table').show("slow");
          $('#edit-main-attr-body').show('slow');

          var elementObj = {
            elemType: "", // empty at creation
            index: 0, // default index
            fileName: ""
          };

          populateShowAttrDropDown(selectVal, elementObj); // Gets the element that will be sent to the server in order to populate the edit/add other attributes table

          // send the parsed element to the server to receive their other attributes
          $.ajax({
            type: 'get', // Get Request
            dataType: 'json',
            url: '/getOtherAttrs',
            data: {
              elementObj
            },
            success: function (returnVal) {
              console.log('Successfully displaying other attributes table');

              // returnVal is an array of objects so you for of to iterate through arrays and for in for objects
              $('#add-edit-attr-table').html(showOtherAttr(returnVal)); // add the returned items as rows for each object;

            },
            fail: function (error) {
              console.log('Failed to get element data from server. ' + error);
            }
          });

          // send the parsed element to the server to receive their main attributes
          $.ajax({
            type: 'get',
            dataType: 'json',
            url: '/getMainAttrs',
            data: {
              elementObj
            },
            success: function (returnVal) {
              console.log('Successfully got info from server about main attrs');
              // console.log("in edit main att elementObj: " + JSON.stringify(elementObj));
              $('#edit-main-attr-body').html(showMainAttr(returnVal));
            },
            fail: function (err) {
              console.log('Failed to get element data from server for main attributes. ' + err);
            }
          });

        } else {
          $('#add-edit-attr-table').slideUp("slow");
          $('#edit-main-attr-body').slideUp('slow');
        }
        console.log("Printing index in the drop down: " + $(this).prop('selectedIndex'));
      });

      // $('#shape-list').change(function () {
      //   $('#shape-attr-input').slideUp('slow'); // reset the current display input options since user changed option
      //   // retrieve new input body

      //   $('#shape-attr-input').html(showInputAddShape()); // change the body

      //   if ($('#shape-list').prop('selectedIndex') != 0) {
      //     $('#shape-attr-input').show('slow'); // bring the body back into view with updated inputs
      //   }
      // });

      console.log('Successfully loaded any images.');
    },
    fail: function (error) {
      console.log('Failed to load any images. ' + error);
    }
  });

  $('#shape-list').change(function () {
    $('#shape-attr-input').slideUp('slow'); // reset the current display input options since user changed option
    // retrieve new input body

    $('#shape-attr-input').html(showInputAddShape()); // change the body

    if ($('#shape-list').prop('selectedIndex') > 0) {
      $('#shape-attr-input').show('slow'); // bring the body back into view with updated inputs
    }
  });

});

// Populates the drop down menu
function createShowAttr(type, data) {
  if (type == null) { // no elements to display the attributes of
    // alert('There are no attributes to display.');
    // dropDownData += '<tr class="view-data">';
    // dropDownData += `<td colspan="7">`;
    // dropDownData += '<select id="showAttr" disabled>';
    $('#showAttr').html(function (content) {
      content += "<option>Please select an element's attribute to show</option>";
      content += '<option>SVG</option>';
      // $(this).prop("disabled", true);
      return content;
    });
    // dropDownData += '</select>';
    // dropDownData += '</td>';
    // dropDownData += '</tr>';

    // display the drop down menu
    // $("#showAttr").prop("disabled", true);

  } else { // there are at least 
    // dropDownData += '<tr class="view-data">';
    // dropDownData += `<td colspan="7">`;
    // dropDownData += '<select id="showAttr">';
    // dropDownData += "<option>Please select an element's attribute to show</option>";

    // populates the other attributes table of a component
    $('#showAttr').html(function (dropDownData) {
      dropDownData += "<option>Please select an element's attribute to show</option>";
      // $(this).prop("disable", true);


      // do <option></option> per attr shown of each element (probably in a for loop) and don't add to list if it has no 

      // rect, circ, path, group and svg

      // SVG
      dropDownData += '<option>SVG</option>';

      //rectangles
      for (let i = 1; i <= data.rectList.length; i++) {
        // if (data.rectList[i - 1].numAttr > 0) { // only display elements in the drop down if they have other attributes
        dropDownData += `<option>Rectangle ${i}</option>`;
        // }
      }

      for (let i = 1; i <= data.circList.length; i++) {
        // if (data.circList[i - 1].numAttr > 0) { // only display elements in the drop down if they have other attributes
        dropDownData += `<option>Circle ${i}</option>`;
        // }
      }

      for (let i = 1; i <= data.pathList.length; i++) {
        // if (data.pathList[i - 1].numAttr > 0) { // only display elements in the drop down if they have other attributes
        dropDownData += `<option>Path ${i}</option>`;
        // }
      }

      for (let i = 1; i <= data.groupList.length; i++) {
        // if (data.groupList[i - 1].numAttr > 0) { // only display elements in the drop down if they have other attributes
        dropDownData += `<option>Group ${i}</option>`;
        // }
      }

      $(this).prop("disabled", false);

      return dropDownData;
    });
  }

}

function userUploadFile() {
  // this can work, might need to make this a $(form id here).submit(function (e) {do stuff});
  // var file = $('#SVG-file-browser').files[0];
  var file = $('#SVG-file-browser').prop('files');
  if (file != null) {
    console.log("printing file: " + file[0]);
    console.log("printing filename: " + file[0].name);
  }

  $('#upload-svg').submit((e) => {
    e.preventDefault();
  })

  // alert("It works boi");
  console.log("It works boi");
  return;
}

// edit title
function editTitle() {
  var inputVal = $('#edit-title').val();
  // alert(inputVal);
  if (inputVal.length > 255) { // if the string the user entered is greater than the specs allows truncate the extra
    console.log("Title will be truncated: " + inputVal.slice(0, 255));
    if (confirm("Title will be truncated to: " + inputVal.slice(0, 255))) {
      console.log("Sending data to server now.");
    } else {
      console.log("Data not sent to the server.");
      return;
    }
  } else {
    console.log("Title will remain the unaltered, you entered " + '"' + inputVal + '"');
  }

  var filename = $('#svgSelector').children('option:selected').val();
  // send the data to the server that will call the C function
  $.ajax({
    type: 'get', // POST Request
    dataType: 'json',
    url: '/updateTitle',
    data: {
      title: inputVal,
      file: filename
    },
    success: function (data) {
      alert("You have successfully updated the title for the chosen SVG");
      location.reload(true);
    },
    fail: function (err) {
      console.log("updateTitle in server failed to update properly! Err: " + err);
    }
  });
  // console.log("went past wtf");
}

// edit desc
function editDesc() {
  var inputVal = $('#edit-desc').val();
  // alert(inputVal);
  if (inputVal.length > 255) { // if the string the user entered is greater than the specs allows truncate the extra
    console.log("Desc will be truncated: " + inputVal.slice(0, 255));
    if (confirm("Desc will be truncated to: " + inputVal.slice(0, 255))) {
      console.log("Sending data to server now.");
    } else {
      console.log("Data not sent to the server.");
      return;
    }
  } else {
    console.log("Desc will remain the unaltered, you entered " + '"' + inputVal + '"');
  }

  var filename = $('#svgSelector').children('option:selected').val();
  // send the data to the server that will call the C function
  $.ajax({
    type: 'get', // GET Request (post doesn't work)
    dataType: 'json',
    url: '/updateDesc',
    data: {
      desc: inputVal,
      file: filename
    },
    success: () => {
      alert("You have successfully updated the description for the chosen SVG");
      location.reload(true);
    },
    fail: function (err) {
      console.log("updateDesc in server failed to update properly! Err: " + err);
    }
  });
}

// Get the main attributes from the elmeent selected in the drop down menu
function showMainAttr(returnValue) {
  var content;

  for (const key in returnValue) {
    if (key != "children" && key != "numAttr") {

      content += "<tr>";

      content += `<td>${key}</td>`;
      content += `
        <td>
        <div class="input-group mb-3">
        <input type="text" class="form-control" value="${returnValue[key]}" aria-label="Recipient's username" aria-describedby="button-addon2" id="${key}-main-attr">
        <div class="input-group-append">
        <button class="btn btn-outline-secondary" type="button" onclick="mainAttrEdit('${key}')" id="button-addon2">Save Edit</button>
        </div>
        </div>
        </td>`;

      content += "</tr>";
    }
  }
  // }


  return content;
}

// Get the other attributes from the element selected in the drop down menu
function showOtherAttr(returnVal) {
  var content;

  // content += "<tbody id='other-attr-edit-body'>";
  if (returnVal.length == 0) { // there are no other attributes in here
    content += '<tr>';
    content += "<td colspan='7'> There aren't any other attributes to edit here but you can add one below.</td>";
    content += '</tr>';
  }

  for (index of returnVal) { // returnVal is the element's other attributes
    content += "<tr>";
    content += `<td>${index.name}: </td>`;
    content += `<td>
                  <div class="input-group mb-3">
                    <input type="text" class="form-control" value="${index.value}" aria-label="Recipient's username" aria-describedby="button-addon2" id="${index.name}-edit-value">
                    <div class="input-group-append">
                      <button class="btn btn-outline-secondary" type="button" onclick="otherAttrEditSave('${index.name}')" id="button-addon2">Save Edit</button>
                    </div>
                </div>
                </td>`;
    // content += `<td>${index.value}</td>`;
    // content += '<td></td>';
    content += "</tr>";
  }
  // content += "</tbody>";

  return content;
}

// populates object with items that will be inputted into the edit/add other attributes table
function populateShowAttrDropDown(selectVal, elementObj) {

  elementObj.fileName = $('#svgSelector').children('option:selected').val();
  console.log("File chosen: " + elementObj.fileName);

  if (selectVal.includes('Rectangle')) {
    console.log(selectVal.slice(0, "Rectangle".length));
    console.log("Should be index here:" + selectVal.slice('Rectangle'.length + 1));

    elementObj.elemType = 'rect'; // node server is going to send this into the C parser
    elementObj.index = parseInt(selectVal.slice('Rectangle'.length + 1)) - 1; // grabs the index
  } else if (selectVal.includes('Circle')) {
    console.log(selectVal.slice(0, "Circle".length));
    console.log("Should be index here:" + selectVal.slice('Circle'.length + 1));

    elementObj.elemType = 'circ'; // node server is going to send this into the C parser
    elementObj.index = parseInt(selectVal.slice('Circle'.length + 1)) - 1; // grabs the index
  } else if (selectVal.includes('Path')) {
    console.log(selectVal.slice(0, "Path".length));
    console.log("Should be index here:" + selectVal.slice('Path'.length + 1));

    elementObj.elemType = 'path'; // node server is going to send this into the C parser
    elementObj.index = parseInt(selectVal.slice('Path'.length + 1)) - 1; // grabs the index
  } else if (selectVal.includes('Group')) {
    console.log(selectVal.slice(0, "Group".length));
    console.log("Should be index here:" + selectVal.slice('Group'.length + 1));

    elementObj.elemType = 'group'; // node server is going to send this into the C parser
    elementObj.index = parseInt(selectVal.slice('Group'.length + 1)) - 1; // grabs the index
  } else if (selectVal.includes('SVG')) {
    console.log(selectVal.slice(0, "SVG".length));
    console.log("Should be index here:" + selectVal.slice('SVG'.length + 1));

    elementObj.elemType = 'svg'; // node server is going to send this into the C parser
    elementObj.index = parseInt(selectVal.slice('SVG'.length + 1)) - 1; // grabs the index
  }
}

// handle edit from edit of main attrs
function mainAttrEdit(attrName) {
  var attrVal = $(`#${attrName}-main-attr`).val();

  // handle if the user doesn't enter a number for attributes that only accept numbers
  // if (isNaN(attrVal) && (attrName.includes('x') || attrName.includes('r') || attrName.includes('h') || attrName.includes('w'))) {
  if (attrName.match(/[x | y | h | w | r]/) && isNaN(attrVal)) {
    alert("You cannot enter alphabets in this field!");
    return;
  } else if (attrName.includes('units') && attrVal.match(/\d/)) {
    alert('You can only enter alphabets in this field!');
    return;
  }

  let checkForNeg = parseFloat(attrVal);
  if (attrName.match(/[h | w | r]/) && checkForNeg < 0) {
    alert('This field does not accept values less than 0!');
    return;
  }

  // change w and h to width and height respectively so C can ID and save it
  if (attrName.match(/[w]/)) {
    attrName = "width";
  } else if (attrName.match(/[h]/)) {
    attrName = "height";
  }

  var elementObj = {
    elemType: "",
    index: 0,
    fileName: "",
    attr: attrName,
    attrValue: attrVal
  };

  var selectVal = $('#showAttr').children('option:selected').val(); // get the element the user chose

  populateShowAttrDropDown(selectVal, elementObj); // function fills in missing info for elementObj
  console.log("elementObj: " + JSON.stringify(elementObj));

  // call the server and ask it to write the changes to file
  $.ajax({
    type: 'get',
    dataType: 'json',
    url: '/updateOtherAttrs',
    data: {
      elementObj
    },
    success: function (data) {
      if (data) {
        alert('Successfully updated the attribute! Reloading...');
        location.reload(true);
      } else {
        alert('Failed to update the attribute.');
      }
    },
    fail: function (err) {
      console.log('updateOtherAttrs call in mainAttrEdit had an error. Err: ' + err);
    }
  });

}

// handle save edit from add/edit other attrs
function otherAttrEditSave(attrName) {
  // alert("You've clicked save edit.");
  var attrNameVal = $(`#${attrName}-edit-value`).val();
  console.log(attrName);
  console.log(`Value in ${attrName} is ${attrNameVal}`);

  // create an object that will be sent to the server to process
  var elementObj = {
    elemType: "",
    index: 0,
    fileName: "",
    attr: attrName,
    attrValue: attrNameVal
  }
  var selectVal = $('#showAttr').children('option:selected').val(); // get the element the user chose

  populateShowAttrDropDown(selectVal, elementObj); // function fills in missing info for elementObj

  console.log(JSON.stringify(elementObj));

  $.ajax({
    type: 'get', // GET Request (post doesn't work)
    dataType: 'json',
    url: '/updateOtherAttrs',
    data: {
      elementObj
    },
    success: function (data) {
      // console.log()
      if (data) {
        alert('Successfully updated the attribute! Reloading...');
        location.reload(true);
      } else {
        alert('Failed to update the attribute.');
      }
    },
    fail: function (err) {
      console.log("Server failed to update other attributes. Err: " + err);
    }
  });
}

// this function will handle calling the server to add an other attribute the user wants
function addOtherAttr() {
  var elementObj = {
    attr: "",
    attrValue: "",
    fileName: "",
    elemType: "",
    index: 0
  }

  elementObj.attr = $('#add-other-attr-name').val();
  elementObj.attrValue = $('#add-other-attr-value').val();
  console.log("Name: " + elementObj.attr);
  console.log("Value: " + elementObj.attrValue);


  // get the component the new other attribute is being added to
  var selectedComponent = $('#showAttr').prop('selectedIndex');
  console.log("FROM ADD OTHER ATTR " + selectedComponent);

  if (selectedComponent == 0) { // prevent user from adding new other attribute without selecting file and image
    alert("Please select an image and component to add to!");
    return;
  }
  selectedComponent = $('#showAttr').children('option:selected').val(); // reassign to a string to allow the function below to parse it
  // gets the elemType, index and file
  populateShowAttrDropDown(selectedComponent, elementObj);

  console.log("FROM ADD OTHER ATTR obj " + elementObj.fileName);
  console.log(JSON.stringify(elementObj));

  $.ajax({
    type: 'get',
    dataType: 'json',
    url: '/updateOtherAttrs',
    data: {
      elementObj
    },
    success: function (data) {
      console.log("Success in addOtherAttrs ajax call");
      if (data) {
        alert('Successfully added a new other attribute! Reloading...');
        location.reload(true);
      } else {
        alert('Failed to add a new other attribute.');
      }
    },
    fail: function (err) {
      console.log("Something went wrong contacting the server for addOtherAttrs. Err: " + err);
    }
  })

}

// show input options for add shape
function showInputAddShape() {
  var fileList = $('#file-chooser-shape').prop('selectedIndex');
  var shapeList = $('#shape-list').prop('selectedIndex');

  // check if the user selected valid options
  if (fileList == 0 || shapeList == 0) {
    return;
  }

  var content;
  // $('#shape-attr-input').html(function (content) {
  if (shapeList == 1) {
    // console.log('woah');
    // x input
    content += "<tr>";
    content += `<td colspan="7">
                        <div class="input-group mb-3">
                            <div class="input-group-prepend">
                                <span class="input-group-text" id="inputGroup-sizing-default">X coordinate:
                                </span>
                            </div>
                            <input id="add-shape-x-value" value="" placeholder="Please enter a number" type="text" class="form-control"
                                aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" required>
                        </div>
                    </td>`;
    content += "</tr>";

    // y input
    content += "<tr>";
    content += `<td colspan="7">
                        <div class="input-group mb-3">
                            <div class="input-group-prepend">
                                <span class="input-group-text" id="inputGroup-sizing-default">Y coordinate:
                                </span>
                            </div>
                            <input id="add-shape-y-value" value="" placeholder="Please enter a number" type="text" class="form-control"
                                aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" required>
                        </div>
                    </td>`;
    content += "</tr>";

    // w input
    content += "<tr>";
    content += `<td colspan="7">
                        <div class="input-group mb-3">
                            <div class="input-group-prepend">
                                <span class="input-group-text" id="inputGroup-sizing-default">Width:
                                </span>
                            </div>
                            <input id="add-shape-w-value" value="" placeholder="Please enter a non-negative number" type="text" class="form-control"
                                aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" required>
                        </div>
                    </td>`;
    content += "</tr>";

    // h input
    content += "<tr>";
    content += `<td colspan="7">
                        <div class="input-group mb-3">
                            <div class="input-group-prepend">
                                <span class="input-group-text" id="inputGroup-sizing-default">Height:
                                </span>
                            </div>
                            <input id="add-shape-h-value" value="" placeholder="Please enter a non-negative number" type="text" class="form-control"
                                aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" required>
                        </div>
                    </td>`;
    content += "</tr>";

    // units input
    content += "<tr>";
    content += `<td colspan="7">
                        <div class="input-group mb-3">
                            <div class="input-group-prepend">
                                <span class="input-group-text" id="inputGroup-sizing-default">Units:
                                </span>
                            </div>
                            <input id="add-shape-units-value" value="" type="text" class="form-control"
                                aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default">
                        </div>
                    </td>`;
    content += "</tr>";

    // return content;
  } else if (shapeList == 2) { // circle
    // console.log('Howdy');
    // cx input
    content += "<tr>";
    content += `<td colspan="7">
                        <div class="input-group mb-3">
                            <div class="input-group-prepend">
                                <span class="input-group-text" id="inputGroup-sizing-default">CX coordinate:
                                </span>
                            </div>
                            <input id="add-shape-cx-value" value="" placeholder="Please enter a number" type="text" class="form-control"
                                aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" required>
                        </div>
                    </td>`;
    content += "</tr>";

    // cy input
    content += "<tr>";
    content += `<td colspan="7">
                        <div class="input-group mb-3">
                            <div class="input-group-prepend">
                                <span class="input-group-text" id="inputGroup-sizing-default">CY coordinate:
                                </span>
                            </div>
                            <input id="add-shape-cy-value" value="" placeholder="Please enter a number" type="text" class="form-control"
                                aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" required>
                        </div>
                    </td>`;
    content += "</tr>";

    // r input
    content += "<tr>";
    content += `<td colspan="7">
                        <div class="input-group mb-3">
                            <div class="input-group-prepend">
                                <span class="input-group-text" id="inputGroup-sizing-default">Radius:
                                </span>
                            </div>
                            <input id="add-shape-r-value" value="" placeholder="Please enter a non-negative number" type="text" class="form-control"
                                aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" required>
                        </div>
                    </td>`;
    content += "</tr>";

    // units input
    content += "<tr>";
    content += `<td colspan="7">
                        <div class="input-group mb-3">
                            <div class="input-group-prepend">
                                <span class="input-group-text" id="inputGroup-sizing-default">Units:
                                </span>
                            </div>
                            <input id="add-shape-units-value" value="" type="text" class="form-control"
                                aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default">
                        </div>
                    </td>`;
    content += "</tr>";
  }

  return content;
  // });
}

// handles adding a shape from the user
function addShape() {
  var fileList = $('#file-chooser-shape').prop('selectedIndex');
  var shapeList = $('#shape-list').prop('selectedIndex');

  // check if the user selected valid options
  if (fileList == 0 || shapeList == 0) {
    alert('Please select a file and shape to add');
    return;
  }

  var checkNums;
  if (shapeList == 1) { // rect
    var xVal = $('#add-shape-x-value').val();
    var yVal = $('#add-shape-y-value').val();
    var wVal = $('#add-shape-w-value').val();
    var hVal = $('#add-shape-h-value').val();
    checkNums = xVal + yVal + wVal + hVal;
    // console.log(xVal);

    if (wVal < 0 || hVal < 0) {
      alert("Width and Height cannot be negative values!");
      return;
    }
  } else { // circle
    var cxVal = $('#add-shape-cx-value').val();
    var cyVal = $('#add-shape-cy-value').val();
    var rVal = $('#add-shape-r-value').val();
    checkNums = cxVal + cyVal + rVal;

    if (rVal < 0) {
      alert("Radius cannot be a negative value!");
      return;
    }
  }

  var unitsVal = $('#add-shape-units-value').val();

  if (checkNums.match(/[a-zA-Z | \s]/) || unitsVal.match(/[0-9]/)) { // check for invalid entries
    alert("Please enter valid values!");
    return;
  }

  var fileName = $('#file-chooser-shape').children('option:selected').val();
  var shapeName = $('#shape-list').children('option:selected').val();

  var shapeObj = {
    component: "",
    units: unitsVal,
    fileName: fileName
  };

  if (shapeList == 1) { // rect
    shapeName = 'rect';
    shapeObj.x = xVal;
    shapeObj.y = yVal;
    shapeObj.w = wVal;
    shapeObj.h = hVal;
  } else { // circ
    shapeName = 'circ';
    shapeObj.cx = cxVal;
    shapeObj.cy = cyVal;
    shapeObj.r = rVal;
  }

  shapeObj.component = shapeName;
  console.log(JSON.stringify(shapeObj));

  $.ajax({
    type: 'get',
    dataType: 'json',
    url: '/addNewComponent',
    data: {
      shapeObj
    },
    success: function (data) {
      console.log('Success inside ajax of addShape ' + data);
      if (data) {
        alert("Successfully add new component to SVG file! Reloading...");
        location.reload(true);
      } else {
        alert("Failed to add new component to SVG file.");
      }
    },
    fail: function (err) {
      console.log('Adding new component failed. Err: ' + err);
    }
  });

  console.log(fileName);
  console.log(shapeName);
}

// handles user input of new SVG
function createNewSVG() {
  var fileName = $('#new-svg-name').val();
  var title = $('#new-svg-title').val();
  var desc = $('#new-svg-desc').val();
  if (fileName.length == 0) {
    alert("File Name cannot be empty!");
    return;
  }

  // for (i = 0; i < fileName.length; i++) {
  //   if (char.match(/[\s]/)) {
  //     char = '_';
  //   }
  // }
  let str = fileName.replace(/[\s]/g, "_"); // replaces whitespace with underscores
  fileName = str;
  console.log('File Name is now: ' + fileName);

  // add the .svg file type
  fileName = fileName + '.svg';

  // check if the file name already exists if it does tell the user to rename
  $.ajax({
    type: 'get', // Get Request
    dataType: 'json',
    url: '/allFiles', // The server path
    success: function (data) {
      if (data.length != null || data.length != undefined || data.length != 0) {
        for (const file of data.list) {
          if (file.fileName == fileName) {
            alert("This file already exists! Please rename your file.");
            return;
          }
        }

        var SVGFile = {
          file: fileName,
          title: title,
          desc: desc
        };

        // call the server to create this new SVG file
        $.ajax({
          type: 'get',
          dataType: 'json',
          url: '/createSVG',
          data: {
            SVGFile
          },
          success: function (data) {
            if (data) {
              alert('Creating a new SVG file Succeeded! Reloading...');
              location.reload(true);
            } else {
              alert('Creating a new SVG file failed.');
            }
          },
          fail: function (err) {
            console.log("createNewSVG failed to create a new SVG! Err: " + err);
          }
        });
      }
    },
    fail: function (err) {
      console.log("createNewSVG failed to get all the files! Err: " + err);
    }
  });
}

// handles the input from scale component
function scaleFactor() {
  var userIn = $('#factor-size').val();
  var selectedShape = $('#factor-component-list').prop('selectedIndex');
  var selectedSVG = $('#svgSelector').prop('selectedIndex');

  if (isNaN(userIn) || userIn == "" || userIn <= 0) {
    alert("That's an invalid entry.");
    return;
  } else if (selectedShape == 0 || selectedSVG == 0) {
    alert("Please select an SVG file and the component to scale.");
    return;
  } else {
    selectedShape = $('#factor-component-list').children('option:selected').val();
  }

  selectedShape = selectedShape.slice("All".length + 1);

  if (selectedShape == "Circles") {
    selectedShape = "circ";
  } else {
    selectedShape = "rect";
  }
  var selectedSVG = $('#svgSelector').children('option:selected').val();

  // call the server
  $.ajax({
    type: 'get',
    dataType: 'json',
    url: '/scaleShapes',
    data: {
      factor: userIn,
      shape: selectedShape,
      file: selectedSVG
    },
    success: function (data) {
      // alert('scalingShapes succeeded! Got: ' + data);
      if (data) {
        alert('Scaling Succeeded! Reloading...');
        location.reload(true);
      } else {
        alert('Scaling failed.');
      }
    },
    fail: function (err) {
      console.log('Something went wrong trying to scale shapes. Err: ' + err);
    }
  });
}