# GreenChoice meter records export script
---

## Intro
This user script helps you export the meter records from your personal GreenChoice file. In the chapters below I will tell
you how to install, configure, use (Features) and collaborate to the project.

## Install
### Prerequisites
First we need an user script manager installed in your prefered browser. How you install user scripts depends on which browser you use. Typically, you will need to install a browser extension. Once user scripts are enabled in your browser, it should be as simple as clicking the URL to install or update your script.

#### Firefox and related
* [Greasemonkey](https://addons.mozilla.org/firefox/addon/greasemonkey/)
* [Scriptish](https://addons.mozilla.org/firefox/addon/scriptish/)

#### Google Chrome, Chromium, and related
* [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)

#### Opera (version 15 and later)
* [Tampermonkey](https://addons.opera.com/extensions/details/tampermonkey-beta/)
* [Violentmonkey](https://addons.opera.com/extensions/details/violent-monkey/)

### Allow local userscripts in Tampermonkey

#### How can I allow Tampermonkey access to local file URIs?

Local file access can be given to an extension at the extension management page. Go to the settings page (chrome://settings/) and choose extensions at the left.

Now search for the Tampermonkey entry and enable the **"Allow access to file URIs"** checkbox.

![Tutorial](http://tampermonkey.net/images/animated/allow_access_to_file_urls.gif)

### Install user script from local source
[Clone](https://dev.nullpointer.nl/energy/gc-export) or [download](https://dev.nullpointer.nl/energy/gc-export/branches) the files to your computer. The *release/v\#.\#* branch provide a stable version of the script. When you want bleeding edge features and lots of bugs, you can choose to use the *develop* branch.
The easiest way to install the user script in your preferred browser is to drag and drop the **gc-export.user.js** file in the browser. Due to its extension, the user script manager will be triggered and asks you whether you want to (re)install the user script.

### Install user script from repository
Click the following link to directly install the GC-Export user script in your browser:

* [Development version](https://dev.nullpointer.nl/energy/gc-export/raw/develop/gc-export.user.js)
