(function ($) {
  'use strict';
  $.extend( true, window, {
    tabMan: {
      renderPopup: renderPopup
    }
  });

  var bgw = chrome.extension.getBackgroundPage();

  function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  function refreshPopup() {
    window.location.href="popup.html";
  }

  function initManageDialog() {
    var subject = $("#subject"),
        allFields = $( [] ).add( subject );
    $("#manage-dialog").dialog({
          autoOpen: false,
          height: 200,
          width: 280,
          modal: true,
          buttons: {
            "Create": function() {
              var bValid = true;
              allFields.removeClass( "ui-state-error" );

              if ( bValid ) {
                var tabWindow = $( this ).data( "tabWindow" );
                console.log( "manage window:", tabWindow );
                var subjField = $( "#subject" );
                var windowTitle = subjField.val();
                bgw.tabMan.manageWindow( tabWindow, { title: windowTitle } );
                $( this ).dialog( "close" );
                refreshPopup();
              }
            },
            Cancel: function() {
              $( this ).dialog( "close" );
            }
          },
          close: function() {
            allFields.val( "" ).removeClass( "ui-state-error" );
          }
        }); 
  }

  function makeElem( tag, options ) {
    var item = document.createElement( tag );
    if( options ) {
      var txt = options.text;
      if( txt )
        item.appendChild( document.createTextNode(txt) );
      var classes = options.classes;
      if( classes ) {
        for ( var i = 0; i < classes.length; i++ ) {
          item.classList.add( classes[ i ] );
        }
      }
      var parent = options.parent;
      if( parent ) {
        parent.appendChild( item );
      }
      var attrs = options.attributes;
      if( attrs ) {
        for( var attr in attrs ) {
          if( !attrs.hasOwnProperty( attr ) )
            continue;
          item.setAttribute( attr, attrs[attr] );
        }
      }
    }

    return item;
  };
  
  function mkChangeClassHandler( element, addClassName, removeClassName ) {
    return function() {
      if ( addClassName )
        element.classList.add( addClassName );
      if ( removeClassName )
        element.classList.remove( removeClassName );
    };
  }

  function renderTabWindow( tabWindow, current, windowPanelId ) {
    var managed = tabWindow.isManaged();
    var windowTitle = tabWindow.getTitle();
    var tabs = tabWindow.getTabItems();
    var windowId = tabWindow.chromeWindow && tabWindow.chromeWindow.id;

    // console.log( "renderTabWindow: title: ", windowTitle, ", tabWindow: ", tabWindow );
    // console.log( "tabs:", tabs );
    var headerId = current ? 'currentWindow' : ( managed ? 'managedWindows' : 'unmanagedWindows' );
    var windowItem = makeElem( 'div', { classes: [ "windowInfo", "expandable-panel" ], 
      attributes: { id: windowPanelId } } );

    function makeTabClickHandler( windowId, tabId ) {
      function handler() {
        console.log( "clicked on tab for tab id ", tabId );
        if( tabWindow.open ) {
          chrome.tabs.update( tabId, { active: true } );
          chrome.windows.update( windowId, { focused: true } );
        } else {
          bgw.tabMan.restoreBookmarkWindow( tabWindow );
        }        
      };
      return handler;
    }

    function makeTabCloseHandler( tabElement, windowId, tabId ) {
      function handler() {
        chrome.tabs.remove( tabId );
        tabListItem.removeChild( tabElement );
      }
      return handler;
    }

    function makeTabRemoveBookmarkHandler( tab ) {
      function handler() {
        console.log( "about to remove bookmark for tab: ", tab );
        chrome.bookmarks.remove( tab.bookmark.id, function () {
          console.log( "succesfully removed bookmark" );
          tabWindow.reloadBookmarkFolder();
          refreshPopup();
        } );
      }
      return handler;
    }

    function makeTabAddBookmarkHandler( tab ) {
      function handler() {
        var tabMark = { parentId: tabWindow.bookmarkFolder.id, title: tab.title, url: tab.url };
        chrome.bookmarks.create( tabMark, function( tabNode ) { 
          console.log( "Successfully added bookmark for tab ',", tab.title, "'" );
          tabWindow.reloadBookmarkFolder();
          refreshPopup();
        } );
      }
      return handler;
    }

    function windowCloseHandler() {
      chrome.windows.remove( windowId, function() {
        tabWindow.open = false;
        if ( !managed ) {
          winHeader.parentNode.removeChild( windowItem );
        }
        if ( !current ) // don't refresh popup if this window is going away
          refreshPopup();
      });
    }

    var windowHeader = makeElem( 'div', 
      { classes: [ "nowrap", "singlerow", "oneRowContainer", "windowHeader" ] } );

    var openClass = tabWindow.open ? "open" : "closed";

    // We want to use a lighter, icon-based checkmark for the checked state, so this
    // is a little involved...

    var windowCheckItem;
    if( managed ) {
      windowCheckItem =  makeElem( 'button',
        { classes: [ "header-button", "window-managed" ],
          parent: windowHeader,
          attributes: { title: "Stop managing this window"}
        } );  
      windowCheckItem.onclick = function() {
        // managed --> unmanaged:
        // TODO: confirmation dialog
        bgw.tabMan.unmanageWindow( tabWindow );
        refreshPopup();                
      };
    } else {
      windowCheckItem = makeElem( 'input',
        { classes: [ "header-button", "show-on-hover" ], parent: windowHeader,
          attributes: { type: "checkbox", title: "Bookmark this window (and all its tabs)" }
        } );
      windowHeader.addEventListener( "mouseover", mkChangeClassHandler( windowCheckItem, 'hover', 'show-on-hover' ) );
      windowHeader.addEventListener( "mouseout", mkChangeClassHandler( windowCheckItem, 'show-on-hover', 'hover' ) );
      windowCheckItem.onchange = function() {
        console.log( "toggle manage for '", windowTitle, "'" );
        var checked = windowCheckItem.checked;
        console.log( "state:", checked );
        if( checked ) {
          // unmanaged --> managed:
          var dlg = $("#manage-dialog" );
          var subjField = $( "#subject" );
          subjField.val( windowTitle );
          window.setTimeout( function() {
            subjField[0].setSelectionRange( 0, windowTitle.length );
          }, 0 );
          dlg.data( "tabWindow", tabWindow );
          dlg.dialog( "open" );
        }
      }
    }

    var expandButtonClass = tabWindow.open ? "window-contract" : "window-expand";
    var windowExpandButton = makeElem( 'button',
        { classes: [ "header-button", "expander", expandButtonClass ],
          parent: windowHeader,
          attributes: { title: "Expand window contents"}
        } ); 
    windowExpandButton.onclick = function() {
      console.log( "Got click on expander" );
      var obj = $("#" + windowPanelId + " .expandable-panel-content");
      if (windowExpandButton.classList.contains( "window-expand" ) ) {
        obj.animate({'margin-top':0}, 500 );
        windowExpandButton.classList.remove( "window-expand" );
        windowExpandButton.classList.add( "window-contract" );
      } else {
        var ht = parseInt( contentHeight );
        obj.animate({'margin-top':"-" + (ht + 30) + "px" }, 500 );
        windowExpandButton.classList.remove( "window-contract" );        
        windowExpandButton.classList.add( "window-expand" );
      }
    };

    var windowTitleItem = makeElem( 'span', 
      { text: windowTitle, 
        classes: [ "windowList", "nowrap", "singlerow", "windowTitle", openClass ],
        parent: windowHeader 
      });
    windowTitleItem.onclick = function() {
      console.log( "clicked on window '", windowTitle, "'" );
      if( tabWindow.open ) {
        chrome.windows.update( windowId, { focused: true } );
      } else {
        // need to open it!
        bgw.tabMan.restoreBookmarkWindow( tabWindow );
      }
    };

    if ( tabWindow.open ) {
      if ( managed ) {
        var windowRevertButton = makeElem( 'button',
          { classes: [ "header-button", "revert-spacer", "revert-window", "show-on-hover" ],
            parent: windowHeader,
            attributes: { title: "Revert to bookmarked tabs" }
          });
        windowHeader.addEventListener( "mouseover", mkChangeClassHandler( windowRevertButton, 'hover', 'show-on-hover' ) );
        windowHeader.addEventListener( "mouseout", mkChangeClassHandler( windowRevertButton, 'show-on-hover', 'hover' ) );
        windowRevertButton.onclick = function () {
          bgw.tabMan.revertWindow( tabWindow, refreshPopup );
        }
      } else {
        var revertSpacer = makeElem( 'div',
          { classes: [ "header-button", "revert-spacer" ],
            parent: windowHeader
          } );
      }

      var windowCloseButton = makeElem( 'button',
        { classes: [ "header-button", "close", "show-on-hover" ],
          parent: windowHeader,
          attributes: { title: "Close Window" }
        });

      // roll our own hover events because we don't want to bother with cons'ing element ids.
      windowHeader.addEventListener( "mouseover", mkChangeClassHandler( windowCloseButton, 'hover', 'show-on-hover' ) );
      windowHeader.addEventListener( "mouseout", mkChangeClassHandler( windowCloseButton, 'show-on-hover', 'hover' ) );

      windowCloseButton.onclick = windowCloseHandler;
    }

    var expandableContentClass = tabWindow.open ? "expandable-panel-content-open" : "expandable-panel-content-closed";
    var tabListItem = makeElem('div', { classes: [ "tablist", "expandable-panel-content", expandableContentClass ] } );
    for( var i = 0; i < tabs.length; i++ ) {
      var tab = tabs[ i ];
      var tabOpenClass = openClass;

      var tabItem = makeElem( 'div', 
        { classes: [ "singlerow", "nowrap", "oneRowContainer", "tabinfo" ] } );

      if ( managed ) {
        if( !tab.open )
          tabOpenClass = "closed";

        var tabCheckItem;

        if (tab.bookmarked ) {
          tabCheckItem = makeElem( 'button',
            { classes: [ "header-button", "tab-managed" ],
              parent: tabItem,
              attributes: { title: "Remove bookmark for this tab"}
            } );
          tabCheckItem.onclick = makeTabRemoveBookmarkHandler( tab );
        } else {
          tabCheckItem = makeElem( 'input',
            { classes: [ "header-button", "show-on-hover" ], parent: tabItem,
              attributes: { type: "checkbox", title: "Bookmark this tab" }
            } );
          tabItem.addEventListener( "mouseover", mkChangeClassHandler( tabCheckItem, 'hover', 'show-on-hover' ) );
          tabItem.addEventListener( "mouseout", mkChangeClassHandler( tabCheckItem, 'show-on-hover', 'hover' ) );
          tabCheckItem.onchange = makeTabAddBookmarkHandler( tab );
        }
      } else {
        var tabCheckSpacer = makeElem( 'div',
          { classes: [ "header-button" ],
            parent: tabItem
          } );

      }

      var tabFavIcon = makeElem('img', { classes: [ "favicon" ], parent: tabItem } );
      if ( tab.favIconUrl )
        tabFavIcon.setAttribute( 'src', tab.favIconUrl );

      var tabTitleClasses = [ "windowList", "nowrap", "singlerow", tabOpenClass ];
      if( tab.active ) {
        tabTitleClasses.push( "activeTab" );
      }
      var titleItem = makeElem( 'span', 
        { text: tab.title,
          classes: tabTitleClasses,
          parent: tabItem
        });
      titleItem.onclick = makeTabClickHandler( windowId, tab.id );

      if ( tabWindow.open ) {
        var closeButton = makeElem( 'button',
          { classes: [ "header-button", "close", "show-on-hover" ],
            parent: tabItem,
            attributes: { title: "Close Tab" }
          });

        // roll our onw hover events because we don't want to bother with cons'ing element ids.
        tabItem.addEventListener( "mouseover", mkChangeClassHandler( closeButton, 'hover', 'show-on-hover' ) );
        tabItem.addEventListener( "mouseout", mkChangeClassHandler( closeButton, 'show-on-hover', 'hover' ) );

        closeButton.onclick = makeTabCloseHandler( tabItem, windowId, tab.id );
      }

      tabListItem.appendChild( tabItem );
    }
    windowItem.appendChild( windowHeader ); 
    windowItem.appendChild( tabListItem );

    var winHeader= document.getElementById( headerId );
    insertAfter( winHeader, windowItem );

    var panelContent = $("#" + windowPanelId + " .expandable-panel-content");
    var contentHeight = panelContent.css('height');
    if ( !window.open ) {
      panelContent.css('margin-top',"-" + contentHeight );
    }
  }


  function windowCmpFn( tabWindowA, tabWindowB ) {
    // open windows first:
    if ( tabWindowA.open != tabWindowB.open ) {
      if ( tabWindowA.open )
        return 1;
      else
        return -1;
    }
    var tA = tabWindowA.getTitle();
    var tB = tabWindowB.getTitle();
    return tB.localeCompare( tA );
  }

  function renderPopup() {
    initManageDialog();
    console.log( "background page:", bgw );
    chrome.bookmarks.getTree( function ( tree ) {
      console.log( "Bookmarks tree: ", tree );
    });

    function syncAndRender( windowList ) {
      chrome.windows.getCurrent( null, function ( currentWindow ) {
        console.log( "in windows.getCurrent:" );
        console.log( "Chrome Windows: ", windowList );
        var tabWindows = logWrap( bgw.tabMan.syncWindowList )( windowList );
        tabWindows.sort( windowCmpFn );
        console.log( "tabWindows:", tabWindows );
        for ( var i = 0; i < tabWindows.length; i++ ) {
          var tabWindow = tabWindows[ i ];
          var id = "tabWindow" + i;
          if( tabWindow ) {
            var isCurrent = tabWindow.open && tabWindow.chromeWindow.id == currentWindow.id;
            logWrap( function() { renderTabWindow( tabWindow, isCurrent, id ); } )();
          }
        }
      } );
    }

    // wrapper to log exceptions
    function logWrap( f ) {
      function wf() {
        try {
          var ret = f.apply( this, arguments );
        } catch( e ) {
          console.error( "logWrap: caught exception invoking function: " );
          console.error( e.stack );
          throw e;
        }
        return ret;
      }
      return wf;
    }

    chrome.windows.getAll( {populate: true}, logWrap( syncAndRender ) );
  }
})(jQuery);

$(document).bind('ready', tabMan.renderPopup );