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
        saveProfile(json);
        $('#profile-name').text("Welcome " + json.data[0].attributes.firstname);
        $('#profile').hide();
        toastr["success"]("Profile linked to " + json.data[0].attributes.firstname, "Success!");

    }).error(function (json) {
        console.log(json);
        toastr["error"]("There was a problem finding the account.");
    });
}

function saveProfile(json)
{
    localStorage.setItem("profile_id", json.data[0].id);
    localStorage.setItem("profile_firstname", json.data[0].attributes.firstname);
}