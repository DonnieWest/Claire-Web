console.log('\'Hello \'Hello!');
var apiDomainURL = "https://frank.treasury.love";
var profile_firstname = localStorage.getItem("profile_firstname");
var linked_ID = localStorage.getItem("linked_profile_id");
var linked_FirstName = localStorage.getItem("linked_profile_firstname");

$(function () {
  $('#message').hide();
});

if (profile_firstname) {
  console.log("Found profile firstname from storage " + profile_firstname);
  $('#profile-name').text("Welcome " + profile_firstname);
}

if (linked_FirstName) {
  $('#linked_FirstName').text("Linked to " + linked_FirstName);
}

if(linked_ID === null){
  $('#message').text('You must define a partner before you can submit an entry!').addClass('alert alert-warning').show();
}

$('#profile').submit(function() {
  var firstName = $(this).find('input[name="firstname"]').val();
  var lastName = $(this).find('input[name="lastname"]').val();
  var email = $(this).find('input[name="email"]').val();
  var dat = '{"data": {"type":"profiles", "attributes":{"firstname":"' + firstName + '", "lastname":"' + lastName +
    '", "email":"' + email + '"}}}';
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
    debugger;
    localStorage.setItem("profile_id", json.data.id);
    localStorage.setItem("profile_firstname", firstName);
    $('#message').text('Success!').show();
  }).error(function(json) {
    console.log (json);
    $('#message').text('Oops, there was a problem').show();
  });

  /* stop form from submitting normally */
  event.preventDefault();
});

$('#linked-profile-form').submit(function() {
  var email = $(this).find('input[name="email"]').val();
  debugger;
  $.ajax({
    type: $(this).attr('method'),
    url: apiDomainURL + $(this).attr('action') + email,
    headers: {
      Accept: "application/json"
    },
    dataType: "JSON" // you want a difference between normal and ajax-calls, and json is standard
  }).success(function(json){
    console.log("JSON success response", json);
    var linked_profile_id = json.data[0].id;
    var linked_profile_firstname = json.data[0].attributes.firstname;
    debugger;
    localStorage.setItem("linked_profile_id", linked_profile_id);
    localStorage.setItem("linked_profile_firstname", linked_profile_firstname);
    $('#message').text('Success!').show();
  }).error(function(json) {
    console.log (json);
    $('#message').text('Oops, there was a problem').show();
  });

  /* stop form from submitting normally */
  event.preventDefault();
});

$('#love-bank').submit(function() {
  var rating = $('input[name=rating]:checked', $(this)).val();
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
  var rating = $('input[name=mood_rating]:checked', $(this)).val();
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
  var rating = $('input[name=rating]:checked', $(this)).val();
  var received = $('input[name=received]:checked', $(this)).val();
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
