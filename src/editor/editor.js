/*
    This file contains the Vue.js code that runs the editor
*/
'use strict';

var app = new Vue({
    el: "#main-container",

    components: { Verte }, /* Verte-related */

    data: {
        showApp: true, // applies to the overall app (#main-container)
        currentTab: 'editor', // color pickers tab must be the initial one because otherwise the color pickers break
                                // other options can be ['editor', 'extras']

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
                    themeToExport[colorName] = this.getHex(colorName);
                }

                themeToExport = JSON.stringify(themeToExport);
            }
            else {
                console.log('unsupported export theme type');
                return;
            }

            console.log('Exported the following theme:');
            console.log(themeToExport);
        },

        
        // supports both types of arras themes as well as the new TIGER_JSON theme type
        // ONLY IMPORTS THEME, DOES NOT CHANGE GAME COLORS
        // this function only converts an imported theme string into a js object mirroring this.config/the game's Arras() object
        // a different function (applyTheme) will take in a theme obj and change the game's visual properties
        importTheme() {
            var themeToImport = this.importedTheme;
            themeToImport = themeToImport.trim();

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

            // return the theme js object
            return themeToImport;
        },

        // takes in a themeObj, and changes the games visual properties using it
        applyTheme(themeObj) {
            
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
