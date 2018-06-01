import "./stylesheets/main.css";

// Small helpers you might want to keep
import "./helpers/context_menu.js";
import "./helpers/external_links.js";

import { remote } from "electron";
import jetpack from "fs-jetpack";
import { build } from "biiif";
import env from "env";
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

const datgateway = 'http://174.138.105.19:3000';
let directorypath;
let appContainer = document.querySelector("#app");
let dragArea = document.querySelector('#dragarea');
let form = document.querySelector('#form1');
//let url = document.querySelector('#url');
let datlinkinput = document.querySelector('#dat-link-input');
let dragiiif = document.querySelector('#drag-iiif');
let submit = document.querySelector('#submit');
let foldername;

appContainer.style.display = "block";
datlinkinput.style.display = "none";

document.addEventListener('drop', function (e) {
	e.preventDefault();
	e.stopPropagation();

	for (let f of e.dataTransfer.files) {
		console.log('dragged: ', f.path);
		directorypath = f.path;
		foldername = f.name;
		dragArea.innerHTML = '<p>Click below to generate and share your IIIF!</p>';
	}
});

document.addEventListener('dragover', function (e) {
	e.preventDefault();
	e.stopPropagation();
});

form.onsubmit = function() {
	
	// if (!url.value) {
	// 	alert('please enter a url');
	// 	return false;
	if (!(directorypath && jetpack.exists(directorypath) && jetpack.inspect(directorypath).type === 'dir')) {
		alert('please drag a folder into the region above');
		return false;
	}

	submit.disable = true;

	Dat(directorypath, function(err, dat) {
		
		if (err) {
			alert(err);
			return;
		}

		const datkey = dat.key.toString('hex');
		const datlink = urljoin(datgateway, datkey);

		build(directorypath, datlink, datkey);
	  
		dat.importFiles();
		dat.joinNetwork();

		const manifestUrl = urljoin(datlink, 'index.json');
		dragiiif.style.display = 'block';
		dragiiif.href = manifestUrl + '?manifest=' + manifestUrl;
		datlinkinput.value = manifestUrl;
		datlinkinput.style.display = 'block';
		dragArea.innerHTML = '<p>Done! Drag the IIIF logo into a viewer, or copy and paste the URL.</p>';
	});

	submit.disable = false;

	//alert('Done!');

	return false; // don't need to actually submit it.
}

/*
document.querySelector("#os").innerHTML = osMap[process.platform];
document.querySelector("#author").innerHTML = manifest.author;
document.querySelector("#env").innerHTML = env.name;
document.querySelector("#electron-version").innerHTML = process.versions.electron;
*/