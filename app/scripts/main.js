console.log('\'Hello \'Hello!');
var apiDomainURL = "";
if (window.location.hostname === "localhost") {
  apiDomainURL = "http://localhost:3000";
} else {
  apiDomainURL = "https://frank.treasury.love";
}

var profile_firstname = localStorage.getItem("profile_firstname");
var linked_ID = localStorage.getItem("linked_profile_id");
var linked_FirstName = localStorage.getItem("linked_profile_firstname");

$(function () {
  $('#message').hide();
});

if (profile_firstname) {
  console.log("Found profile firstname from storage " + profile_firstname);
  $('#profile-name').text("Welcome " + profile_firstname);
  $('#profile').hide();
}

if (linked_FirstName) {
  $('#linked_FirstName').text("Linked to " + linked_FirstName);
  $('#linked-profile-form').hide();
}

if(linked_ID === null){
  $('#message').text('You must define a partner before you can submit an entry!').addClass('alert alert-warning').show();
}

$('input[type=radio][name=received]').change(function() {
    if (this.value == 'received') {
        $('#rating-element').show();
    }
    else if (this.value == 'given') {
        $('#rating-element').hide();
    }
});

$('#love-bank').submit(function() {
  var rating = $('#rating').val();
  var description = $(this).find('textarea').val();
  var profile_id = localStorage.getItem("profile_id");

  var dat = '{ "data":' +
  '{ "type": "love-banks","relationships": {' +
    '"profile":{ "data":{ "type": "profiles", "id": "' + profile_id + '" }}},' +
    '"attributes": {"note":"' + description + '", "rating":' + rating + '}}}';

  console.log(dat);

  $.ajax({
    type: "POST",
    url: apiDomainURL + $(this).attr('action'), //submits it to the given url of the form
    data: dat,
    headers: {
      Accept: "application/json",
      'Content-Type': 'application/vnd.api+json'
    },
    dataType: "JSON" // you want a difference between normal and ajax-calls, and json is standard
  }).success(function(json){
    console.log("JSON success response", json);
    $('#message').text('Success!').show();
  }).error(function(json) {
    console.log (json);
    $('#message').text('Oops, there was a problem').show();
  });

  /* stop form from submitting normally */
  event.preventDefault();
});

$('#mood').submit(function() {
  var rating = $('#rating').val();
  var description = $(this).find('textarea').val();
  var profile_id = localStorage.getItem("profile_id");

  var dat = '{ "data":' +
    '{ "type": "moods","relationships": {' +
    '"profile":{ "data":{ "type": "profiles", "id": "' + profile_id + '" }}},' +
    '"attributes": {"note":"' + description + '", "rating":' + rating + '}}}';

  console.log(dat);

  $.ajax({
    type: $(this).attr('method'),
    url: apiDomainURL + $(this).attr('action'), //submits it to the given url of the form
    data: dat,
    headers: {
      Accept: "application/json",
      'Content-Type': 'application/vnd.api+json'
    },
    dataType: "JSON" // you want a difference between normal and ajax-calls, and json is standard
  }).success(function(json){
    console.log("JSON success response", json);
    $('#message').text('Success!').show();
  }).error(function(json) {
    console.log (json);
    $('#message').text('Oops, there was a problem').show();
  });

  /* stop form from submitting normally */
  event.preventDefault();
});

$('#entry').submit(function() {
  var occurred_on = $('#date-picker-2').val();
  var rating = $('#rating').val();
  var received = $('input[name=received]:checked', $(this)).val();
  if (received === 'given') {
    received = false;
    rating = null;
  } else {
    received = true;
  }

  var keep_private = $('input[name=keep_private]:checked', $(this)).val();
  var description = $(this).find('textarea').val();
  var profile_id = localStorage.getItem("profile_id");

  // this is to handle how Rails will cast undefined to true in Rails 5
  if(typeof received === 'undefined'){
    received = false;
  }
// this is to handle how Rails will cast undefined to true in Rails 5
  if(typeof keep_private === 'undefined'){
    keep_private = false;
  }

  var dat = '{ "data":' +
    '{ "type": "entries","relationships": {' +
    '"profile":{ "data":{ "type": "profiles", "id": "' + profile_id + '" }}},' +
    '"attributes": {"received":"' + received + '","private":"' + keep_private + '","note":"' + description
    + '", "rating":' + rating + ',"linked-profile-id":' + linked_ID + ', "occurred-on":"' + occurred_on + '"}}}';

  console.log(dat);

  $.ajax({
    type: $(this).attr('method'),
    url: apiDomainURL + $(this).attr('action'), //submits it to the given url of the form
    data: dat,
    headers: {
      Accept: "application/json",
      'Content-Type': 'application/vnd.api+json'
    },
    dataType: "JSON" // you want a difference between normal and ajax-calls, and json is standard
  }).success(function(json){
    console.log("JSON success response", json);
    $('#message').text('Success!').show();
  }).error(function(json) {
    console.log (json);
    $('#message').text('Oops, there was a problem').show();
  });

  /* stop form from submitting normally */
  event.preventDefault();
});
