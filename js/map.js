function WindowBind(marker, map, infowindow, html, pinloc) {
    marker.addListener('click', function() {
        infowindow.setContent(html);
        infowindow.open(map, this);
    
        Cookie.set('bar-selected', pinloc);
    });
}

function initMap() {
    var myLatLng = {lat: 41.850033, lng: -87.6500523};
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: myLatLng
    });

    $.ajax({
        url: "/getCSV",
        success: function (results) {
            results = JSON.parse(results);
            results = FindLinks(results, map);
            SetMarkers(results, myLatLng, map);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert("Error getting map. Please contact j714a273@ku.edu for support (Server error).");
        }
    });
}

function FindLinks(results, map){
    var maxLinks = 0;
    var minLinks = 10;
    var totalLinks = 0;
    var isLink = true;
    for(var i = 0; i < results.length; i++){
        results[i].Links = [];

        if (results[i].Lat == null || results[i].Lng == null)  
            break;

        for (var j = 0; j < results.length; j++){
            if (i == j || results[j].Lat == null || results[j].Lng == null)
                continue;
            isLink = true;
            var pointOne = ConvertToCartesian(results[i].Lat,results[i].Lng);
            var pointTwo = ConvertToCartesian(results[j].Lat,results[j].Lng);
            var midpoint = MidPointCartesian(pointOne.x, pointOne.y,pointTwo.x,pointTwo.y);
            var dist = DistanceCartesian(midpoint.x, midpoint.y, pointTwo.x, pointTwo.y);
            var midpointLatLon = ConvertToLatLon(midpoint.x,midpoint.y);
            var newestDist = distance(midpointLatLon.lat, midpointLatLon.lng, results[j].Lat, results[j].Lng, 'K') * 1000;

            var lon1 = midpoint.y - dist;
            var lon2 = midpoint.y + dist;
            var lat1 = midpoint.x - dist; 
            var lat2 = midpoint.x + dist;
             
            for (var k = 0; k < results.length; k++){
                if (results[i] == results[k] || results[j] == results[k] || results[k].Lat == null || results[k].Lng == null)
                    continue;
                var pointThree = ConvertToCartesian(results[k].Lat, results[k].Lng);
                //let lat3 = results[k].Lat;
                //let lng3 = results[k].Lng;
                //var newDist = distance(midpoint.lat,midpoint.lng, lat3, lng3,'M');
                var newDist = DistanceCartesian(midpoint.x,midpoint.y, pointThree.x, pointThree.y);

                if( pointThree.x < lat2 && pointThree.x > lat1 && pointThree.y < lon2 && pointThree.y > lon1 && newDist < dist ){
                    isLink = false;
                    break;
                }
            }

            if(isLink){
                results[i].Links.push({ lat: results[j].Lat, lng: results[j].Lng });            
                var position = { lat: results[i].Lat, lng: results[i].Lng };
                var positionTwo = {lat: results[j].Lat, lng: results[j].Lng };

                var newLink = CreateLink(position, positionTwo);

                //Use next two for testing
                if (i == (results.length - 1)){
                    //var marker = CreateMarker(midpointLatLon, results[i], map);
                    //var cityCircle = DrawCircle(midpointLatLon, newestDist, map); 
                }

                newLink.setMap(map);
            }
        }
        if(results[i].Links.length > maxLinks)
            maxLinks = results[i].Links.length;
        else if(results[i].Links.length < minLinks && results[i].Links != null)
            minLinks = results[i].Links.length;
        
        if(results[i].Links.length >= 6){
            console.log(results[i].City + ", " + results[i].State);
        }
        totalLinks += results[i].Links.length;
    }
    results.MaxLinks = maxLinks;
    results.MinLinks = minLinks;
    results.TotalLinks = totalLinks;
    console.log(results);
    return results;
}

function SetMarkers(results, myLatLng, map){
    for(var i = 0; i < results.length; i++){
        var position = { lat: results[i].Lat, lng: results[i].Lng };
        var strokeColor = "#ff0000";
        var marker = CreateMarker(position, results[i], map);

        var contentString = '<div></div>'

        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });
        
        WindowBind(marker, map, infowindow, contentString, position);
    }
}

function CreateMarker(position, result, map){
    var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: result.City + "," + result.State,
            icon: {
					path: google.maps.SymbolPath.CIRCLE,
					strokeColor: '#000',
					strokeWeight: 1,
					fillColor: '#FF0000',
					fillOpacity: 1,
					scale: 3
            }
    });
    return marker;
}

function CreateLink(position, positionTwo){
    var link = new google.maps.Polyline({
        path: [position, positionTwo],
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2,
    });
    return link;
}

function DrawCircle(center, dist, map){
    var circle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: map,
        center: center,
        radius: dist
    });
}

function DegreesToRadians(degrees){
    return (Math.PI * degrees) / 180;
}

function RadiansToDegrees(radians){
    return (180 * radians) / Math.PI;
}

function MidPoint(lat1, lon1, lat2, lon2){
    var dLon = DegreesToRadians(lon2 - lon1);

    //convert to radians
    lat1 = DegreesToRadians(lat1);
    lat2 = DegreesToRadians(lat2);
    lon1 = DegreesToRadians(lon1);

    var Bx = Math.cos(lat2) * Math.cos(dLon);
    var By = Math.cos(lat2) * Math.sin(dLon);
    var lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By));
    var lon3 = lon1 + Math.atan2(By, Math.cos(lat1) + Bx);

    //print out in degrees
    var position = { lat: RadiansToDegrees(lat3), lng: RadiansToDegrees(lon3) };
    return position;
}