// ==UserScript==
// @name         🐅 Theme In-Game Editor for Arras.io 🐅
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Modify the look and feel of your Arras.io game, while you're playing it!
// @author       You
// @match        *://arras.netlify.app/
// @match        *://arras.io/
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
var LAUNCH_BTN_ID = 'launch-btn';

(function() {
    'use strict';

    // add these css files at the start so that the launch btn can be styled and positioned above canvas from the very start
    // Verte css stuff can't go here because it screws with the Arras landing page styling
    GM_addStyle( getUserscriptSpecificCSS() ); // positions items above canvas
    GM_addStyle( getAppCSS() ); // adds styling for the majority of the Vue app's ui

    var canvas = document.getElementById(CANVAS_ID);

    // add a launch button to launch the main Vue instance, it should look identical to the toggle-btn
    // thanks to their shared .editor-btn class
    canvas.insertAdjacentHTML('beforebegin', `
      <button id="${LAUNCH_BTN_ID}" class="editor-btn">
        🐅 Open 🐅
      </button>
    `);

    document.getElementById(LAUNCH_BTN_ID).onclick = launchApp;
})();


// launch the main editor app only if user is in-game (so that the themeColor stuff is actually availiable to grab)
// also destroy the initial launch-btn at the end of this function because it is no longer needed and is replaced with toggle-btn inside the main Vue app
function launchApp() {
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

  var canvas = document.getElementById(CANVAS_ID);
  canvas.insertAdjacentHTML('beforebegin', getAppHTML());
  runAppJS();
}


// a little hack to detect if the user is currently in game or on the main landing page
function userIsCurrentlyInGame() {
  // playerNameInput is disabled in-game, but enabled on the main landing page (because thats how players enter their name)
  return document.getElementById("playerNameInput").hasAttribute("disabled");
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
    <!-- 
    This file contains the html (vue-template html) for the main editor
 -->

<div id="main-container" 
    :style="[showEditor ? {
                    'backgroundColor': '#0001',
                    'height': '50%',
                    'width': '30%',
                } : {
                    'backgroundColor': 'transparent',
                    'height': '0%',
                    'width': '0%',
                }]"
> <!-- main-container when open gets a bg color of #0001 (not a typo, it's pure black but with near-complete transparency) so that its styling like table borders appear no matter which color the map bg is -->
<!--MOUSEOVER BUG FIX:
    When the container has a set size in a css file, your mouse inputs when over the main container,
        even if its closed, do not register with the game */
