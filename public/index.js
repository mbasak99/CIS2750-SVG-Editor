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

      // update the table with the data I just received
      $('.log-data-body').html(function (content) {
        for (const element of data.list) {
          // use innerHTML for td and outerHTML when handling another SVG
          content += '<tr class="log-data">';
          console.log(element);

          // var image = $.get({ // get image from server
          //   url: '/tableImage/' + element.fileName, //The server endpoint we are connecting to
          //   dataType: 'xml', //Data type - we will use JSON for almost everything 
          //   success: function (data) {
          //     console.log('HELLOOOOOOOOOOOOOOOOOOOOOOOOOOOO');
          //     // console.log(data);
          //     console.log(`<img src="${data}" inner alt="Image of ${element.fileName}">`);
          //     // return `<img src="${data}" alt="Image of ${element.fileName}>`;
          //     return data;
          //   },
          //   fail: function (error) {
          //     console.log('Error: ' + error);
          //     return 'Image could not be found';
          //   }
          // }); // add img sourcer here

          // table data
          content += `<td><img src="../uploads/${element.fileName}" alt="Image of ${element.fileName}"></td>`; // Show image
          // console.log(JSON.stringify(image));
          content += `<td><a href="../uploads/${element.fileName}" download>${element.fileName}</td>`;
          content += '<td>' + element.fileSize + ' <strong>KB</strong>' + '</td>';
          content += '<td>' + element.numRect + '</td>';
          content += '<td>' + element.numCirc + '</td>';
          content += '<td>' + element.numPath + '</td>';
          content += '<td>' + element.numGroup + '</td>';

          content += '</tr>';
        }

        return content;
      })

    },
    fail: function (error) {
      $('#blah').html('Error: ' + error);
    }
  });

  // Need to create function to modify the table so it's dynamically allocating table data when the HTML is done loading
  // var table = $(".svg-table").

});