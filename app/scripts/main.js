'use strict';
var version = 1;

var apiDomainURL = "";
if (window.location.hostname === "localhost") {
  apiDomainURL = "https://frank-api-dev.herokuapp.com";
} else {
  apiDomainURL = "https://frank.treasury.love";
}

$(document).ready(function () {
    checkForUpgrade();
    checkForProfile();
    setProfileLink();
    setupPartnerDropDown();
});

/**
 * establishes the dropdown menu on the Journal Entry page.
 * if any partners are already linked, display those partners in the menu.
 */
function setupPartnerDropDown()
{
    const linked_name = localStorage.getItem('selected_partner_name');
    const linked_id = localStorage.getItem('selected_partner_id');
    if (linked_id && linked_name != null) {
        $("#partner_dropdown:first-child").html("<span class=\"caret\"></span> " + linked_name).val(linked_id);
        $("#selected_partner_id").val(linked_id);
        $("#partner_dropdown_list").append(
            "<li><a id=\"" + linked_id + "\" href=\"#\">" + linked_name + "</a></li>" +
            "<li role=\"separator\" class=\"divider\"></li>"
        )
    }

    $("#partner_dropdown_list").append("<li><a href=\"#\">Add New Partner</a></li>");

    // set the selected partner to the displayed value in the dropdown menu.
    $(".dropdown-menu li a").click(function(){
        const val = $(this).text();
        if (val == "Add New Partner") {
            $('.modal').modal('show');
            const $form = $('form[data-async]');
            $form.trigger("reset");
            $('#errors').empty().hide();
            $form.submit(function(event) {
                event.preventDefault();

                const $target = $($form.attr('data-target'));
                const email = $form.find('input[name="email"]').val();

                $.ajax({
                    type: 'get',
                    url: apiDomainURL + '/profiles?filter[email]=' + email,
                    headers: {
                        Accept: 'application/vnd.api+json',
                        'Content-Type': 'application/vnd.api+json'
                    },
                    success: function(data, status) {
                        if (status !== "success") {
                            $('#errors').empty().append("There were errors.").show();
                        }
                        if (data.data.length == 0) {
                            $('#errors').empty().append("No matching email found").show();
                        } else {
                            const fullName = data.data[0].attributes['full-name'];
                            const partnerID = data.data[0].id;
                            localStorage.setItem("selected_partner_name", fullName);
                            localStorage.setItem("selected_partner_id", partnerID);
                            $("#selected_partner_id").val(partnerID);
                            $("#partner_dropdown:first-child").html("<span class=\"caret\"></span> " + fullName).val(partnerID);
                            $('#errors').empty().append("Success!").show();
                        }
                    }
                });
            });
        } else {
            // get the value of the chosen partner and set the form value.
            localStorage.setItem("selected_partner_name", $(this).text());
            localStorage.setItem("selected_partner_id", $(this).attr('id'));
            $("#selected_partner_id").val($(this).attr('id'));
            $("#partner_dropdown:first-child").html("<span class=\"caret\"></span> " + $(this).text()).val($(this).attr('id'));
        }
    });
}

/**
 * set the profile name in the Nav bar
 */
function setProfileLink() {
  const profile = JSON.parse(localStorage.getItem('profile'));
  if (profile != null) {
    $("#profile_link").text(JSON.parse(localStorage.getItem('profile')).firstname);
    $("#logout_link").show();
  }
}

function checkForProfile()
{
  const profile = JSON.parse(localStorage.getItem('profile'));
  if (profile != null) {
    var path = window.location.pathname;
    if (path.indexOf("journal.html") == -1 && path.indexOf("html") == -1) {
      window.location = "journal.html";
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
    if (version > v) {
      performUpgrade();
    }
  }
}

$('#entry').submit(function () {

    /* stop form from submitting normally */
    event.preventDefault();
    const linked_id = $("#selected_partner_id").val();
    const profile_id = JSON.parse(localStorage.getItem('profile_id'));
    $(this).find("input[type=submit]:focus").attr("disabled", "true");

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

    // force the user to choose a partner
    if (linked_id == null) {
        toastr.info("You must choose a partner");
        return;
    }

  var data = '{ "data":' +
    '{ "type": "entries","relationships": {' +
    '"profile":{ "data":{ "type": "profiles", "id": "' + profile_id + '" }}},' +
    '"attributes": {"received":"true","private":"false","note":' + JSON.stringify(description)
    + ', "rating":' + rating + ',"linked-profile-id":' + linked_id + '}}}';

  $.ajax({
    type: $(this).attr('method'),
    url: apiDomainURL + $(this).attr('action'), //submits it to the given url of the form
    data: data,
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json'
    },
    dataType: "JSON" // you want a difference between normal and ajax-calls, and json is standard
  }).success(function (json) {
      $(this).find("input[type=submit]:focus").prop('disabled', false);
      toastr["success"]("Successfully saved entry");
    $('#entry').trigger("reset");
  }).error(function (json) {
      $(this).find("input[type=submit]:focus").prop('disabled', false);
      toastr["error"]("There was a problem.");
  });
});
