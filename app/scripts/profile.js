var apiDomainURL = "";
if (window.location.hostname === "localhost") {
  apiDomainURL = "http://localhost:3000";
} else {
  apiDomainURL = "https://frank.treasury.love";
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
    localStorage.setItem("profile_id", json.data.id);
    localStorage.setItem("profile_firstname", firstName);
    $('#profile-name').text("Welcome " + firstName);
    $('#profile').hide();
    $('#message').text('Success! Profile successfully saved.').show();
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
    $('#linked-profile-form').hide();
    localStorage.setItem("linked_profile_id", linked_profile_id);
    localStorage.setItem("linked_profile_firstname", linked_profile_firstname);
    $('#message').text('Successfully connected to ' + linked_profile_firstname).show();
  }).error(function(json) {
    console.log (json);
    $('#message').text('Oops, there was a problem').show();
  });

  /* stop form from submitting normally */
  event.preventDefault();
});
