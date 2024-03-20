// ==UserScript==
// @name         🐅 Theme In-Game Editor for Arras.io 🐅
// @namespace    http://tampermonkey.net/
// @version      1.8.1
// @updateURL    https://github.com/Road6943/Arras-Theme-In-Game-Editor/raw/main/final/theme_in_game_editor.user.js
// @downloadURL  https://github.com/Road6943/Arras-Theme-In-Game-Editor/raw/main/final/theme_in_game_editor.user.js
// @description  Modify the look and feel of your Arras.io game, while you're playing it!
// @author       @road6943 on Discord
// @match        *://arras.io/
// @match        *://beta.arras.io/
// @match        *://arras.netlify.app/
// @require      https://cdn.jsdelivr.net/npm/vue@2.6.12
// @require      https://cdn.jsdelivr.net/npm/verte
// @resource     VERTE_CSS https://cdn.jsdelivr.net/npm/verte@0.0.12/dist/verte.css
// @require      https://unpkg.com/prompt-boxes@2.0.6/src/js/prompt-boxes.js
// @resource     PROMPT_BOXES_CSS https://unpkg.com/prompt-boxes@2.0.6/src/css/prompt-boxes.css
// @require      https://unpkg.com/konva@4.0.0/konva.min.js
// @require      https://cdn.jsdelivr.net/npm/vue-konva@1.0.7/lib/vue-konva.min.js
// @require      https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// ==/UserScript==


/* IMPORTANT NOTES: use single quotes (') for the majority of stuff as they won't interfere with
** either HTML's " double quotes " or the js string interpolation backticks ``
** Arras() function is what allows this whole thing to work -- gives current theme values and allows you to set new ones */
var CONTAINER_ID = 'app';
var CANVAS_ID = 'canvas';
var LAUNCH_BTN_ID = 'launch-btn';

(function() {
    'use strict';

    // add these css files at the start so that the launch btn can be styled and positioned above canvas from the very start
    // Verte css stuff can't go here because it screws with the Arras landing page styling
    GM_addStyle( getUserscriptSpecificCSS() ); // positions items above canvas
    GM_addStyle( getAppCSS() ); // adds styling for the majority of the Vue app's ui
    //GM_addStyle( GM_getResourceText('PROMPT_BOXES_CSS') ); // (non-blocking dialogs)

    var canvas = document.getElementById(CANVAS_ID);

    // add a launch button to launch the main Vue instance, it should look identical to the toggle-btn
    // thanks to their shared .tiger-btn class
    canvas.insertAdjacentHTML('beforebegin', `
      <button id="${LAUNCH_BTN_ID}" class="tiger-btn">
        🐅 Open 🐅
      </button>
    `);

    document.getElementById(LAUNCH_BTN_ID).onclick = launchApp
})();


// launch the main editor app only if user is in-game (so that the themeColor stuff is actually availiable to grab)
// also destroy the initial launch-btn at the end of this function because it is no longer needed and is replaced with toggle-btn inside the main Vue app
function launchApp() {
  // Coding it like this so ppl can continue using Tiger until its discontinued
  // 22MAR2024 DISCONTINUE START ~~~
  if (typeof Arras === 'undefined') {
    // Allow users to download all their themes in the new v1 format
    // So they can use them with Arras's built-in theme editor
    if (confirm("TIGER has been discontinued. Click OK to download all your saved themes.")) {
      convertAllTigerThemeObjsToV1ThemeStrs();
    }
    return;
    // NOTHING BELOW SHOULD BE RUN ONCE TIGER DISCONTINUED
  }
  // 22MAR2024 DISCONTINUE END ~~~

  if (!userIsCurrentlyInGame()) {
    alert('You must be in-game to use this!');
    return;
  }

  // remove the launch button, so that the toggle-btn in the Vue instance can take over
  // and also to prevent users from accidently creating multiple Vue instances through multiple clicks
  document.getElementById(LAUNCH_BTN_ID).remove();

  // something in arras's default css styling screws with the top color picker
  // by making it be too wide and overflow from the color picker container
  // so this removes all existing css for just that top slider, so that only Verte's css can style it
  // the width:85% thing is something that I used before to make the slider look correct,
  // but it screwed with the functionality somewhat so I removed it
  /* Verte-related */
  GM_addStyle( '.verte-picker__slider { all: unset;        /* width: 85%; */ }' );

  // add verte css file (color picker styling)
  // Must go here (in-game only, never landing page) because it screws with the Arras landing page styling somehow
  GM_addStyle( GM_getResourceText("VERTE_CSS") );

  // add css to make the Prompt Boxes non-blocking dialog toasts work
  GM_addStyle( GM_getResourceText('PROMPT_BOXES_CSS') );

  var canvas = document.getElementById(CANVAS_ID);
  canvas.insertAdjacentHTML('beforebegin', getAppHTML());
  runAppJS();
}


// a little hack to detect if the user is currently in game or on the main landing page
function userIsCurrentlyInGame() {
  // playerNameInput is disabled in-game, but enabled on the main landing page (because thats how players enter their name)
  //return document.getElementById("playerNameInput").hasAttribute("disabled");

  // ^^ that no longer works, so heres a new hack:
  // Arras().themeColor is undefined on the landing page, but has a value in-game
  try {
    return (Arras().themeColor !== undefined);
  } 
  catch(e) {
    console.error("Couldn't run (Arras().themeColor !== undefined)")
    console.error(e.message)
    return false;
  }
}

