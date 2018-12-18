import "./stylesheets/main.css";

// Small helpers you might want to keep
import "./helpers/context_menu.js";
import "./helpers/external_links.js";

const { basename, dirname, sep } = require('path');
const Dat = require('dat-node');
const urljoin = require('url-join');
import { build } from "biiif";
import { remote } from "electron";
import env from "env";
import jetpack from "fs-jetpack";

const app = remote.app;
const appDir = jetpack.cwd(app.getAppPath());
const manifest = appDir.read("package.json", "json");

const osMap = {
	win32: "Windows",
	darwin: "macOS",
	linux: "Linux"
};

//const datGateway = env.dat.gateway;
let dropPath, datKey;
const appContainer = document.querySelector("#app");
const dragArea = document.querySelector('#dragarea');
const results = document.querySelector('#results');
//const form = document.querySelector('#form1');
//const url = document.querySelector('#url');
const iiifIcon = document.querySelector('#iiif-icon');
const httpGateway = document.querySelector('#http-gateway');
const httpPath = document.querySelector('#http-path');
//const datIcon = document.querySelector('#dat-icon');
//const datPath = document.querySelector('#dat-path');
//const submit = document.querySelector('#submit');

appContainer.style.display = 'block';

document.addEventListener('drop', (e) => {
	e.preventDefault();
	e.stopPropagation();
	for (let f of e.dataTransfer.files) {
		console.log('dragged: ', f.path);
		dropPath = f.path;
		//foldername = f.name;
		//dragArea.innerHTML = '<p>Click below to generate and share your IIIF!</p>';
	}
	dropped();
});

document.addEventListener('dragover', (e) => {
	e.preventDefault();
	e.stopPropagation();
});

datIcon.addEventListener('click', (e) => {
	e.preventDefault();
	setClipboard(datKey);
	return false;
});

const copyIcons = document.querySelectorAll('.copy-icon a');

copyIcons.forEach((copyIcon) => {
	copyIcon.addEventListener('click', function(e) {
		e.preventDefault();
		const input = this.parentElement.querySelector('input');
		input.focus();
		input.select();
		document.execCommand('copy');
	});
});

function isDirectory(path) {
	return (path && jetpack.exists(path) && jetpack.inspect(path).type === 'dir');
}

function setClipboard(value) {
    const tempInput = document.createElement('input');
    tempInput.style = 'position: absolute; left: -1000px; top: -1000px';
    tempInput.value = value;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
}

function dropped() {

	results.style.display = 'none';

	if (!isDirectory(dropPath)) {
		// set dropPath to the parent directory
		dropPath = dirname(dropPath);
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

	Dat(dropPath, (err, dat) => {
		
		if (err) {
			alert(err);
			return;
		} else {

			datKey = dat.key.toString('hex');

			// if a http-gateway has been set, generate the urls relative to that.
			// otherwise, use the dat key for sharing in beaker

			let baseUrl;

			if (httpGateway.value) {
				baseUrl = urljoin(httpGateway.value, datKey);
			} else {
				baseUrl = 'dat://' + datKey;
			}
			
			build(dropPath, baseUrl, true, datKey).then(() => {

				dat.archive.on('error', () => {
					alert(err);
					return;
				});

				dat.importFiles(() => {

					dat.joinNetwork();

					let url;

					if (httpGateway.value) {
						url = urljoin(urljoin(httpGateway.value, datKey), 'index.json');						
					} else {
						url = 'dat://' + datKey + '/index.json';
					}

					iiifIcon.href = url + '?manifest=' + url;
					httpPath.value = url;

					results.style.display = 'block';

					//clearInterval(workingInterval);
					dragArea.innerHTML = '<p>Done! Drag the IIIF logo into a viewer, or copy and paste the URL.</p>';
					//submit.disable = false;

				});
				
			});

		}
	});
}

/*
form.onsubmit = () => {
	
	if (!(dropPath && jetpack.exists(dropPath) && jetpack.inspect(dropPath).type === 'dir')) {
		alert('please drag a folder into the region above');
		return false;
	}

	submit.disable = true;

	return false; // don't need to actually submit it.

}
*/

/*
document.querySelector("#os").innerHTML = osMap[process.platform];
document.querySelector("#author").innerHTML = manifest.author;
document.querySelector("#env").innerHTML = env.name;
document.querySelector("#electron-version").innerHTML = process.versions.electron;
*/