import "./stylesheets/main.css";

// Small helpers you might want to keep
import "./helpers/context_menu.js";
import "./helpers/external_links.js";

// ----------------------------------------------------------------------------
// Everything below is just to show you how it works. You can delete all of it.
// ----------------------------------------------------------------------------

import { remote } from "electron";
import jetpack from "fs-jetpack";
import { build } from "biiif";
import env from "env";

const app = remote.app;
const appDir = jetpack.cwd(app.getAppPath());

// Holy crap! This is browser window with HTML and stuff, but I can read
// files from disk like it's node.js! Welcome to Electron world :)
const manifest = appDir.read("package.json", "json");

const osMap = {
	win32: "Windows",
	darwin: "macOS",
	linux: "Linux"
};

let directoryPath;

document.querySelector("#app").style.display = "block";

document.addEventListener('drop', function (e) {
	e.preventDefault();
	e.stopPropagation();

	for (let f of e.dataTransfer.files) {
		console.log('dragged: ', f.path);
		directoryPath = f.path;
		document.querySelector('#dragarea').innerHTML = f.name;
	}
});

document.addEventListener('dragover', function (e) {
	e.preventDefault();
	e.stopPropagation();
});

document.querySelector('form').onsubmit = function() {

    const url = document.querySelector('#url').value;
	
	if (!url) {
		alert('please enter a url');
		return false;
	} else if (!directoryPath) {
		alert('please drag a folder into the region above');
		return false;
	}
	
	build(directoryPath, url);

	alert('Done!');

	return false; // don't need to actually submit it.
}

/*
document.querySelector("#greet").innerHTML = greet();
document.querySelector("#os").innerHTML = osMap[process.platform];
document.querySelector("#author").innerHTML = manifest.author;
document.querySelector("#env").innerHTML = env.name;
document.querySelector("#electron-version").innerHTML =
  process.versions.electron;
*/