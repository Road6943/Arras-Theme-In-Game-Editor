# builds the files in the `final` folder from those in the `src` folder
# run with   python3 ./utilities/build_userscript_and_website.py 

# these should be based on the main overarching folder, NOT utilities
filepaths = {
    "output": {
        "website": "final/website.html",
        "userscript": "final/theme_in_game_editor.user.js"
    },
    "boilerplate": {
        "website": "src/boilerplate/website_boilerplate.html",
        "userscript": "src/boilerplate/userscript_boilerplate.js"
    },
    "editor": {
        "html": "src/editor/editor.html",
        "css": "src/editor/editor.css",
        "js": "src/editor/editor.js"
    }
}

def build_website():
    with \
        open( filepaths["boilerplate"]["website"] ) as website_boilerplate, \
        open( filepaths["editor"]["html"] ) as editor_html, \
        open( filepaths["editor"]["css"] ) as editor_css, \
        open( filepaths["editor"]["js"] ) as editor_js \
    :
        combined_html = f"""
            { website_boilerplate.read() }
            { editor_html.read() }
            <style> { editor_css.read() } </style>
            <script> { editor_js.read() } </script>
        """
        return combined_html

with open( filepaths["output"]["website"], "w" ) as website_output:
    website_output.write( build_website() )
