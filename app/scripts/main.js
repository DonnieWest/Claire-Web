'use strict';
var version = 1;

var apiDomainURL = "";
if (window.location.hostname === "localhost") {
  apiDomainURL = "http://localhost:3000";
} else {
  apiDomainURL = "https://frank.treasury.love";
}

$(document).ready(function () {
  checkForProfile();
  checkForUpgrade();
  setProfileLink();
});

/**
 * set the profile name in the Nav bar
 */
function setProfileLink() {
  const profile = JSON.parse(localStorage.getItem('profile'));
  if (profile != null) {
    $("#profile_link").text(JSON.parse(localStorage.getItem('profile')).firstname);
  }
}

function checkForProfile()
{
  const profile = JSON.parse(localStorage.getItem('profile'));
  if (profile == null || profile.length == 0) {
    console.log("Window Location " + window.location);
    if (window.location.href.indexOf("journal.html") > -1) {
      window.location = "Account.html";
    }
  }
}

/**
 * Should we perform an upgrade.
 */
function checkForUpgrade()
{
  const v = localStorage.getItem('version');
  if (v == null) {
    localStorage.setItem('version', 1);
  } else {
    if (version < v) {
      performUpgrade();
    }
  }
}

$('#entry').submit(function () {

  // users do not like to see a rating of zero.
  // setting this to null so that the averages are not impacted.
  var rating = $('#rating').val();
  if (rating == 0) {
    rating = null;
  }
  var description = "";

  $("textarea").each(function () {
    description += this.value;
    description += "--";
    description += "\r\n";
  });

  const profile_id = JSON.parse(localStorage.getItem('profile_id'));
  const linked_id = JSON.parse(localStorage.getItem('linked_profile_id'));
  var data = '{ "data":' +
    '{ "type": "entries","relationships": {' +
    '"profile":{ "data":{ "type": "profiles", "id": "' + profile_id + '" }}},' +
    '"attributes": {"received":"true","private":"false","note":' + JSON.stringify(description)
    + ', "rating":' + rating + ',"linked-profile-id":' + linked_id + '}}}';

  console.log("Submitting journal entry " + data);

  $.ajax({
    type: $(this).attr('method'),
    url: apiDomainURL + $(this).attr('action'), //submits it to the given url of the form
    data: data,
    headers: {
      Accept: "application/json",
      'Content-Type': 'application/vnd.api+json'
    },
    dataType: "JSON" // you want a difference between normal and ajax-calls, and json is standard
  }).success(function (json) {
    console.log("JSON success response", json);
    toastr["success"]("Successfully saved entry");
    $('#entry').trigger("reset");
  }).error(function (json) {
    console.log(json);
    toastr["error"]("There was a problem.");
  });

  /* stop form from submitting normally */
  event.preventDefault();
});
