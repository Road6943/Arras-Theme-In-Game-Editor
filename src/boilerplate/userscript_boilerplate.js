// ==UserScript==
// @name         🐅 Theme In-Game Editor for Arras.io 🐅
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Modify the look and feel of your Arras.io game, while you're playing it!
// @author       You
// @match        https://arras.io
// @require      https://cdn.jsdelivr.net/npm/vue@2.6.12
// @require      https://cdn.jsdelivr.net/npm/verte
// @resource     VERTE_CSS https://cdn.jsdelivr.net/npm/verte@0.0.12/dist/verte.css
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==


/*
**
*** TODO:
++ record to only use toggle button, or only hotkey
---- current setup allows new instances of editor to be created when hotkey is pressed again
++ maybe get better color picker (maybe Spectrum??, 
    https://vue-accessible-color-picker.netlify.app/, OR https://caohenghu.github.io/vue-colorpicker/) 
***
**
*/


/* IMPORTANT NOTE: use single quotes (') for the majority of stuff as they won't interfere with
** either HTML's " double quotes " or the js string interpolation backticks ``
** Arras() function is what allows this whole thing to work -- gives current theme values and allows you to set new ones */
var CONTAINER_ID = 'main-container';
var CANVAS_ID = 'canvas';
var LAUNCH_KEY = '|';

(function() {
    'use strict';

    window.addEventListener('load', () => {
        //main(); // delete this and uncomment the below stuff later

        window.addEventListener('keydown', (event) => {
            if (event.key !== LAUNCH_KEY || !userIsCurrentlyInGame()) {
                return;
            }

            main();
        });

    });
})();


function main() {
  // something in arras's default css styling screws with the top color picker
  // by making it be too wide and overflow from the color picker container
  // so this removes all existing css for just that top slider, so that only Verte's css can style it
  // the width:85% thing is something that I used before to make the slider look correct,
  // but it screwed with the functionality somewhat so I removed it
  /* Verte-related */
  GM_addStyle( '.verte-picker__slider { all: unset;        /* width: 85%; */ }' );
  // add verte css file (color picker styling)
  GM_addStyle( GM_getResourceText("VERTE_CSS") );

  var canvas = document.querySelector('#' + CANVAS_ID);
  canvas.insertAdjacentHTML('beforebegin', '<style>' + getUserscriptSpecificCSS() + '</style>');
  canvas.insertAdjacentHTML('beforebegin', getAppHTMLAndCSS());
  runAppJS();
}


// launch the main editor app only if user is in-game (so that the themeColor stuff is actually availiable to grab)
// also destroy the initial launch-btn at the end of this function because it is no longer needed and is replaced with toggle-btn inside the main Vue app
// function launchApp() {
//   if (!userIsCurrentlyInGame()) {
//     alert('You must be in-game to use this!');
//     return;
//   }
//   // something in arras's default css styling screws with the top color picker
//   // by making it be too wide and overflow from the color picker container
//   // so this removes all existing css for just that top slider, so that only Verte's css can style it
//   // the width:85% thing is something that I used before to make the slider look correct,
//   // but it screwed with the functionality somewhat so I removed it
//   /* Verte-related */
//   GM_addStyle( '.verte-picker__slider { all: unset;        /* width: 85%; */ }' );
//   // add verte css file (color picker styling)
//   GM_addStyle( GM_getResourceText("VERTE_CSS") );

//   var canvas = document.querySelector('#' + CANVAS_ID);
//   canvas.insertAdjacentHTML('beforebegin', '<style>' + getUserscriptSpecificCSS() + '</style>');
//   canvas.insertAdjacentHTML('beforebegin', getAppHTMLAndCSS());
//   runAppJS();
// }


// a little hack to detect if the user is currently in game or on the main landing page
function userIsCurrentlyInGame() {
  // playerNameInput is disabled in-game, but enabled on the main landing page (because thats how players enter their name)
  return document.querySelector("#playerNameInput").hasAttribute("disabled");
}

// this is css that allows the the userscript to properly show the editor above the game canvas
// and anything else that's not used for the actual app functionality (anything that wouldn't go into a codepen of the app)
function getUserscriptSpecificCSS() {
  return `

/* These position the editor div directly above the canvas */
#${CONTAINER_ID} {
  position: absolute;
  z-index: 2;
}
#${CANVAS_ID} {
  position: absolute;
  z-index: 1;
}

`}


// paste the vue js html & <style>css>/style> code into here, but NOT the script tag stuff
function getAppHTMLAndCSS() {
    return `

    //INSERT editor_html HERE//
    
    <style>
      //INSERT editor_css HERE//
    </style>
`}

// paste the vue js <script> js </script> code into here
function runAppJS() {

  //INSERT editor_js HERE//
}