// this is css that allows the the userscript to properly show the editor above the game canvas
// and anything else that's not used for the actual app functionality (anything that wouldn't go into a codepen of the app)
function getUserscriptSpecificCSS() {
  return `

/* These position the launch button and editor div directly above the canvas */
#${CONTAINER_ID}, #${LAUNCH_BTN_ID} {
  position: absolute;
  z-index: 2;
}
#${CANVAS_ID} {
  position: absolute;
  z-index: 1;
}

`}

// paste the vue js html code into here, but NOT the script tag stuff or the style tag stuff
function getAppHTML() {
  return `
    //INSERT app_html HERE//
  `
}

function getAppCSS() {
  return `
    //INSERT app_css HERE//
  `
}

// paste the vue js <script> js </script> code into herexs
function runAppJS() {

  //INSERT app_js HERE//
}


// PLACING THIS HERE SO IT CAN BE ACCESSED WITHOUT runAppJs RUNNING
// Copied and pasted from RoadRayge code, 
// I don't wanna modify it to fit Vue formatting of Tiger's functions.
// Only changes: 
//    - GM.getValue -> GM_getValue and un-asyncing of convertAllTigerThemeObjsToV1ThemeStrs
//    - name of storage key is now 'tigerSavedThemes'
/* =============== BEGIN V1 EXPORTING ================= */


function convertAllTigerThemeObjsToV1ThemeStrs() {
	const failedParses = [];
	const successfulParses = [];

	let tigerThemesList = GM_getValue('tigerSavedThemes'); // RR has GM. but Tiger has GM_
	tigerThemesList = JSON.parse(tigerThemesList || '[]');

	for (const tigerThemeObj of tigerThemesList) {
		let convertedThemeStr = null;
		
		try {
			convertedThemeStr = convertTigerObjToV1Str(tigerThemeObj);
		} 
		catch {
			// if non ascii characters present it may mess up conversion
			// so use encodeURI and try 1 more time
			try {
				let { name, author } = tigerThemeObj.themeDetails;
				tigerThemeObj.themeDetails = {
					name: encodeURI(name),
					author: encodeURI(author),
				};
				convertedThemeStr = convertTigerObjToV1Str(tigerThemeObj);
			}
			catch {
				failedParses.push(tigerThemeObj);
			}
		}
		
		successfulParses.push({
			Name: tigerThemeObj.themeDetails.name,
			Author: tigerThemeObj.themeDetails.author,
			Theme: convertedThemeStr,
		});
	}

	// handle failed parses
	for (const fail of failedParses) {
		console.error(
		'FAILED to parse!:\n ' 
		+ JSON.stringify(fail)
		);
	}

	// make csv and download it
	const csvStr = Papa.unparse(successfulParses);
	downloadToFile("themes.csv", csvStr);
}

function convertTigerObjToV1Str(tigerThemeObj) {
	let newThemeObj = tigerThemeObjToArrasThemeObj(tigerThemeObj);
	let newThemeStr = arrasThemeObjToStringInFormatV1(newThemeObj);
	return newThemeStr;
}

// Modified from CX at https://codepen.io/road-to-100k/pen/WNWoPoY
// original function: parsers.tiger
// modified to not parse TIGER_JSON string and instead just take obj Tiger uses directly
function tigerThemeObjToArrasThemeObj(tigerThemeObj) {
	let {
	themeDetails: { name, author },
	config: {
		graphical: { darkBorders, neon },
		themeColor: { table, border },
	},
	} = tigerThemeObj;

	table = table.map(colorHex => typeof colorHex !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(colorHex) ? 0 : parseInt(colorHex.slice(1), 16))

	table[4] = table[0]
	table[7] = table[16]

	let blend = Math.min(1, Math.max(0, border))

	return {
	name: (name || '').trim().slice(0, 40) || 'Unknown Theme',
	author: (author || '').trim().slice(0, 40),
	table,
	specialTable: [table[neon ? 18 : 9]],
	blend: darkBorders ? 1 : blend,
	neon,
	}
};

// lifted straight from CX - https://codepen.io/road-to-100k/pen/WNWoPoY
// original function named stringifiers.v1
function arrasThemeObjToStringInFormatV1(theme) {
	let { name, author, table, specialTable, blend, neon } = theme
	
	let string = '\x6a\xba\xda\xb3\xf0'
	string += String.fromCharCode(1)
	string += String.fromCharCode(name.length) + name
	string += String.fromCharCode(author.length) + author
	string += String.fromCharCode(table.length)
	for (let color of table) string += String.fromCharCode(color >> 16, (color >> 8) & 0xff, color & 0xff)
	string += String.fromCharCode(specialTable.length)
	for (let color of specialTable) string += String.fromCharCode(color >> 16, (color >> 8) & 0xff, color & 0xff)
	string += String.fromCharCode(blend >= 1 ? 255 : blend < 0 ? 0 : Math.floor(blend * 0x100))
	string += String.fromCharCode(neon ? 1 : 0)
	return btoa(string).replace(/=+/, '')
};

// https://stackoverflow.com/questions/3665115/how-to-create-a-file-in-memory-for-user-to-download-but-not-through-server
function downloadToFile(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

/* ============== END V1 EXPORTING =============== */
