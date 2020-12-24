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
            ["Eggs"
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