/* You need to have the container have 0% height & width when closed so the mouse can freely move around the top left corner 
    This is why we use the v-bind:style for this -->

    <button id="toggle-btn" class="editor-btn"
        @click="showEditor = !showEditor"
    >
        🐅 {{ showEditor ? "Close" : "Open" }} 🐅
    </button>

    <div id="editor" v-show="showEditor">
        <div v-for="(_, category) in config" 
            v-if="category !== 'themeColor' " 
        > <!-- handle themeColor separately -->
            <table>
                <thead>
                    <th colspan="2" >
                        Edit {{ category }}
                    </th>
                </thead>

                <!-- in Vue, key,val is reversed to val,key -->
                <tr v-for="(val,key) in config[category]" @change="renderChange(category, key)">
                    <td>
                        {{ key }}
                    </td>

                    <!-- use the type of the value to determine the type of input selector :: typeof won't work because Vue represents numbers as strings -->
                    <td v-if="getType(val) === 'number' ">
                        <input type="number" v-model.number="config[category][key]">
                    </td>

                    <td v-else-if="getType(val) === 'boolean' ">
                        <label>true:</label>
                        <input type="radio" :name="key" :value="true" v-model="config[category][key]">
                        <br>
                        <label>false:</label>
                        <input type="radio" :name="key" :value="false" v-model="config[category][key]">
                    </td>

                    <td v-else>
                        <!-- This means that the type of one of the properties was not recognized by this.getType() -->
                        <strong>:( This is broken. Please ping Road#6943 in Discord to fix this. ):</strong>
                    </td>
                </tr>
            </table>
        </div>

        <div> <!-- themeColor is treated differently from other Arras() properties because color pickers need special attention (like the color descriptions, etc...) -->
            <table>
                <thead>
                    <th colspan="3" >
                        Edit themeColor
                    </th>
                </thead>

                <tr>
                    <td>
                        border
                    </td>
                    <td colspan="2" >
                        <input type="number" v-model.number="config.themeColor.border" @change="renderChange('themeColor', 'border')">
                    </td>
                </tr>

                <tr v-for="[ description, colorName ] in colorDescriptions" >

                    <!-- A "dummy" column, so that the color picker doesn't flow out of the main-container -->
                    <!-- Verte-related -->
                    <td class="dummy-column">
                        {{ colorName }}
                    </td>

                    <td>
                        <!-- Why won't menuPosition="right" work!!! --> <!-- Verte-related -->
                        <verte picker="square" model="hex" menuPosition="right"
                                v-model="config.themeColor.table[ colorNames.indexOf(colorName) ]"
                                @input="renderChange('themeColor', 'table', colorName) "
                        ></verte>
                    </td>

                    <td>
                        {{ description }}
                    </td>
                </tr>
            </table>
        </div>
    </div>
</div>

  `
}

function getAppCSS() {
  return `
    /*
    This file contains the css (non-userscript specific or library-imported) that makes the editor appear and then look presentable
*/

/* These make sure the editor doesn't take up the whole screen
** and instead stays in a nice neat tiny box */
html,body {
    height: 100%;
    width: 100%;
}

/* DO NOT SET HEIGHT/WIDTH FOR MAIN CONTAINER IN HERE (CSS FILE) */
/* SET IT USING Vue's conditional :style binding */
/* When the container has a set size, your mouse inputs when over the main container,
        even if its closed, do not register with the game */
/* You need to have the container have 0% height & width when closed so the mouse can freely move around the top left corner */

#editor {
    height: 100%;
    overflow-y: scroll;

    width: 100%;
    overflow-x: scroll;
}

/* dummy column adds space for the color picker to fully expand into */
/* Verte-related */
td.dummy-column {
    width: 100px;
}

/* makes number inputs and editor buttons transparent */
#main-container input[type="number"], .editor-btn {
    background-color:transparent;
}
/* adds outline to text so its visible against any background color, # of repeated shadows determines strength of outline */
/* from https://stackoverflow.com/a/57465026 */
/* also making all text bold and Ubuntu, so its easier to see */
#main-container, #main-container input[type="number"], .editor-btn {
    text-shadow: 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black;
    color: white;
    
    font-weight: bold;
    /* no need to import Ubuntu font, Arras's default styling will take over in-game and provide it for free */
}

/* makes the items more easy to visually separate from each other and the borders of the main-container */
#main-container table, 
#main-container th, 
#main-container td {
    border: 1px solid white;
    border-collapse: collapse;
    padding: 10px;
}

