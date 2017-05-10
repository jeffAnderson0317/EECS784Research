function ConvertToCartesian(lat, lon){
    // creating source and destination Proj4js objects
    // once initialized, these may be re-used as often as needed
    var source = new Proj4js.Proj('EPSG:4326');    //source coordinates will be in Longitude/Latitude, WGS84
    var dest = new Proj4js.Proj('EPSG:3785');     //destination coordinates in meters, global spherical mercators projection, see http://spatialreference.org/ref/epsg/3785/

    // transforming point coordinates
    var p = new Proj4js.Point(lon,lat);   //any object will do as long as it has 'x' and 'y' properties
    Proj4js.transform(source, dest, p);      //do the transformation.  x and y are modified in place

/*
    //p.x and p.y are now EPSG:3785 in meters
    var cosLat = Math.cos(lat * Math.PI / 180.0);
    var sinLat = Math.sin(lat * Math.PI / 180.0);
    var cosLon = Math.cos(lon * Math.PI / 180.0);
    var sinLon = Math.sin(lon * Math.PI / 180.0);
    var rad = 6378137.0;
    var f = 1.0 / 298.257224;
    var C = 1.0 / Math.sqrt(cosLat * cosLat + (1 - f) * (1 - f) * sinLat * sinLat);
    var S = (1.0 - f) * (1.0 - f) * C;
    var h = 0.0;
    var x = (rad * C + h) * cosLat * cosLon;
    var y = (rad * C + h) * cosLat * sinLon;
    */
    return { x: p.x, y:p.y }
}

function MidPointCartesian (x1, y1, x2, y2){
    var x = (x1 + x2)/2;
    var y = (y1 + y2)/2;
    return { x:x, y:y };
}

function DistanceCartesian(x1,y1,x2,y2){
    return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));
}

function ConvertToLatLon(x, y){
    // creating source and destination Proj4js objects
    // once initialized, these may be re-used as often as needed
    var dest = new Proj4js.Proj('EPSG:4326');    //source coordinates will be in Longitude/Latitude, WGS84
    var source = new Proj4js.Proj('EPSG:3785');     //destination coordinates in meters, global spherical mercators projection, see http://spatialreference.org/ref/epsg/3785/

    // transforming point coordinates
    var p = new Proj4js.Point(x,y);   //any object will do as long as it has 'x' and 'y' properties
    Proj4js.transform(source, dest, p);      //do the transformation.  x and y are modified in place

    return { lat: p.y, lng:p.x }
}
