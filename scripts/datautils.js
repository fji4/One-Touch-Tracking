/**
 * Parses shipping data from API and reduces it to necessary parts
 * 
 * @param {Object} shippingData whole object from response to parse
 */
function parseShippingData(packageName, trackNum, shippingData) {
    return {
        packageName: packageName,
        trackingNumber: trackNum,
        date: getPickupDate(shippingData),
        latestLocation: getLocation(shippingData)
    };
}

/**
 * Parses date given in data and returns object with separate month day and year
 * 
 * @param {Object} shippingData data from which date will be obtained
 */
function getPickupDate(shippingData) {
    var outDate = {};
    if(shippingData.PickupDate === undefined) {
        outDate = {
            month: '00',
            day: '00',
            year: '0000',
            fullDate: 'n/a'
        }
    }
    else {
        var month = shippingData.PickupDate.substring(4, 6),
            day = shippingData.PickupDate.substring(6, 8),
            year = shippingData.PickupDate.substring(0, 4);
        outDate = {
            month: month,
            day: day,
            year: year,
            fullDate: month + '/' + day + '/' + year
        }
    }
    return outDate;
}

/**
 * Gets object for latest Activity regardless of status
 * 
 * @param {Object} shippingData data from wich activity will be obtained
 */
function getLatestActivityLocation(shippingData) {
    const packageActivity = shippingData.Package !== undefined ? shippingData.Package.Activity : shippingData.Activity;
    var latestLocation;
    if(Array.isArray(packageActivity)) {
        var mostRecentActivity = packageActivity[0]; // guaranteed to exist if array
        for(var i = 0; i < packageActivity.length; i++) {
            const activity = packageActivity[i];
            if(mostRecentActivity.Date < activity.Date && activity.ActivityLocation !== undefined) {
                mostRecentActivity = activity;
            }
        }
        latestLocation = mostRecentActivity.ActivityLocation;
    }
    else {
        latestLocation = packageActivity.ActivityLocation;
    }
    return latestLocation;
}

/**
 * Trims location string to be cleaner and human-readable
 * 
 * @param {string} location location string to trim
 */
function trimLocation(locationStr) {
    var outStr = locationStr
    if(outStr.includes('undefined, ')) {
        outStr = outStr.replace(/undefined, /g, ''); // removes intermediate "undefined" labels
    }
    if(locationStr.endsWith('undefined')) {
        outStr = outStr.replace(/undefined/g, ''); // removes undefined + preceding , (", undefined")
    }
    return outStr;
}

function formatForUrl(locationStr) {
    return locationStr.replace(/ /g, '+');
}

/**
 * Gets latest location 
 * 
 * @param {Object} shippingData data from which location will be collected
 */
function getLocation(shippingData) {
    var latestLocation = getLatestActivityLocation(shippingData);
    var addrObj = {};
    if(latestLocation === undefined) {
        addrObj = {
            fullLocation: 'No known location',
            mapsUrl: 'https://maps.google.com/'
        }
    }
    else {
        var locationStr = latestLocation.Address === undefined ? 
        latestLocation.City + ', ' + latestLocation.StateProvinceCode + ', '+ latestLocation.CountryCode :
        locationStr = latestLocation.Address.City + ', ' + latestLocation.Address.StateProvinceCode + ', ' + latestLocation.Address.CountryCode
        console.log('LOCATION STR:' + locationStr);
        addrObj =  {
            fullLocation: trimLocation(locationStr),
            mapsUrl: 'https://www.google.com/maps/place/' + formatForUrl(locationStr) + '/'
        }
        console.log(addrObj);
        console.log(addrObj.fullLocation);
        console.log(addrObj.mapsUrl);
    }
    return addrObj;
}

// function interpretProgress(shippingData) {

// }

// function getProgress(shippingData) {

// }