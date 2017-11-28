/**
 * Remove function for DOM elements to allow easier removing later
 */
Element.prototype.remove = function () {
    this.parentElement.removeChild(this);
}

function formatPackageName(packageName) {
    return packageName.replace(' ', '_');
}

/**
 * Constructs HTML div for the added package. Div will wrap buttons and package name
 * 
 * @param {string} packageName name to append to ID tags
 */
function constructPkgDiv(packageName) {
    var pkgdiv = document.createElement('div'); // make div to show data
    pkgdiv.id = packageName;
    pkgdiv.className = 'package';
    pkgdiv.innerHTML =
        '<div class="package">' +
            '<h4>' + packageName + '</h4>' +
        '</div>';
    return pkgdiv;
}

/**
 * Constructs HTML div for the package's buttons. 
 * Div will wrap buttons
 * 
 * @param {string} packageName name to append to ID tags
 */
function constructBtnDiv(packageName) {
    var btndiv = document.createElement('div'); // make div to show data
    btndiv.id = packageName + 'Buttons';
    return btndiv;
}

/**
 * Construct input button for logging to insert into package div
 * 
 * @param {string} packageName name to append to ID tags
 */
function constructLogButton(packageName) {
    var logbtn = document.createElement('input');
    logbtn.id = packageName + 'Logs';
    logbtn.setAttribute('type', "button");
    logbtn.setAttribute('value', "Show Logs");
    logbtn.addEventListener('click', () => {
        getShippingData(packageName, logAll);
    });
    return logbtn;
}

/**
 * Construct input button for linking to map to insert into package div
 * 
 * @param {string} packageName name to append to ID tags
 */
function constructMapsButton(packageName) {
    var mapbtn = document.createElement('input');
    mapbtn.id = packageName + 'Maps';
    mapbtn.setAttribute('type', "button");
    mapbtn.setAttribute('value', "Show Location");
    mapbtn.addEventListener('click', () => {
        getShippingData(packageName, (shippingData) => {
            var location = getLocation(shippingData);
            chrome.tabs.create({url: location.mapsUrl});
        });
    });
    return mapbtn;
}

/**
 * Construct input button for removing the package from storage and the DOM
 * 
 * @param {string} packageName name to append to ID tags
 */
function constructRmvButton(packageName) {
    var rmvbtn = document.createElement('input');
    rmvbtn.id = packageName + 'Remove';
    rmvbtn.setAttribute('type', "button");
    rmvbtn.setAttribute('value', "Remove Package")
    rmvbtn.addEventListener('click', () => {
        removePackage(packageName);
    });
    return rmvbtn;
}

/**
 * Construct div in which data will be shown in DOM when logged
 * 
 * @param {string} packageName name to append to ID tags
 */
function constructDataDiv(packageName) {
    var datdiv = document.createElement('div');
    datdiv.id = packageName + 'Data';
    return datdiv;
}

/**
 * Adds given element to DOM in designated div
 * 
 * @param {Element} element element to add to outdiv
 */
function addToView(element) {
    var outdiv = document.getElementById('outdiv');
    outdiv.appendChild(element);
}

function afterLoad(elemId, callback) {
    var elem = document.getElementById(elemId);
    if(elem !== undefined) {
        callback(elem);
    }
    else {
        setTimeout(afterLoad(elemId, callback), 50);
    }
}

function tryDisplayData(packageName) {
    afterLoad(packageName + 'Data', (datdiv) => {
        getShippingData(packageName, (shippingData) => {
            datdiv.innerHTML += '<p>Date: ' + parseDate(shippingData).fullString + '</p>';
            datdiv.innerHTML += '<p>Location: ' + getLocation(shippingData).fullLocation + '</p>';
            datdiv.innerHTML += '<p>Tracking Number: ' + getTrackingNumber(shippingData) + '</p>';
        });
    });
}

/**
 * Gets tracking data for the given package from UPS API
 * and creates a div to represent test items for package in popup
 * 
 * @param {string} packageName name of package added
 * @param {string} trackNum tracking number for new package
 */
function addPackage(packageName, trackNum) {
    if(packageName.includes(' ')) {
        packageName = formatPackageName(packageName);
    }
    makeListRequest(packageName, trackNum);     // UPS API call to get tracking data
    var pkgdiv = constructPkgDiv(packageName);
    var btndiv = constructBtnDiv(packageName);
    var logbtn = constructLogButton(packageName);
    var mapbtn = constructMapsButton(packageName);
    var rmvbtn = constructRmvButton(packageName);
    var datdiv = constructDataDiv(packageName);
    pkgdiv.appendChild(btndiv);
    pkgdiv.appendChild(datdiv);
    btndiv.appendChild(logbtn);
    btndiv.appendChild(mapbtn);
    btndiv.appendChild(rmvbtn);
    addToView(pkgdiv);
    tryDisplayData(packageName);
}

/**
 * Removes given package from the storage and also 
 * removes the div from the DOM
 * 
 * @param {string} packageName name of package to remove
 */
function removePackage(packageName) {
    chrome.storage.sync.remove(packageName, () => {     // remove from storage
        document.getElementById(packageName).remove(); // remove div
        console.log('Removed ' + packageName);
    });
}