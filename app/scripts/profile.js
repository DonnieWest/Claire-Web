'use strict';
var version = 1;

var apiDomainURL = "";
if (window.location.hostname === "localhost") {
  apiDomainURL = "http://localhost:3000";
} else {
  apiDomainURL = "https://frank.treasury.love";
}

var mailDomainURL = "";
if (window.location.hostname === "localhost") {
  mailDomainURL = "http://localhost:3001";
} else {
  mailDomainURL = "https://frank-mail.treasury.love";
}

$(document).ready(function () {
  // populate the account form with the local storage
  loadProfileToForm();
  checkForUpgrade();

  // this is if the user is signing up for the first time.
  const param_email = getEmailQueryParam();
  if (param_email != null) {
    console.log("Found email query parameter " + param_email);
    // if it's a known user
    getProfile(param_email).then(function (result) {
      if (result.data.length == 1) {
        saveProfile(result.data[0]);
        window.location = "Account.html";
      } else {
        $("#profile").find('input[name="email"]').val(param_email);
      }
    }).catch(function (result) {
      console.log("Promise failed " + result);
    });
  }

  // Profile wizard
  // handle input changes for email address
  $("input[name=email]").focusout(function () {
    const email = $(this).val();
    if (email != null && email.length > 0) {
      handleExistingProfile(email);
    }
  });

});

/**
 * If the user already exists
 * @param email
 */
function handleExistingProfile(email) {
  getProfile(email).then(function (result) {
    if (result.data.length == 1) {
      saveProfile(result.data[0]);
    }
  }).catch(function (result) {
    console.log("Promise failed " + result);
  });
}
/**
 * We want to know if we are being passed an email address in the query parameter.
 * this is used during the account setup.
 */
function getEmailQueryParam() {
  return getParameterByName('email');
}

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/**
 * Should we perform an upgrade.
 */
function checkForUpgrade() {
  const v = localStorage.getItem('version');
  if (v == null) {
    localStorage.setItem('version', 1);
  } else {
    if (version < v) {
      performUpgrade();
    }
  }
}

function performUpgrade() {
  const id = localStorage.getItem('profile_id');
  getProfileById(id).then(function (result) {
    if (result.data.length == 1) {
      saveProfile(result);
      localStorage.setItem('version', 1);
    }
  }).catch(function (result) {
    console.log("Failed to retrieve profile by ID " + result);
  });
}

/**
 * set the profile name in the Nav bar
 */
function setProfileLink() {
  const profile_firstname = JSON.parse(localStorage.getItem('profile')).firstname;
  if (profile_firstname) {
    $("#profile_link").text(profile_firstname);
    $("#logout_link").show();
  }
}

// handle Profile form
$("#profile").submit(function () {
  event.preventDefault();
  const firstName = $(this).find('input[name="firstname"]').val();
  const lastName = $(this).find('input[name="lastname"]').val();
  const email = $(this).find('input[name="email"]').val();
  const partner_email = $(this).find('input[name="partner_email"]').val();
  const data = '{"data": {"type":"frank-profiles", "attributes":{"firstname":"' + firstName + '", "lastname":"' + lastName +
    '", "email":"' + email + '", "linked-email":"' + partner_email +'"}}}';

  // if we have a local profile, do not create the profile.
  // just finish the form and setup the partner link
  if (JSON.parse(localStorage.getItem('profile')) == null) {
    createProfile(data).then(function (result) {
      if (result.data.length > 0) {
        console.log("Form submitted - saving profile");
        saveProfile(result.data);
      }
    }).catch(function (result) {
      console.log("Promise failed " + result);
    });
  }

  if (JSON.parse(localStorage.getItem('profile')) != null) {
    setupPartner(partner_email);
  }

});

/**
 * creates the primary profile.
 * pass in a JSON formatted string according to the JSON API specs
 * @param data
 * @returns {*|Promise}
 */
function createProfile(data) {
  return new Promise(function (resolve, reject) {
    $.ajax({
      type: "post",
      url: apiDomainURL + '/frank-profiles', //submits it to the given url of the form
      data: data,
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      },
      dataType: "JSON" // you want a difference between normal and ajax-calls, and json is standard
    }).success(function (json) {
      resolve(json);
    }).error = reject;
  });
}

/**
 * Save the JSON formatted profile to the local storage
 * @param json
 */
function saveProfile(json) {
  localStorage.setItem('profile', JSON.stringify(json.attributes));
  localStorage.setItem('profile_id', JSON.stringify(json.id));
  console.log('Profile saved to local storage: ', JSON.parse(localStorage.getItem('profile')));
  loadProfileToForm();
}

/**
 * Load the local profile into the form. This gives the user something to view and edit their profile
 */
function loadProfileToForm() {
  var profile_form = $("#profile");
  const local_profile = JSON.parse(localStorage.getItem('profile'));
  const linked_local_profile = JSON.parse(localStorage.getItem('linked_profile'));
  if (local_profile != null) {
    profile_form.find('input[name="firstname"]').val(local_profile.firstname);
    profile_form.find('input[name="lastname"]').val(local_profile.lastname);
    profile_form.find('input[name="email"]').val(local_profile.email);
    setProfileLink();
  }

  if (linked_local_profile != null) {
    profile_form.find('input[name="partner_email"]').val(linked_local_profile.email);
  }
}

/**
 * Either save the partner to the local storage or invite by email.
 * @param email
 */
function setupPartner(email) {
  getProfile(email).then(function (result) {
    if (result.data.length == 1) {
        localStorage.setItem("selected_partner_name", result.data[0].attributes['full-name']);
        localStorage.setItem("selected_partner_id", result.data[0].id);
        window.location = "AccountSuccess.html";
    } else {
        console.log ("No partner email found. Oops " + email);
    }
  }).catch(function (result) {
        console.log("Promise failed " + result);
  });
}

/**
 * Retrieve a profile from the API by email address
 * a full JSON formatted repsonse is returned
 * @param email
 * @returns {*|Promise}
 */
function getProfile(email) {
  return new Promise(function (resolve, reject) {
    $.ajax({
      type: 'get',
      url: apiDomainURL + '/frank-profiles?filter[email]=' + email,
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      },
      dataType: "JSON" // you want a difference between normal and ajax-calls, and json is standard
    }).success(function (json) {
      resolve(json);
    }).error = reject;
  });
}

/**
 * Retrieve a profile from the API by email address
 * a full JSON formatted response is returned
 * @param id
 * @returns {*|Promise}
 */
function getProfileById(id) {
  return new Promise(function (resolve, reject) {
    $.ajax({
      type: 'get',
      url: apiDomainURL + '/frank-profiles/' + id,
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      },
      dataType: "JSON" // you want a difference between normal and ajax-calls, and json is standard
    }).success(function (json) {
      console.log("JSON success response" + json);
      resolve(json);
    }).error = reject;
  });
}
