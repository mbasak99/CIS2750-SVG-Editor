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

  // Use the object sent from the server to update the website
  $.ajax({
    type: 'get', // Get Request
    dataType: 'json',
    url: '/allFiles', // The server path
    success: function (data) { // Got the info
      console.log(data);
      console.log("data");

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

      $('#upload-svg').submit(function () {
        // alert('DABBERZZZ');
        if ($('#SVG-file-browser').val() == 0 || $('#SVG-file-browser').val() == null || $('#SVG-file-browser').val() == undefined) {
          alert("No file selected! Please select a file");
          // event.preventDefault();
        } else {
          alert("File successfully uploaded!");
        }
        // console.log('STOP!!!');
      });

      // $('#SVG-file-browser').submit(function () {
      //   if ($(this).files.length == 0) {
      //     alert('NO FILES');
      //   }
      // });

      // Need to update the values in the drop down
      $('#svgSelector').html(function (content) {
        content += '<option>Please select an image to view</option>';
        for (const element of data.list) {
          content += `<option>${element.fileName}</option>`;
        }

        return content;
      });

      // createShowAttr(null); // creates a disabled drop down for other attributes

      // Need to get the index of chosen value in drop down
      $('#svgSelector').change(function () {
        var selectedVal = $(this).children('option:selected').val();
        console.log('You have chosen: ' + selectedVal);
        // console.log('You have chosen: ' + $(this).selectedIndex);

        if ($(this).prop('selectedIndex') == 0) {
          // alert('ZERO WAS CHOSEN IT WORKS!');
          return;
        }

        // if (selectedVal == 'Please select an image to view') { // does nothing is user switches back to invalid index
        //   return;
        // }

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

        // update the body of the edit title/desc table
        // $('#edit-title-desc-table').append(function () {
        //   console.log("entered editing of title and desc table");
        //   var content = '<tr>';

        //   var selectedVal = $('#svgSelector').children('option:selected').val();

        //   $.ajax({
        //     type: 'get',
        //     dataType: 'json',
        //     url: '/viewSVG/' + selectedVal,
        //     success: function (data) {return data;},
        //     fail: function (err) {
        //       console.log("Something went wrong while getting info for editing title and desc " + err);
        //       return null;
        //     }
        //   });

        //   content += '<td>Title: </td';
        //   content += 
        //   `<td>
        //     <div class="input-group mb-3">
        //       <input type="text" class="form-control" value="${fileInfo.title}" aria-label="Recipient's username" aria-describedby="button-addon2">
        //       <div class="input-group-append">
        //         <button class="btn btn-outline-secondary" type="button" id="button-addon2">Save Edit</button>
        //       </div>
        //     </div>
        //   </td>`;

        //   content += '</tr>';
        //   console.log("EDITING: " + fileInfo.data);
        //   return content;
        // });

      });

      // $('#edit-title').submit(function (e) {
      //   e.preventDefault();
      //   alert("Woah there sally");
      // });

      // Parse the drop down to display actual other attributes
      $('#showAttr').change(function () {
        // alert("HELLO MAM");
        var selectVal = $(this).children('option:selected').val();
        console.log('You have chosen DAB: ' + selectVal);
        if ($(this).prop('selectedIndex') > 0) { // they need to pick an element whose elements to view
          // alert("DIE");
          // console.log($(this).prop('selectedIndex'));
          $('#add-edit-attr-table').show("slow");

          var elementObj = {
            elemType: "", // empty at creation
            index: 0, // default index
            fileName: ""
          };

          populateShowAttrDropDown(selectVal, elementObj);

          // send the parsed element to the server to receive their other attributes
          $.ajax({
            type: 'get', // Get Request
            dataType: 'json',
            url: '/getOtherAttrs',
            data: {
              elementObj
            },
            success: function (returnVal) {
              console.log('Success out here');

              // returnVal is an array of objects so you for of to iterate through arrays and for in for objects
              $('#add-edit-attr-table').html(showOtherAttr(returnVal)); // add the returned items as rows for each object;

            },
            fail: function (error) {
              console.log('Failed to send element data to server. ' + error);
            }
          });

        } else {
          $('#add-edit-attr-table').slideUp("slow");
        }
        console.log("Printing index in the drop down: " + $(this).prop('selectedIndex'));
      });

      console.log('Successfully loaded any images.');
    },
    fail: function (error) {
      console.log('Failed to load any images. ' + error);
    }
  });

});