/* forces the radio buttons and their labels to be in 1 line right next to each other, not spread apart across multiple lines */
#main-container input[type="radio"] {
    width: auto;
}

  `
}

// paste the vue js <script> js </script> code into here
function runAppJS() {

  /*
    This file contains the Vue.js code that runs the editor
*/

var app = new Vue({
    el: "#main-container",

    data: {
        showEditor: true, // if this starts out false, then the color pickers break when used with v-show, and you'll have to use the (very) inefficient v-if instead, which causes a noticable momentary lag in the game /* Verte-related */
        config: Arras(),
        // colorNames is an array of the names of the colors in the array at Arras().themeColor.table, in the same order
        colorNames: ["teal","lgreen","orange","yellow","lavender","pink","vlgrey","lgrey","guiwhite","black","blue","green","red","gold","purple","magenta","grey","dgrey","white","guiblack"],
        // colorNames and colorDescriptions CANNOT be combined because the order for colorNames is a bad description order (you shouldn't put magenta far apart from blue/green/red, etc...)
        colorDescriptions: [
            /* "Utility" stuff, not sure how to describe these */
            /* Borders -- at top since the border size selector is right above the color selectors */
            ["Borders, Text Outlines, Health Bar Background"
                , "black"],
            ["Map Background"
                , "white"],
            ["Text Color"
                , "guiwhite"],
            
            /* Teams */
            ["Your tank in FFA, Left team in 2TDM, Top left team in 4TDM" 
                , "blue"],
            ["Enemy tanks in FFA, Bottom left team in 4TDM"
                , "red"],
            ["Right team in 2TDM, Top right team in 4TDM, Score Bar"
                , "green"],
            ["Bottom right team in 4TDM"
                , "magenta"],
            
            /* Shapes */
            ["Rocks, Barrels, Bar Backgrounds"
                , "grey"],
            ["Squares, Level Bar"
                , "gold"],
            ["Triangles"
                , "orange"],
            ["Pentagons"
                , "purple"],
            ["Crashers"
                , "pink"],
            ["Eggs and Minimap Background"
                , "vlgrey"],

            /* Bars under tanks/shapes/bosses/etc... */
            ["Main Health Bar"
                , "lgreen"],
            ["Shield/Regen Bar"
                , "teal"],

            /* Not sure what these do, plz help */
            ["<< YELLOW >>## Bullet Penetration Stat? ## \nNot completely sure what this does, please tell me @Road#6943 once you find out more places it is used"
                , "yellow"],
            ["<< LAVENDER >>## Pentagon Nest Background if Enabled? ## \nNot completely sure what this does, please tell me @Road#6943 once you find out more places it is used"
                , "lavender"],
            ["<< LIGHT_GREY >>## Absolutely No Idea What This Does ## \nNot completely sure what this does, please tell me @Road#6943 once you find out more places it is used"
                , "lgrey"],
            ["<< DARK_GREY >>## Smasher Upgrade Color? ## \nNot completely sure what this does, please tell me @Road#6943 once you find out more places it is used"
                , "dgrey"],
            ["<< GUI_BLACK >>## Map Border Color? But it screws up if you keep changing it? ## \nNot completely sure what this does, please tell me @Road#6943 once you find out more places it is used"
                , "guiblack"],
        ],
    },

    methods: {
        // this is needed because vue converts everything into a string once you change a value
        // so the typeof operator won't work
        getType(val) {
            val = val.toString();
            if (val === "true" || val === "false") {
                return "boolean";
            }
            if (!isNaN(val)) {
                return "number";
            }
            if (val[0] === "#") {
                return "color";
            }
        },

        // category is stuff like "graphical" or "themeColor"
        // property is the actual property that was changed, like "barChunk" or "table"
        // changedColor is something like "teal" and is only used for changes to themeColor.table
        renderChange(changedCategory, changedProperty, changedColor) {
            // only for changes to the themeColor.table array
            // border is handled like the other stuff in graphical
            if (changedCategory === "themeColor" && changedProperty === "table" && changedColor) {
                var index = this.colorNames.indexOf(changedColor);

                console.log(changedColor + ' was changed to:')
                console.log(this.config.themeColor.table[index])

                Arras().themeColor.table[index] = this.config.themeColor.table[index];
            }
            // everything else, including themeColor.border
            else {
                console.log(changedCategory + '.' + changedProperty + ' was changed to:')
                console.log(this.config[changedCategory][changedProperty])

                Arras()[changedCategory][changedProperty] = this.config[changedCategory][changedProperty]
            }
        },

        // get the hexadecimal (#abc123) value for the given colorName in the themeColor table
        getHex(colorName) {
            return this.config.themeColor.table[ this.colorNames.indexOf(colorName) ];
        },
    },

    components: { Verte }, /* Verte-related */
});

}
