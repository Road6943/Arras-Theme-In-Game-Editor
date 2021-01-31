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
