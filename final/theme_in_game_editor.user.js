// ==UserScript==
// @name         🐅 Theme In-Game Editor for Arras.io 🐅
// @namespace    http://tampermonkey.net/
// @version      1.4
// @updateURL    https://github.com/Road6943/Arras-Theme-In-Game-Editor/raw/main/final/theme_in_game_editor.user.js
// @downloadURL  https://github.com/Road6943/Arras-Theme-In-Game-Editor/raw/main/final/theme_in_game_editor.user.js
// @description  Modify the look and feel of your Arras.io game, while you're playing it!
// @author       Road#6943
// @match        *://arras.io/
// @match        *://arras.netlify.app/
// @require      https://cdn.jsdelivr.net/npm/vue@2.6.12
// @require      https://cdn.jsdelivr.net/npm/verte
// @resource     VERTE_CSS https://cdn.jsdelivr.net/npm/verte@0.0.12/dist/verte.css
// @require      https://unpkg.com/prompt-boxes@2.0.6/src/js/prompt-boxes.js
// @resource     PROMPT_BOXES_CSS https://unpkg.com/prompt-boxes@2.0.6/src/css/prompt-boxes.css
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_setClipboard
// ==/UserScript==


/* IMPORTANT NOTES: use single quotes (') for the majority of stuff as they won't interfere with
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
    
    The @keydown.stop stuff everywhere prevents typing into inputs in tiger from also affecting the game (e.g. when typing a theme name, you don't want presssing 'e' to also toggle autofire)
 -->

<div id="main-container" 
    :style="[showApp ? {
                    'backgroundColor': '#0001',
                    'height': '50%',
                    'width': '30%',
                    'overflow': 'hidden',
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
<!-- overflow:hidden is to prevent editor from extending past the transparentish background of the main container -->

    <button id="toggle-btn" class="tiger-btn" @click="showApp = !showApp">
        🐅 {{ showApp ? "Close" : "Open" }} 🐅
    </button>
    <button id="tab-btn" class="tiger-btn" @click="changeTab()" v-show="showApp">
        Change Tab
    </button>

    <div id="editor" class="tab" v-show="showApp && currentTab === 'editor' ">
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
                <tr v-for="(val,key) in config[category]" 
                    @change="console.log('Arras().' + category + '.' + key + ' is now ' + config[category][key])"
                >
                    <td>
                        {{ key }}
                    </td>

                    <!-- use the type of the value to determine the type of input selector :: typeof won't work because Vue represents numbers as strings -->
                    <td v-if="getType(val) === 'number' ">
                        <input type="number" v-model.number="config[category][key]" @keydown.stop>
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
                        <input type="number" v-model.number="config.themeColor.border" @keydown.stop
                                @change="console.log('Arras().themeColor.border is now ' + config.themeColor.border)"
                        >
                    </td>
                </tr>

                <tr v-for="[ description, colorName ] in colorDescriptions" >

                    <!-- A "dummy" column, so that the color picker doesn't flow out of the main-container -->
                    <!-- Verte-related -->
                    <td class="dummy-column">
                        {{ colorName }}
                    </td>

                    <td @keydown.stop> <!-- putting @keydown.stop in verte won't work, so this is the next best thing -->
                        <!-- Why won't menuPosition="right" work!!! --> <!-- Verte-related -->
                        <verte picker="square" model="hex" menuPosition="right"
                                v-model="config.themeColor.table[ colorNames.indexOf(colorName) ]"
                                @input=" console.log( colorName + ' is now ' + getHex(colorName) ) "
                        ></verte>
                    </td>

                    <td>
                        {{ description }}
                    </td>
                </tr>
            </table>
        </div>
    </div>

    <div id="extras" class="tab" v-show="showApp && currentTab === 'extras' ">
        <table>
            <tr>
                <td>
                    Theme Name:
                </td>
                <td>
                    <input type="text" v-model="themeDetails.name" 
                        placeholder="Name" @keydown.stop
                    >
                </td>
            </tr>
            <tr>
                <td>
                    Theme Author:
                </td>
                <td>
                    <input type="text" v-model="themeDetails.author" 
                        placeholder="Author" @keydown.stop
                    >
                </td>
            </tr>
            <tr>
                <td>
                    <textarea id="import-theme-textarea" v-model="importedTheme" 
                        placeholder="Enter theme" @keydown.stop
                    ></textarea>
                </td>
                <td>
                    <button class="tiger-btn" @click="indicateClicked('importTheme'); importTheme()">
                        {{
                            wasButtonClicked.importTheme
                            ? 'Currently Importing Theme'
                            : 'Import Theme'
                        }}
                    </button>
                </td>
            </tr>
            <tr>
                <td>
                    Best Option. Includes everything. Only works with Tiger (Theme In-Game Editor).
                </td>
                <td>
                    <button class="tiger-btn" @click="indicateClicked('exportTiger'); exportTheme('TIGER_JSON')">
                        {{ 
                            wasButtonClicked.exportTiger 
                            ?  'Copied to clipboard!'
                            : '🐅 Export Tiger Theme 🐅' 
                        }}
                    </button>
                </td>
            </tr>
            <tr>
                <td>
                    Only includes colors (and the border size). DOES NOT INCLUDE ANY OTHER VALUES SUCH AS FOR GRAPHICAL OR GUI PROPERTIES. However, it can be used without Tiger, by entering it into Arras.io's custom theme input.
                </td>
                <td>
                    <button class="tiger-btn" @click="indicateClicked('exportBackwardsCompatible'); exportTheme('backwardsCompatible')">
                        {{ 
                            wasButtonClicked.exportBackwardsCompatible
                            ? 'Copied to clipboard!'
                            : 'Export Backwards-Compatible Theme'
                        }}
                    </button>
                </td>
            </tr>
        </table>

        
        
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

/* DO NOT SET HEIGHT/WIDTH/OVERFLOW FOR MAIN CONTAINER IN HERE (CSS FILE) */
/* SET IT USING Vue's conditional :style binding */
/* When the container has a set size, your mouse inputs when over the main container,
        even if its closed, do not register with the game */
