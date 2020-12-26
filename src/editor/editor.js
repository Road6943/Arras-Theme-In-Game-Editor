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
        exportTheme(type) {
            var a  = JSON.stringify(
                { ...this.config, ...this.themeDetails }
            );
            console.log(a);
        },

        importTheme() {
            // use trim() and then the <?xml stuff at start to tell if its a tiger theme
        },
    },

    components: { Verte }, /* Verte-related */
});
