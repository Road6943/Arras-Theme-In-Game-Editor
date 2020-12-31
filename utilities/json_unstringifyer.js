// This is used for getting new sample test data because the Arras() function might have changed (like when gui was added)
// This allows you to copy & paste the console output from running:   JSON.stringify(Arras())   in Arras's console
// and then turn it back into a normal js object, which can be copy/pasted elsewhere (like index.html)
// Run with command:   node utility/json_unstringifyer.js    (change filepaths/names if needed)

console.log( JSON.parse(

    `{"graphical":{"screenshotMode":false,"borderChunk":6,"barChunk":5,"compensationScale":1.114,"lowGraphics":false,"alphaAnimations":true,"inversedRender":true,"miterStars":true,"miter":false,"fontSizeOffset":0,"shieldbars":false,"renderGrid":true,"darkBorders":false,"neon":false,"coloredNest":false},"gui":{"enabled":true,"alcoveSize":200,"spacing":20},"themeColor":{"table":["#7adbbc","#b9e87e","#e7896d","#fdf380","#b58efd","#ef99c3","#e8ebf7","#aa9f9e","#ffffff","#484848","#3ca4cb","#8abc3f","#e03e41","#efc74b","#8d6adf","#cc669c","#a7a7af","#726f6f","#dbdbdb","#000000"],"border":0.6509803921568628}}`
    
))
