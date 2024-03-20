# TIGER will shut down on March 22, 2024
Arras will get a built-in theme editor on that date. To migrate all your themes to the format used by the new theme editor, please upgrade your TIGER to the latest version by clicking this [link](https://github.com/Road6943/Arras-Theme-In-Game-Editor/raw/main/final/theme_in_game_editor.user.js)

Once you have done so, please navigate to the 2nd tab and click the button labelled `Download All Themes In V1 Format` 

You can also convert individual themes with [this tool](https://codepen.io/cx88/pen/rNbVGmQ) made by CX!

Thank you for using TIGER all these years. It has been wonderful seeing the themes you have all created, and I hope to see many more incredible themes with the launch of the new built-in theme editor!

\
\
\
\
\
\
\
\
\
\
\
\
---



# IMPORTANT: TIGER will no longer be updated. Please switch to [RoadRayge](https://github.com/Road6943/RoadRayge)!
 All of your TIGER themes (starting with TIGER_JSON) can be imported directly into RoadRayge.

RoadRayge has a sleeker UI and additional features not available in TIGER, such as Theme Filtering/Searching, Cursor Customization, Swapping Colors Within A Theme, and more! RoadRayge will also not lag your game when opening or importing a theme.

### How To Migrate Your Saved Themes To RoadRayge
1. First, upgrade your TIGER to the latest version by clicking [here](https://github.com/Road6943/Arras-Theme-In-Game-Editor/raw/main/final/theme_in_game_editor.user.js).
2. The upgrade adds a button to export all your saved themes. You can find this button underneath the other theme export buttons. Click it and all your saved themes will be saved to your clipboard (It will start with TIGER_LIST).
3. Now that all the themes are copied to your clipboard, paste it into a text file or Discord or somewhere to keep them safe.
4. Turn TIGER off via your Tampermonkey settings.
5. Install RoadRayge using the instructions [here](https://github.com/Road6943/RoadRayge). If you already have RoadRayge installed, then upgrade it to the latest version by clicking [here](https://github.com/Road6943/RoadRayge/raw/main/RoadRayge.user.js).
6. Make sure TIGER is turned off. TIGER and RoadRayge cannot both be active at the same time.
7. Reload Arras.io and enter a game.
8. In the top right corner, you will see a gear. Click it to open RoadRayge.
9. Scroll down until you get to the `Misc.` section. You will see an `Import Theme` texbox.
10. Enter your exported themes (starting with TIGER_LIST) into the `Import Theme` textbot, and your themes should be transfered over!

\
\
\
\
\
\
\
\
\
\
\
\
---

# Arras.io Theme In-Game Editor
A userscript that can be used in-game (while playing Arras.io) in order to modify the game's graphical properties and theme colors in real time.

🐅 The name can be abbreviated to TIGER (***T***heme ***I***n-***G***ame ***E***dito***r***) 🐅

---

**How to Install:**
1. Install the Tampermonkey extension. [Click me](https://www.tampermonkey.net/?ext=dhdg) to view links to help you install Tampermonkey for your browser of choice.
2. Once you have installed Tampermonkey, click [this link right here](https://github.com/Road6943/Arras-Theme-In-Game-Editor/raw/main/final/theme_in_game_editor.user.js), and you should see a userscript-installation tab pop up. Click "Install" to do so.
3. Navigate to [arras.io](https://arras.io/), and you should see a small button on the top left. If so, then congrats! You've successfully installed the script!
4. Enjoy!

---

**How to Upgrade to a Newer Version:**
1. Go to [this link right here](https://github.com/Road6943/Arras-Theme-In-Game-Editor/raw/main/final/theme_in_game_editor.user.js), and you should see a Tampermonkey tab appear. 
2. Click "Update" or "Reinstall" to upgrade to a newer version.
3. Congrats! You're done! You can now return to playing [arras.io](https://arras.io/)!

---

**Possible plans for the future:**
+ maybe change svg stuff to Konva in case it doesn't play well with arras's css
+ remove Konva from boilerplate files if it turns out I don't need it after all
+ maybe remove the button text changing stuff if it turns out to be not necessary
+ make top bar of #app (#app:not(.tab)) slightly darker than rest of #app to set it apart
+ add more default theme options maybe (ask around on discord)
+ add a video explanation of tiger to demonstrate all its features and make the readme page prettier
+ add a dedicated installation page to link people to (maybe add to greasyfork as well??)
+ Add buttons for Random Theme, Random Everything (all settings), Rainbow Theme (colors change over time through color spectrum -- maybe add slider to control this), Gradient changer?? (allow users to pick colors and certain timespan and have the colors change between them over that timespan)
+ upgrade version number, and then share with the beta testers before 2021
+ get feedback after a week, and make changes accordingly (don't forget to increment version number)
+ add a dedicated "edit theme" button for each saved theme -- so that users can make changes to a specific theme instead of (currently) having to make a copy of the theme, edit the copy, and then delete the original 
+ add share to /r/arrasThemes button, to provide a centralized theme sharing hub (and renovate that sub a bit, like maybe change the rules for that subreddit to allow text posts and other changes)

---

**Developer Instructions:**
1. Only edit files in the src directory, not final
2. Once you are done making changes, run the python script in the utilities folder
3. This script will automatically combine the src files together and paste the combined contents into the .user.js file(the finished userscript) and the .html file (the website version for easier ui development)
4. The script will also copy the userscript to your clipboard (make sure you do `pip install pyperclip` if it doesn't work)
5. Paste the copied userscript into your userscript manager (Tampermonkey, etc...) and play arras to see the result!
