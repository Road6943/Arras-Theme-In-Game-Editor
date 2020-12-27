/*
    This file contains the Vue.js code that runs the editor
*/

var app = new Vue({
    el: "#main-container",

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
        // 'tiger' themes are purposefully incompatible with 'arras' themes because we don't want people who are not familiar with tiger
        // to become confused why a theme they got/found from someone else doesn't seem to work properly 
        // (as the default arras custom theme input would only change colors and border, not any of the other graphical/gui properties)
        // tiger themes look like this:
        // TIGER_JSON{/* valid JSON */}
        // this way it'll be easy in the future if we want to add in extra theme types like TIGER_BASE64/* valid base64 */ or TIGER_XML</* valid XML */>
        exportTheme(type) {
            var themeAsStr = JSON.stringify(
                { 
                    config: this.config,
                    themeDetails: this.themeDetails,
                }
            );
            console.log(themeAsStr);
        },

        
        importTheme() {
            // Tiger themes start with TIGER, and then _<datatype>, e.g. TIGER_JSON{valid json here}
            if (this.importedTheme.startsWith('TIGER')) {
                if (this.importedTheme.startsWith('TIGER_JSON')) {

                }
            }
            // standard arras theme, either base64 or normal JSON
            // use functions provided by CX to handle these
            else {

            }
        },


        
        // saves the current settings in the editor/extras as a new theme
        saveCurrentTheme() {
            var currentlySavedThemes = GM_listValues();
            var themeName = this.themeDetails.name.toLowerCase();
            
            // check to make sure that there is no saved theme with the same name && author
            for (var theme of currentlySavedThemes)

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
                theme => theme.themeDetails.id !== idToDelete
            );
        },
    },

    components: { Verte }, /* Verte-related */
});