// Populates the drop down menu
function createShowAttr(type, data) {

  if (type == null) { // no elements to display the attributes of
    alert('IN HERE');
    // dropDownData += '<tr class="view-data">';
    // dropDownData += `<td colspan="7">`;
    // dropDownData += '<select id="showAttr" disabled>';
    $('#showAttr').html(function (content) {
      content += "<option>There are no elements to display the attributes of</option>";
      $(this).prop("disabled", true);
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
    $('#showAttr').html(function (dropDownData) {
      dropDownData += "<option>Please select an element's attribute to show</option>";
      // $(this).prop("disable", true);


      // do <option></option> per attr shown of each element (probably in a for loop) and don't add to list if it has no 

      // rect, circ, path, group

      //rectangles
      for (let i = 1; i <= data.rectList.length; i++) {
        if (data.rectList[i - 1].numAttr > 0) { // only display elements in the drop down if they have other attributes
          dropDownData += `<option>Rectangle ${i}</option>`;
        }
      }

      for (let i = 1; i <= data.circList.length; i++) {
        if (data.circList[i - 1].numAttr > 0) { // only display elements in the drop down if they have other attributes
          dropDownData += `<option>Circle ${i}</option>`;
        }
      }

      for (let i = 1; i <= data.pathList.length; i++) {
        if (data.pathList[i - 1].numAttr > 0) { // only display elements in the drop down if they have other attributes
          dropDownData += `<option>Path ${i}</option>`;
        }
      }

      for (let i = 1; i <= data.groupList.length; i++) {
        if (data.groupList[i - 1].numAttr > 0) { // only display elements in the drop down if they have other attributes
          dropDownData += `<option>Group ${i}</option>`;
        }
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

  alert("It works boi");
  console.log("It works boi");
  return;
}

// edit title
function editTitle() {
  // alert('WOWZERSSSSSSSSSSSSSSS');
  var inputVal = $('#edit-title').val();
  alert(inputVal);
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
  console.log("went past wtf");
}

// edit desc
function editDesc() {
  var inputVal = $('#edit-desc').val();
  alert(inputVal);
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
    type: 'get', // POST Request
    dataType: 'json',
    url: '/updateDesc',
    data: {
      desc: inputVal,
      file: filename
    },
    success: () => {
      alert("You have successfully updated the desc for the chosen SVG");
      location.reload(true);
    },
    fail: function (err) {
      console.log("updateDesc in server failed to update properly! Err: " + err);
    }
  });
}

// Get the other attributes from the element selected in the drop down menu
function showOtherAttr(returnVal) {
  var content;

  for (index of returnVal) {
    content += "<tr>";
    content += `<td>${index.name}: </td>`;
    content += `<td>
                  <div class="input-group mb-3">
                    <input type="text" class="form-control" value="${index.value}" aria-label="Recipient's username" aria-describedby="button-addon2">
                    <div class="input-group-append">
                      <button class="btn btn-outline-secondary" type="button" id="button-addon2">Save Edit</button>
                    </div>
                </div>
                </td>`;
    // content += `<td>${index.value}</td>`;
    // content += '<td></td>';
    content += "</tr>";
  }

  return content;
}

// populates object with items that will be inputted into the edit other attributes table
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
  }
}

// handle save edit from add/edit other attrs
function otherAttrEditSave() {

}