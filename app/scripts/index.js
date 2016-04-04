if(localStorage.getItem("profile_id") === null){
    console.log("No profile found. redirecting to welcome");
    window.location = 'welcome.html';
} else {
    window.location = 'journal.html';
}