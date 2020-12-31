# builds the files in the `final` folder from those in the `src` folder
# also copies finished userscript to clipboard for convenience
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
    "app": {
        "html": "src/app/app.html",
        "css": "src/app/app.css",
        "js": "src/app/app.js"
    }
}

import re
import pyperclip # copy to clipboard

# This function not only writes to the userscript output file
# but it also uses regex to find and replace code in the body of a js function
# the regex to find (and then replace entirely) is of this format:
"""   //INSERT python_variable_name HERE//   """
def build_userscript():
    pattern = r'//INSERT(.*)HERE//'

    with \
        open( filepaths["boilerplate"]["userscript"] ) as userscript_boilerplate, \
        open( filepaths["app"]["html"] ) as app_html, \
        open( filepaths["app"]["css"] ) as app_css, \
        open( filepaths["app"]["js"] ) as app_js \
    :
        # the editor_* variable names would normally have red underlines, but that's because I use eval to retrieve them
        # this useless string is so I can get rid of the annoying red underlines from variables not being used 
        f"""###{app_html}###{app_css}###{app_js}###"""
        
        u_b = userscript_boilerplate.read()
        matches = re.findall( pattern, u_b )
        
        for match in matches:
            # match contains everything between, but not including, the //INSERT and HERE//
            python_variable_name = match.strip()
            python_variable = eval(python_variable_name)
            actual_code = python_variable.read()
            u_b = u_b.replace(f'//INSERT {python_variable_name} HERE//', actual_code)

        return u_b


def build_website():
    with \
        open( filepaths["boilerplate"]["website"] ) as website_boilerplate, \
        open( filepaths["app"]["html"] ) as app_html, \
        open( filepaths["app"]["css"] ) as app_css, \
        open( filepaths["app"]["js"] ) as app_js \
    :
        combined_html = f"""
            { website_boilerplate.read() }
            { app_html.read() }
            <style> { app_css.read() } </style>
            <script> { app_js.read() } </script>
        """
        return combined_html


def main():
    # userscript
    with open( filepaths["output"]["userscript"], "w" ) as userscript_output:
        built_userscript = build_userscript()
        userscript_output.write( built_userscript )

        pyperclip.copy( built_userscript )
        print('Copied to clipboard!')

    # website
    with open( filepaths["output"]["website"], "w" ) as website_output:
        website_output.write( build_website() )
    
main()
