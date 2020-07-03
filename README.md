# Tabli-Fox - A Firefox Tab Manager

Tabli is a simple, powerful tab manager for ~~Google Chrome~~ Firefox. It's a crappy fork, but it works for me. 

![Screenshot of Tabli Popup](https://raw.githubusercontent.com/antonycourtney/tabli/master/screenshots/tabli-screenshot.png "Tabli screenshot")

The popup can be used to quickly scroll through all open windows and tabs and switch to or close any open window or tab with a single click.  Tabli also supports saving and restoring sets of tabs.

Traditionally for Chrome, it should do the trick for you.

## Installation

To use it, simply download the .xpi file and drag and drop it into your addons page in Firefox (Ctrl+Shift+A or Menu>Addons or about:addons in the url bar)

Formatting might be a bit messed up when not in full screen. Might fix that someday...

Pull requests are welcome

## Rebuilding the addon

If you want to rebuild the extension (e.g., if it fails) do the following: 

```git clone https://github.com/deltabravozulu/tabli-fox.git```

```cd tabli-fox```

Grab your Mozilla Developer API info from [here](https://addons.mozilla.org/en-US/developers/addon/api/key/) (make a new account if you don't have one).

Edit the file api_conf.txt and include the JWT Issuer (API Key) and JWT Secret (API Secret) from the Mozilla dev page above. 

Save that file and then run ./xpisigner.sh to sign it using those keys