/* You need to have the container have 0% height & width when closed so the mouse can freely move around the top left corner */
#main-container .tab {
    height: 90%; /* To prevent bottom from extending past main-container */
    width: 100%;
    overflow: auto;
}

/* dummy column adds space for the color picker to fully expand into */
/* Verte-related */
td.dummy-column {
    width: 100px;
}

/* makes number/text inputs and textareas and editor buttons transparent */
#main-container input[type="number"]:not(.verte__input), 
#main-container input[type="text"]:not(.verte__input),
#main-container textarea,
.tiger-btn {
    background-color:transparent;
}
/* adds outline to text so its visible against any background color, # of repeated shadows determines strength of outline */
/* from https://stackoverflow.com/a/57465026 */
/* also making all text bold and Ubuntu, so its easier to see */
#main-container, 
#main-container input[type="number"]:not(.verte__input),
#main-container input[type="text"]:not(.verte__input),
#main-container textarea,
.tiger-btn {
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

/* forces the number in number inputs to be close to its label on the left */
#main-container input[type="number"] {
    text-align: left;
}

/* forces the radio buttons and their labels to be in 1 line right next to each other, not spread apart across multiple lines */
#main-container input[type="radio"] {
    width: auto;
}

/* force text inside toggle-btn to stay in 1 line */
#toggle-btn {
    white-space: nowrap;
}

/* make the tab changing button stay away from the open/close button */
#tab-btn {
    float: right;
}

