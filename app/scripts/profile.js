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

var profile_firstname = localStorage.getItem("profile_firstname");
if (profile_firstname) {
    var profile_form = $('#profile');
    profile_form.find('input[name="firstname"]').val(profile_firstname);
    var linked_profile_email = localStorage.getItem("linked_profile_email");
    if (linked_profile_email) {
        $('#linked-profile-form').find('input[name="email"]').val(linked_profile_email);
    }
}

$('#profile').submit(function () {
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
    }).success(function (json) {
        console.log("JSON success response", json);
        localStorage.setItem("profile_id", json.data.id);
        localStorage.setItem("profile_firstname", firstName);
        $('#profile-name').text("Welcome " + firstName);
        $('#profile').hide();
        toastr["success"]("Profile saved.", "Success!");
    }).error(function (json) {
        console.log(json);
        if (json.responseJSON.errors[0].status === "422" && json.responseJSON.errors[0].detail === "email - has already been taken") {
            getProfile(email);
        } else {
            toastr["error"]("There was a problem saving your account.");
        }
    });

    /* stop form from submitting normally */
    event.preventDefault();
});

function getProfile(email) {
    $.ajax({
        type: 'get',
        url: apiDomainURL + '/profiles?filter[email]=' + email,
        headers: {
            Accept: "application/json"
        },
        dataType: "JSON" // you want a difference between normal and ajax-calls, and json is standard
    }).success(function (json) {
        console.log("JSON success response", json);
        localStorage.setItem("profile_id", json.data[0].id);
        localStorage.setItem("profile_firstname", json.data[0].attributes.firstname);
        $('#profile-name').text("Welcome " + json.data[0].attributes.firstname);
        $('#profile').hide();
        toastr["success"]("Profile linked to " + json.data[0].attributes.firstname, "Success!");

    }).error(function (json) {
        console.log(json);
        toastr["error"]("There was a problem finding the account.");
    });
}

function invitePartner(email) {
    $.ajax({
        type: 'post',
        url: mailDomainURL + '/invite_partner',
        data: {
            invite: {email: email, id: localStorage.getItem("profile_id")}
        },
        headers: {
            Accept: "application/json"
        },
        dataType: "JSON" // you want a difference between normal and ajax-calls, and json is standard
    }).success(function (json) {
        console.log("JSON success response", json);
        toastr["info"]("Invitation successfully sent to " + email +
            ". <br /> Make sure to revisit this page once your partner registers.", "Sent!");
    }).error(function (json) {
        console.log(json);
        toastr["error"]("There was a problem finding the account.");
    });
}

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
            $('#linked-profile-form').hide();
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
