var socket = io.connect()
    , map
    , markersArray = []
    , aTweet
    , focusLocation
    , totalNogeoTweets = 0
    , totalgeoTweets = 0
    , limitTweetsTable = 100
    , limitMarkers = 1000
    , totalTweets = 0;

jQuery(function ($) {

    handleResetUiButton();

    //Map setup
    focusLocation = new google.maps.LatLng(40.800, -73.833); // focus on New York
    var mapOptions = {
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: focusLocation
    };
    map = new google.maps.Map(document.getElementById('map'),mapOptions);

    // Socket.io setup
    var tweetsWithoutGeoTable = $("#nogeotweetstable").find('tbody');
    var tweetsWithGeoTable = $("#geotweetstable").find('tbody');

    socket.on('tweets', function (data) {
        updateTotalTweets();
        aTweet = '<tr><td><a href="https://twitter.com/' +data.user+'" target="_blank">' + data.user + '</a>' + '</td><td>' + data.text + '</td></tr>';
        if(data.geo){
            updateTotalTweetsWithGeo();
            // Add a marker to the map
            addMarker(data.latitude,data.longitude,data.user,data.text);
            // Check table limit
            if(totalgeoTweets >= limitTweetsTable){ // table limit
                removeTableRow($("#geotweetstable"));
            }
            // add it to the table
            tweetsWithGeoTable.prepend(aTweet);
        } else {
            updateTotalTweetsWithoutGeo();
            // Check Limit
            if(totalNogeoTweets >= limitTweetsTable){
                removeTableRow($("#nogeotweetstable"));
            }
            // add it to the table
            tweetsWithoutGeoTable.prepend(aTweet);
        }
    });
});

/**
 * Updating the global tweet counter
 *
 */
function updateTotalTweets() {
    totalTweets = totalTweets + 1;
    $("span#totaltweet").html(totalTweets);
}

/**
 * Updating geatagged tweets counter
 *
 */
function updateTotalTweetsWithGeo() {
    totalgeoTweets = totalgeoTweets + 1;
    $("span#totaltweetWithGeo").html(totalgeoTweets);
}

/**
 * Updating  tweets counter without geotag
 *
 */
function updateTotalTweetsWithoutGeo() {
    totalNogeoTweets = totalNogeoTweets + 1;
    $("span#totaltweetWithoutGeo").html(totalNogeoTweets);
}


/**
 * Adding a new marker to the map
 *
 * @param latitude
 * @param longitude
 * @param user
 * @param text
 */
function addMarker(latitude,longitude,user,text){
    var infowindow = new google.maps.InfoWindow();
    infowindow.setContent('<a href="https://twitter.com/' +user+'" target="_blank">' + user + '</a> says: '+ '<p>'+ text+'</p>');
    var marker = new google.maps.Marker({
        map:map,
        draggable:false,
        animation: google.maps.Animation.DROP,
        position: new google.maps.LatLng(latitude,longitude)
    });

    if(markersArray.length >= limitMarkers){
        markersArray[0].setMap(null);
        markersArray.shift();
    }
    markersArray.push(marker);
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map, marker);
    });
}


/**
 * Remove last table row
 *
 * @param a Table
 */
function removeTableRow(jQtable){
    jQtable.each(function(){
        if($('tbody', this).length > 0){
            $('tbody tr:last', this).remove();
        }else {
            $('tr:last', this).remove();
        }
    });
}

/**
 * Reseting the UI:
 * - Clear map.
 * - Clear tables
 * - Reset tweet counters.
 */
function handleResetUiButton(){
    $("#clearMapButton").click(function (e) {
        e.preventDefault();
        // Clear the map
        if (markersArray) {
            for (i in markersArray) {
                markersArray[i].setMap(null);
            }
            markersArray.length = 0;
            totalNogeoTweets = 0;
            totalgeoTweets = 0;
            totalTweets = 0;
            $("span#totaltweet").html('0');
            $("span#totaltweetWithGeo").html('0');
            $("span#totaltweetWithoutGeo").html('0');
        }
        // Clear the tables
        $('#geotweetstable tbody').empty();
        $('#nogeotweetstable tbody').empty();
    });
}