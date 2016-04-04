var apiDomainURL = "";
if (window.location.hostname === "localhost") {
    apiDomainURL = "http://localhost:3000";
} else {
    apiDomainURL = "https://frank.treasury.love";
}

$(document).ready(function () {
    checkForProfile();
    //checkForPartner();
});

function checkForPartner() {
    var linked_ID = localStorage.getItem("linked_profile_id");

    if (linked_ID === null) {
        $('#partner_form').show();
    } else {
        $('#partner_form').hide();
    }
}

function checkForProfile () {
    if (localStorage.getItem("profile_firstname")) {
        var profile_firstname = localStorage.getItem("profile_firstname");
        console.log("Found profile firstname from storage " + profile_firstname);
        $('#profile-name').text(profile_firstname);
        $('#profile').hide();
    }

    if (localStorage.getItem("profile_id") === null) {
        console.log("No profile found. redirecting to welcome");
        window.location = 'welcome.html';
    }
}

$('input[type=radio][name=received]').change(function () {
    if (this.value == 'received') {
        $('#rating-element').show();
    }
    else if (this.value == 'given') {
        $('#rating-element').hide();
    }
});

$('#love-bank').submit(function () {
    var rating = $('#rating').val();
    var description = JSON.stringify($(this).find('textarea').val());
    var profile_id = localStorage.getItem("profile_id");
    var profile_firstname = localStorage.getItem("profile_firstname");
    var dat = '{ "data":' +
        '{ "type": "love-banks","relationships": {' +
        '"profile":{ "data":{ "type": "profiles", "id": "' + profile_id + '" }}},' +
        '"attributes": {"note":' + description + ', "rating":' + rating + '}}}';

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
    }).success(function (json) {
        console.log("JSON success response", json);
        toastr["success"]("Successfully saved entry");
        $('#love-bank').trigger("reset");
    }).error(function (json) {
        console.log(json);
        toastr["error"]("There was a problem.");
    });

    /* stop form from submitting normally */
    event.preventDefault();
});

$('#mood').submit(function () {
    var rating = $('#rating').val();
    var description = JSON.stringify($(this).find('textarea').val());
    var profile_id = localStorage.getItem("profile_id");
    var profile_firstname = localStorage.getItem("profile_firstname");
    var dat = '{ "data":' +
        '{ "type": "moods","relationships": {' +
        '"profile":{ "data":{ "type": "profiles", "id": "' + profile_id + '" }}},' +
        '"attributes": {"note":' + description + ', "rating":' + rating + '}}}';

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
    }).success(function (json) {
        console.log("JSON success response", json);
        toastr["success"]("Successfully saved entry");
        $('#mood').trigger("reset");
    }).error(function (json) {
        console.log(json);
        toastr["error"]("There was a problem.");
    });

    /* stop form from submitting normally */
    event.preventDefault();
});

$('#entry').submit(function () {
    //var occurred_on = $('#date-picker-2').val();
    var rating = $('#rating').val();
    //var received = $('input[name=received]:checked', $(this)).val();
    //if (received === 'given') {
    //  received = false;
    //  rating = null;
    //} else {
    //  received = true;
    //}

    //var keep_private = $('input[name=keep_private]:checked', $(this)).val();
    var description = JSON.stringify($(this).find('textarea').val());
    var profile_id = localStorage.getItem("profile_id");
    var profile_firstname = localStorage.getItem("profile_firstname");
    var linked_ID = localStorage.getItem("linked_profile_id");

    // this is to handle how Rails will cast undefined to true in Rails 5
    //if(typeof received === 'undefined'){
    //  received = false;
    //}
// this is to handle how Rails will cast undefined to true in Rails 5
//  if(typeof keep_private === 'undefined'){
//    keep_private = false;
//  }

    var dat = '{ "data":' +
        '{ "type": "entries","relationships": {' +
        '"profile":{ "data":{ "type": "profiles", "id": "' + profile_id + '" }}},' +
        '"attributes": {"received":"true","private":"false","note":' + description
        + ', "rating":' + rating + ',"linked-profile-id":' + linked_ID + '}}}';

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

$('#linked-profile-form').submit(function () {
    var email = $(this).find('input[name="email"]').val();
    $.ajax({
        type: $(this).attr('method'),
        url: apiDomainURL + $(this).attr('action') + email,
        headers: {
            Accept: "application/json"
        },
        dataType: "JSON" // you want a difference between normal and ajax-calls, and json is standard
    }).success(function (json) {
        console.log("JSON success response", json);
        if (json.data.length == 1) {
            var linked_profile_id = json.data[0].id;
            var linked_profile_email = json.data[0].attributes.email;
            $('#partner_form').hide();
            localStorage.setItem("linked_profile_id", linked_profile_id);
            localStorage.setItem("linked_profile_email", linked_profile_email);
            toastr["success"]("Profile linked to " + linked_profile_email, "Success!");
        } else {
            invitePartner(email);
            $('#linked-profile-form').trigger("reset");
        }
    }).error(function (json) {
        console.log(json);
        toastr["error"]("There was a problem linking to the account.");
    });

    /* stop form from submitting normally */
    event.preventDefault();
});
