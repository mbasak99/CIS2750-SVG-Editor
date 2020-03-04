// Put all onload AJAX calls here, and event listeners
$(document).ready(function () {
  // On page-load AJAX Example
  $.ajax({
    type: 'get', //Request type
    dataType: 'json', //Data type - we will use JSON for almost everything 
    url: '/someendpoint', //The server endpoint we are connecting to
    data: {
      name1: "Value 1",
      name2: "Value 2"
    },
    success: function (data) {
      /*  Do something with returned object
          Note that what we get is an object, not a string, 
          so we do not need to parse it on the server.
          JavaScript really does handle JSONs seamlessly
      */
      $('#blah').html("On page load, received string '" + data.foo + "' from server");
      //We write the object to the console to show that the request was successful
      console.log(data);

    },
    fail: function (error) {
      // Non-200 return, do something with error
      $('#blah').html("On page load, received error from server");
      console.log(error);
    }
  });

  // Event listener form example , we can use this instead explicitly listening for events
  // No redirects if possible
  $('#someform').submit(function (e) {
    $('#blah').html("Form has data: " + $('#entryBox').val());
    e.preventDefault();
    //Pass data to the Ajax call, so it gets passed to the server
    $.ajax({
      //Create an object for connecting to another waypoint
    });
  });

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
            <h3>Upload a file here</h3>
            <form id="upload-svg" method="post" action="/upload" enctype="multipart/form-data">
              <label>Select an SVG to upload here: </label>
              <input type="file" name="svgIMG" accept=".svg">
              <br>
              <input id="submitBtn" type="submit" value="Upload SVG">
            </form>
          </td>
        </tr>`;

        return content;
      });

      // $('#upload-svg').submit(function () {
      //   alert('DABBERZZZ');
      //   console.log('STOP!!!');
      // });

      // Need to update the values in the drop down
      $('#svgSelector').html(function (content) {
        content += '<option>Please select an image to view</option>';
        for (const element of data.list) {
          content += `<option>${element.fileName}</option>`;
        }

        return content;
      });

      // Need to get the index of chosen value in drop down
      $('#svgSelector').change(function () {
        var selectedVal = $(this).children('option:selected').val();
        console.log('You have chosen: ' + selectedVal);
        // console.log('You have chosen: ' + $(this).selectedIndex);

        if (selectedVal == 'Please select an image to view') { // does nothing is user switches back to invalid index
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
                content += `<td class="title">${data.title}</td>`;
              }

              if (data.desc == "") { // there's no desc
                content += '<td colspan="2" class="desc"><i>(EMPTY)</i></td>';
              } else {
                content += `<td colspan="2" class="desc">${data.desc}</td>`;
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
                  let newStr = path.d.slice(0,65);
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
              if (data.rectList.length || data.circList.length || data.pathList.length || data.groupList.length) { // there must be elements in order to show attributes
                content += createShowAttr('exists', data);
              } /* else {
                content += createShowAttr(null);
              } */

              return content;
            });
          },
          fail: function (error) {
            console.log("ERR in SVG Panel summary " + error);
          }
        });
      });

      console.log('Successfully loaded any images.');
    },
    fail: function (error) {
      console.log('Failed to load any images. ' + error);
    }
  });

  

});

function createShowAttr(type, data) {
  var dropDownData;

  if (type == null) {

  } else {
    dropDownData += '<tr class="view-data">';
    dropDownData += `<td colspan="7">`;
    dropDownData += '<select id="showAttr">';
    dropDownData += "<option>Please select an element's attribute to show</option>";
    dropDownData += '</select>';
    dropDownData += '</td>';
    dropDownData += '</tr>';
  }

  return dropDownData;
}