import "./stylesheets/main.css";

// Small helpers you might want to keep
import "./helpers/context_menu.js";
import "./helpers/external_links.js";

import { remote } from "electron";
import jetpack from "fs-jetpack";
import { build } from "biiif";
import env from "env";
import { fips } from "crypto";
const Dat = require('dat-node');
const urljoin = require('url-join');

const app = remote.app;
const appDir = jetpack.cwd(app.getAppPath());
const manifest = appDir.read("package.json", "json");

const osMap = {
	win32: "Windows",
	darwin: "macOS",
	linux: "Linux"
};

const datgateway = env.dat.gateway;
let directorypath, datkey, daturl;
const appContainer = document.querySelector("#app");
const dragArea = document.querySelector('#dragarea');
const results = document.querySelector('#results');
//const form = document.querySelector('#form1');
//const url = document.querySelector('#url');
const gatewaylink = document.querySelector('#dat-link-input');
const dragiiificon = document.querySelector('#drag-iiif');
const datkeyicon = document.querySelector('#dat-key');
//const submit = document.querySelector('#submit');

appContainer.style.display = "block";

document.addEventListener('drop', function (e) {
	e.preventDefault();
	e.stopPropagation();
	for (let f of e.dataTransfer.files) {
		console.log('dragged: ', f.path);
		directorypath = f.path;
		//foldername = f.name;
		//dragArea.innerHTML = '<p>Click below to generate and share your IIIF!</p>';
	}
	directoryDropped();
});

document.addEventListener('dragover', function (e) {
	e.preventDefault();
	e.stopPropagation();
});

datkeyicon.addEventListener('click', function(e) {
	e.preventDefault();
	setClipboard(datkey);
	return false;
});

function directoryDropped() {

	results.style.display = 'none';

	if (!(directorypath && jetpack.exists(directorypath) && jetpack.inspect(directorypath).type === 'dir')) {
		alert('please drag a folder into the region above');
		return false;
	}

	// working...
	// const workingInterval = window.setInterval(() => {
	// 	if (dragArea.innerHTML.length > 3) {
	// 		dragArea.innerHTML = "";
	// 	} else {
	// 		dragArea.innerHTML += ".";
	// 	}
	// }, 100);

	dragArea.innerHTML = '<p>Working</p>';

	Dat(directorypath, function(err, dat) {
		
		if (err) {
			alert(err);
			return;
		}

		datkey = dat.key.toString('hex');
		daturl = urljoin(datgateway, datkey);

		build(directorypath, daturl, true, datkey).then(() => {

			dat.importFiles();
			dat.joinNetwork();

			const manifestUrl = urljoin(daturl, 'index.json');
			dragiiificon.href = manifestUrl + '?manifest=' + manifestUrl;
			gatewaylink.value = manifestUrl;
			datkeyicon.href = 'dat://' + datkey;
			
			results.style.display = 'block';

			//clearInterval(workingInterval);
			dragArea.innerHTML = '<p>Done! Drag the IIIF logo into a viewer, or copy and paste the URL.</p>';
			//submit.disable = false;
		});
	  
	});
}

function setClipboard(value) {
    var tempInput = document.createElement("input");
    tempInput.style = "position: absolute; left: -1000px; top: -1000px";
    tempInput.value = value;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
}

/*
form.onsubmit = () => {
	
	// if (!url.value) {
	// 	alert('please enter a url');
	// 	return false;
	if (!(directorypath && jetpack.exists(directorypath) && jetpack.inspect(directorypath).type === 'dir')) {
		alert('please drag a folder into the region above');
		return false;
	}

	// working...
	// const workingInterval = window.setInterval(() => {
	// 	if (dragArea.innerHTML.length > 3) {
	// 		dragArea.innerHTML = "";
	// 	} else {
	// 		dragArea.innerHTML += ".";
	// 	}
	// }, 100);

	dragArea.innerHTML = '<p>Working</p>';

	submit.disable = true;

	Dat(directorypath, function(err, dat) {
		
		if (err) {
			alert(err);
			return;
		}

		const datkey = dat.key.toString('hex');
		const daturl = urljoin(datgateway, datkey);

		build(directorypath, daturl, true, datkey).then(() => {

			dat.importFiles();
			dat.joinNetwork();

			const manifestUrl = urljoin(daturl, 'index.json');
			dragiiif.style.display = 'block';
			dragiiif.href = manifestUrl + '?manifest=' + manifestUrl;
			gatewaylink.value = manifestUrl;
			gatewaylink.style.display = 'block';
			
			//clearInterval(workingInterval);
			dragArea.innerHTML = '<p>Done! Drag the IIIF logo into a viewer, or copy and paste the URL.</p>';
			submit.disable = false;
		});
	  
	});

	return false; // don't need to actually submit it.

}
*/

/*
document.querySelector("#os").innerHTML = osMap[process.platform];
document.querySelector("#author").innerHTML = manifest.author;
document.querySelector("#env").innerHTML = env.name;
document.querySelector("#electron-version").innerHTML = process.versions.electron;
*/