/* make extras tab table stay within main-container */
#extras table {
    table-layout: fixed;
}
#extras textarea {
    width: 100%;
}

  `
}

// paste the vue js <script> js </script> code into herexs
function runAppJS() {

  /*
    This file contains the Vue.js code that runs the editor
*/
'use strict';

// initializing PromptBoxes (used for its toasts, which are non-blocking dialogs)
var pb = new PromptBoxes({
    attrPrefix: 'pb',
    toasts: {
        direction: 'top',       // Which direction to show the toast  'top' | 'bottom'
        max: 2,                 // The number of toasts that can be in the stack
        duration: 1000 * 3,     // The time the toast appears (in milliseconds)
        showTimerBar: true,     // Show timer bar countdown
        closeWithEscape: true,  // Allow closing with escaping
        allowClose: true,      // Whether to show a "x" to close the toast
    }
});

var app = new Vue({
    el: "#main-container",

    components: { Verte }, /* Verte-related */

    data: {
        showApp: true, // applies to the overall app (#main-container)
        currentTab: 'editor', // color pickers tab must be the initial one because otherwise the color pickers break
                                // other options can be found in the changeTab() function

        config: Arras(), // because this is linked directly to the game's Arras() obj, we don't need a watcher on config or a renderChange() function
        themeDetails: {
            name: "", // theme name
            author: "",
        },
        
        importedTheme: "",

        savedThemes: [], // is synced with GM_ storage using a watcher :: each theme's unique key is its index in this array

        // used to measure how long a user held their click over a button
        // forcing a click to hold for 5?? seconds prevents accidental theme deletion
        buttonClickStartTime: 0,

        // used to temporarily change button text after being clicked
        wasButtonClicked: {
            importTheme: false,
            exportTiger: false,
            exportBackwardsCompatible: false,
        },

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
            ["Map Border, Grid"
                , "guiblack"],
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
            ["Pentagons, Pentagon Nest Background"
                , "purple"],
            ["Crashers"
                , "pink"],
            ["Eggs, Minimap Background, Invulnerability Flash"
                , "vlgrey"],

            /* Bars under tanks/shapes/bosses/etc... */
            ["Main Health Bar, Rare Polygons"
                , "lgreen"],
            ["Shield/Regen Bar, Rare Polygons"
                , "teal"],

            /* Extras */
            ["Arena Closers, Neutral Dominators"
                , "yellow"],
            ["Rogue Palisades"
                , "dgrey"],
            ["Unused"
                , "lavender"],
            ["Unused"
                , "lgrey"],
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

        // get the hexadecimal (#abc123) value for the given colorName in the themeColor table
        getHex(colorName) {
            return this.config.themeColor.table[ this.colorNames.indexOf(colorName) ];
        },

        // move to next tab in tabs array, and then wrap back around to beginning
        changeTab() {
            var tabs = ['editor', 'extras'];

            var currentTabIndex = tabs.indexOf( this.currentTab );

            var newTabIndex = currentTabIndex + 1;
            if (newTabIndex === tabs.length) {
                newTabIndex = 0;
            }

            this.currentTab = tabs[ newTabIndex ];
        },

        // change a button to say that it was clicked for a certain amount of time (currently 3 sec.)
        indicateClicked(btnName) {
            this.wasButtonClicked[btnName] = true;
            setTimeout(() => {
                this.wasButtonClicked[btnName] = false;
            }, 1000 * 3);
        },

        // export a theme as either a 'tiger' theme (using edn format) or 'arras' theme (json format, only contains themeColor changes)
        exportTheme(type) {
            var themeToExport = {};

            // 'tiger' themes are purposefully incompatible with 'arras' themes because we don't want people who are not familiar with tiger
            // to become confused why a theme they got/found from someone else doesn't seem to work properly 
            // (as the default arras custom theme input would only change colors and border, not any of the other graphical/gui properties)
            // tiger themes look like this:
            // TIGER_JSON{/* valid JSON */}
            // this way it'll be easy in the future if we want to add in extra theme types like TIGER_BASE64/* valid base64 */ or TIGER_XML</* valid XML */>
            if (type === 'TIGER_JSON') {
                themeToExport = {
                    config: this.config,
                    themeDetails: this.themeDetails,
                };

                themeToExport = 'TIGER_JSON' + JSON.stringify(themeToExport);
            }
            else if (type === 'backwardsCompatible') {
                themeToExport = {
                    name: this.themeDetails.name,
                    author: this.themeDetails.author,
                    content: {},
                };

                for (var colorName of this.colorNames) {
                    themeToExport.content[colorName] = this.getHex(colorName);
                }

                themeToExport = JSON.stringify(themeToExport);
            }
            else {
                console.log('unsupported export theme type');
                return;
            }


            // copy to clipboard
            GM_setClipboard(themeToExport);

            console.log('Exported the following theme:');
            console.log(themeToExport);

            // use Prompt-Boxes library to notify user
            pb.success('Copied to Clipboard!');
        },

        
        // supports both types of arras themes as well as the new TIGER_JSON theme type
        // this function only converts an imported theme string into a js object mirroring this.config/the game's Arras() object
        // but importTheme calls a different function (applyTheme) that will take in a theme obj and change the game's visual properties
        importTheme() {
            var themeToImport = this.importedTheme;
            themeToImport = themeToImport.trim();

            if (themeToImport === '') {
                pb.error('Enter theme in box to the left');
                return;
            }

            // Tiger themes start with TIGER, and then _<datatype>, e.g. TIGER_JSON{valid json here}
            if (themeToImport.startsWith('TIGER')) {
                if (themeToImport.startsWith('TIGER_JSON')) {
                    // remove TIGER_JSON from start of string
                    themeToImport = themeToImport.substring( 'TIGER_JSON'.length );
                    themeToImport = JSON.parse(themeToImport);
                }
                else {
                    console.log('invalid tiger theme format')
                }
            }
            // standard arras theme, either base64 or normal JSON
            // use functions provided by CX to handle these
            else {
                themeToImport = this.parseArrasTheme(themeToImport);

                var newTheme = {
                    themeDetails: {
                        name: themeToImport.name,
                        author: themeToImport.author,
                    },
                    config: {
                        themeColor: {
                            border: themeToImport.content.border,
                            table: [],
                        },
                    },
                }

                // add colors
                for (var colorName of this.colorNames) {
                    var importedColorNameValue = themeToImport.content[colorName];
                    (newTheme.config.themeColor.table).push( importedColorNameValue );
                }

                // put the correctly formatted js object back into the themeToImport variable
                // to match the other branches of the if statement
                themeToImport = newTheme;
            }

            /* At this point, themeToImport should contain a js object mirroring the structure of this.config */
            console.log('Imported Theme has been parsed as:');
            console.log(themeToImport)

            // clear the import theme textarea
            this.importedTheme = '';

            // use the js object to change the game's colors
            this.applyTheme(themeToImport);
        },

        // takes in a themeObj, and changes the games visual properties using it
        // be careful not to simply assign this.config to a new object, 
        // because that will remove it being a reference to the actual game's Arras() object
        // similarly, you can only directly change the atomic properties + arrays (not objects)
        applyTheme(themeObj) {
            this.themeDetails = themeObj.themeDetails;
            
            for (var category in themeObj.config) {
                for (var property in themeObj.config[category]) {
                    this.config[category][property] = themeObj.config[category][property];
                }
            }

            pb.success('Theme Imported!');
        },
        
        // saves the current settings in the editor/extras as a new theme
        saveCurrentTheme() {
            var currentlySavedThemes = GM_listValues();
            var themeName = this.themeDetails.name.toLowerCase();
            
            // check to make sure that there is no saved theme with the same name && author
            for (var theme of currentlySavedThemes) {

            }

            GM_setValue()
        },
        // delete a theme previously saved
        // only allow this function to complete if user holds down click for 5 seconds
        deleteSavedTheme(indexInSavedThemes) {
            // performance.now() uses milliseconds
            elapsedClickTime = ( performance.now() - this.buttonClickStartTime ) / 1000;
            if (elapsedClickTime < 5) {
                return;
            }
        
            // remove item from savedThemes
            this.savedThemes = this.savedThemes.filter(
                theme => theme.themeDetails.id !== indexInSavedThemes
            );
        },



        // Thank you to CX for providing this:
        // converts standard arras themes (BOTH base64 and JSON) into a JSON object,
        // in the same format as the standard arras JSON themes { name: "", author: "", content: {} }
        parseArrasTheme(string){
            // Compact Base64 Theme Format
            // - stored as a regular base64 string without trailing equal signs
            // name + \0 + author + \0 + border byte + (RGB colors)*
        
            try {
            let stripped = string.replace(/\s+/g, '')
            if (stripped.length % 4 == 2)
                stripped += '=='
            else if (stripped.length % 4 == 3)
                stripped += '='
            let data = atob(stripped)
        
            let name = 'Unknown Theme', author = ''
            let index = data.indexOf('\x00')
            if (index === -1) return null
            name = data.slice(0, index) || name
            data = data.slice(index + 1)
            index = data.indexOf('\x00')
            if (index === -1) return null
            author = data.slice(0, index) || author
            data = data.slice(index + 1)
            let border = data.charCodeAt(0) / 0xff
            data = data.slice(1)
            let paletteSize = Math.floor(data.length / 3)
            if (paletteSize < 2) return null
            let colorArray = []
            for (let i = 0; i < paletteSize; i++) {
                let red = data.charCodeAt(i * 3)
                let green = data.charCodeAt(i * 3 + 1)
                let blue = data.charCodeAt(i * 3 + 2)
                let color = (red << 16) | (green << 8) | blue
                colorArray.push('#' + color.toString(16).padStart(6, '0'))
            }
            let content = {
                teal:     colorArray[0],
                lgreen:   colorArray[1],
                orange:   colorArray[2],
                yellow:   colorArray[3],
                lavender: colorArray[4],
                pink:     colorArray[5],
                vlgrey:   colorArray[6],
                lgrey:    colorArray[7],
                guiwhite: colorArray[8],
                black:    colorArray[9],
        
                blue:     colorArray[10],
                green:    colorArray[11],
                red:      colorArray[12],
                gold:     colorArray[13],
                purple:   colorArray[14],
                magenta:  colorArray[15],
                grey:     colorArray[16],
                dgrey:    colorArray[17],
                white:    colorArray[18],
                guiblack: colorArray[19],
        
                paletteSize,
                border,
            }
            return { name, author, content }
            } catch (e) {}
            try {
            let output = JSON.parse(string)
            if (typeof output !== 'object')
                return null
            let { name = 'Unknown Theme', author = '', content } = output
        
            for (let colorHex of [
                content.teal,
                content.lgreen,
                content.orange,
                content.yellow,
                content.lavender,
                content.pink,
                content.vlgrey,
                content.lgrey,
                content.guiwhite,
                content.black,
        
                content.blue,
                content.green,
                content.red,
                content.gold,
                content.purple,
                content.magenta,
                content.grey,
                content.dgrey,
                content.white,
                content.guiblack,
            ]) {
                if (!/^#[0-9a-fA-F]{6}$/.test(colorHex))
                return null
            }
        
            return {
                isJSON: true,
                name: (typeof name === 'string' && name) || 'Unknown Theme',
                author: (typeof author === 'string' && author) || '',
                content,
            }
            } catch (e) {}
        
            return null
        }
    },
});

}


