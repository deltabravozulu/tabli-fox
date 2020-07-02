# TODO

X Modal confirmation dialog before reverting a saved window

-   Need a way to close a tab from the keyboard (DEL? Shift-Del? Ctrl-Del? )

-   Need a button on top to link to help (usage manual)

========= After 0.8.2:

-   Some other key sequence (Ctrl-/ maybe? ctrl-o ?) should toggle expand on closed, saved windows

-   Try to cache FavIcons of windows when opened and use them for closed tabs

-   Try to set overflow:'hidden' on body when displaying modal to prevent scrolling

-   Carol feature req: Status bar showing numbers of Open Windows and Tabs (and maybe Saved winbows?)

-   KM req: Audible indicator! See "audible" in Tabs API

-   Don't show close button for closed windows

-   Need a tabWindow test for what happens when we duplicate a tab with the same URL

----- done:

X Need a basic quick reference Help page with keyboard shortcuts

X Need an Introduction / Quick Start page

X PgDn (Ctrl-Down, Ctrl-Up) should move to next/prev window

X Arrow keys should move a whole window when window not expanded

X Check out what's going on with Medium.com favicon -- seems to be smaller than 16x16; make sure we had to fixed size. Tabs from Medium appear to be misaligned

X More layout jank: We seem to have different sizes for the checkbox input and the checkbox icon for bookmarked tabs. Not enough paddingRight on checkbox input -- runs in to favIcon

X - Add event handler for check box for bookmarking / un-bookmarking a tab

X - Need to adjust scroll position when using arrow keys

X - Should be able to open a saved window from keyboard

X Modal dialog for saving a tab window

X Fix tab window sort order: Focused Window, Open Windows (alphabetical by title), Saved (closed) Windows

Performance:
X - Using react Perf tools we seem to be spending considerable time in HeaderButton. Let's get a consistent, reproducible performance test
to verify this by taking a snapshot of winStore

X - restoring a closed saved tab not working

X PERFORMANCE: It turns out that TabWindow.get title() is getting called quite a lot...why?? Is it during sorting during render? That would make sense. Can we somehow calculate this field lazily so that we won't have to recalc it?

X review actions.js with tabWindowStore.js. Make sure every action has the right corresponding entry points in TabWindowStore, with correct change notifications.

X Mark all the handleChromeXXX methods in TabWindowStore as deprecated (or just remove)

X Try to determine if the calls to TabWindow.getTabItems are expensive and figure out if there's a way we can lazily cache them. Don't want to be doing sort() operations on mouse motion.

X Finish moving to inline styles -- delete most / all of tabman.css !

X Instead of single listener reg, using port/disconnected technique to GC popup view listener:
http://stackoverflow.com/questions/15798516/is-there-an-event-for-when-a-chrome-extension-popup-is-closed

X BUG: Revert causes window to temporarily disappear from window list

=======

-   Re-run manual test of saving windows (changes around focused handling)

-   Issue with selected tab and keyboard navigation: No longer starts with tab in "Current Window" or able to select Current Window tabs via up / down keys

-   Need to transfer focus to Search... box on click in popout

-   Need a way to cancel search (essential for popout)

-   window.onRemoved or tabs.onRemoved handler behaving incorrectly on saved tabs -- re-opening a saved window after tabs are closed only shown New Tab.

-   Something going very wrong with focus indication -- seeing multiple tabs indicated as having focus.
    (...clue: I def see this happening when opening links from TweetDeck.)
    hypothesis: updateTabItem() getting called to set active to true, without calling setActiveTab().
    Potential easy fix: call setActiveTab() if tab to be updated is active.

-   Should change TabItem.url into a property accessor

-   on windowFocus change should set selectedWindow to focused window and selected tab to active tab

-   Should change scroll behavior to only adjust scroll position if body not 100% visible

-   FavIcons now missing in revert modal.

-   Getting error with bad argument when performing revert

-   Improve tab sorting: Use tab index

-   When opening windows from popout, need to use size of last normal window
    X grab width and height in TabWindow
    X pass last focused window to actions.activateTab and actions.openWindow

    -   If there is no current window for pulling width and height, should use open window 0

-   Searching for "fac" in popout seems to skip Facebook saved window when using arrow keys to navigate...

X FavIcon / title alignment looks off in Revert Dialog

X Keep track of popup window so we can close it on restart

X Reset search field on Enter or ESC

-   Format source using 'standard'
    https://www.npmjs.com/package/standard

X Right now we transfer selection to the active window and active tab when we get a window focus change event. For consistency we should also transfer when we get an active tab change event.

X BUG: New Tab doesn't seem to change title / URL. Repro: click on new tab on tab bar, type any URL.
Conjecture: Need to handle 'tab replaced' event

X(?) Getting exceptions in revert modal:

```
  RevertModal.js:32 Uncaught TypeError: Cannot read property 'favIconUrl' of null

  2ReactCompositeComponent.js:559 Uncaught TypeError: Cannot read property '_currentElement' of null
```

X Need to clear search field after opening a window or tab. Current cleared on <Enter> key, but not on mouse click.

-   If we switch tabs when a search is active, the window / tab may not be displayed. We'll record that we've scrolled to that window and tab when in fact we haven't. We should probably force an updateScrollPos() in SelectablePopup when the selection is cleared.

-   Text in search box input no longer starts at top of open windows. (? artifact of starting from current open window?)

-   -   Exception when re-starting Chrome because no current window. Test this.

-   -   Reverting when we have non-open saved tabs fails in RevertModal.renderItem() because tabItem.openState is null. Need to check for tabItem.open.

-   Opening link from email or external app results in scrolling to wrong window.

-   -   BUG: When opening a PDF, window has no title. Revert to URL if possible.
        ( Not reproducible -- have opened some PDFs w/o issue)

-   Refactor: CloseButton should probably be its own component, but need to think carefully about how to deal with <container>:hover

-   If a Saved Tab is opened twice (duplicate) and one of those tabs is closed, it will stick around in the grayed out / closed state

X Checkbox on closed, saved tabs should be gray

======
TODO before 0.9beta:

X Need to persist whether popout is open or closed and use it on a restart.

-   Add release notes inline

-   Add command to manifest to open popout

-   Need to avoid race condition and not persist anything for close event during reload.
    What we have is something like:
    action a = a -> ((St -> St) -> ()) -> ()

What we need is:
Promise a
ST s a = s -> (s,a)
PST s a = Promise (ST s a)
APST a = PST AppState a
In pst:
PACT a b = a -> APST b
someAction a b :: a -> APST b

We should be able compose these serially / sequentially:
ser :: Pact a b -> Pact b c -> Pact a c

Let's not bother with a return type in the state transformer:
Promise a
ST s = s -> s
PST s = Promise (ST s)
APST = PST AppState
In pst:
PACT a = a -> APST
someAction a b :: a -> APST

X Need to deal better with not having a current window (esp. on startup). Should
(Seems to be better about using sensible default value for sizes now...)

-   pick 0th window (if there is one)
-   use "sensible" window width / height if no current window available
    Easy repro: Reload in popout window. (Note: If we have a previously saved "current" window,
    use that instead of updating current)

=======
\*\*\* Critical issue, 2May16:

( Update, 3May16: Conjecture is that this was due to laziness of Immutable.Seq, now replaced by Immutable.List ). We'll see if issue recurs.

Seeing regular performance degradation correlated with an exception with a bunch of calls to Iterator.next() on the stack.

Last call we can _see_ in the stack is:
actions.js:28, which is in actions.syncChromeWindows:
cb((state) => state.syncWindowList(windowList));

This is called from SafeCallbackApply, and other stack trace indicates that this is called from renderPopup() in renderCommon.js.

It's worth noting that those lines calls syncStore.setCurrentWindow(currentChromeWindow) and
then do a storeRef.setValue(nextStore); with the result....

Hmmmm.....could we be getting an infinite cascade here?
Or...could we be getting bit by the laziness of Seq?

========
Attempt to debug leakTest with babel-node and node-inspector:

\*\*\* THIS DID NOT WORK:

1. Start node process with --debug:

# Note that for ordinary node, we'd do:

# node --debug-brk=8010 test.js

\$ babel-node --debug-brk=8010 --presets es2015,react ./test/leakTest.js

2. Start node-inspector:
   \$ node-inspector --web-host 0.0.0.0

3. visit URL from step 2:
   http://127.0.0.1:8080/?ws=127.0.0.1:8080&port=8010

# What worked (kind of) was running node directly via tests/leakTestWrap.

Revisiting Tabli, 8/13/17

Attempting to implement URL de-dup'ing, I've again hit a case where we want to compose multiple independent actions that may update app state in response to a single external event.
(This isn't the first time -- the entire sequence of actions in main() in bgHelper had
this issue at some point.)

I will probably kludge this for now because the surgery involved would be just too costly.
But my inclination about the right solution is something along the lines of a state monad
and / or Redux Saga.

What we want: - Composition of state updates: If we have two independents actions that update the global
application state, we need to ensure that both state updates are applied (i.e. that
neither update gets lost). - Asynchronous state handling: We will often need to update state after an asynchronous
action has been performed. If the update depends on the current state (which it often
will), we want to ensure that the state is read _after_ the asynchronous action has
been performed.

How things work now:

From OneRef, we get our hands on an explicit State Updater:

```
  refUpdater: (ref: Ref<A>) => (uf: (A) => A) => A
```

We pass this as an extra argument to all of our actions, for example:

```
  <input ... onChange={() => actions.updateText(item, text, stateRefUpdater)}
```

and then in `actions`, each action explicitly calls stateRefUpdater, like so:

```
export function updateText(item, text, updater) {
  const updatedItem = item.set('text',text)
  updater((state) => state.addItem(updatedItem))
}
```

What I think we want instead is something like a State Monad (SM) for OneRef.
Like a monad, actions would no longer perform the actions directly but instead
return a data structure or thunk that denotes a description of the interleaved
state updates and asynchronous actions to perform.
At the top level of a React event callback we would have a run() method to
execute an action.

So we'd get something like this:

```
  <input ... onChange={() => runAction(actions.updateText(item, text)) }
```

where `runAction` is passed down prop that is `oneref.run` partially applied to
the state ref.

Instead of returning `void`, each action would now have to return a
`state -> state` update function.

Questions:

-   Should wrapped type be: state => state, or (state => (state,a)) ?
-   How does 'async' (or possibly generator functions) fit here?
    It seems somewhat tempting to have an action be an async function that
    returns a State Transformer (state -> state function), but how will
    that work with sequences of async calls in the body of the async
    functions?
    Can actions, which return State Transformers, directly call other actions?
    How do we ensure that we are always operating on the latest state
    after an async call to either a platform API or another action?

---

9/27/17 -- rethinking merging of tabs in the presence of recently closed tabs:

If we support presenting recently closed tabs, we now have all four states:

(open,saved) -- A tab open to a URL that is saved.
(open,!saved) -- A tab open to a URL that is not saved.
(!open, saved) -- A bookmark'ed URL in current window that is not currently open.
(!open,!saved) -- A recently closed tab, for an un-saved URL.

Only those in the (!open,!saved) state are candidates to be removed from the tab list.

Tabli currently "merges" open and saved tab items, but the current model is a
bit broken when the same saved tab is open more than once in a window and is
then subsequently closed -- this will result in duplicate entries for the
same URL in the (!open,saved) state.

The right definition of the merge process:

-   We start with:
    -   open tabs (from Chrome Window)
    -   saved tabs (from Bookmark)
-   We can determine two sets:
    -   the set of currently open URLs
    -   the set of saved (bookmarked) URLs.
-   Start with all open tabs, and the set of saved URLs for the window.
    Partition into: (open,saved) tabs and (open,!saved)
    These all go in to result set.
-   Now determine:
    -   The set of saved URLs that are not currently open:
        savedNotOpenURLs := SavedURLs - OpenURLs
        These go in result set.
-   Finally:
    ClosedUnsavedURLs := RecentlyClosedURLs - SavedURLs  
     These go in result set.
    ======
    Now let's consider the set of events we might have to deal with for a TabWindow, and
-   Close a tab (URL)
-   Open a tab at a specific URL
-   Un-save a saved tab
-   Save an unsaved tab

Merging tabs is a little tricky because we must:

-   Take all open tabs and join with the saved URLs to determine which tabs are saved.
-   For closed tabs, ensure that we join with saved URLs

...and, although we don't support it today, we should really consider adding
support for events on the bookmark folders.

---

And then we need to think about ordering of TabItems:

Let's keep it simple:
open tabs before !open tabs
then: open tabs in tab order
!open tabs:
saved before !saved
saved tabs in bookmark order
!saved tabs in LRU order

---

Reflections from awkward implementation challenges, Oct. 5, 2017:

Trying to add suppot for "recently closed" tabs to Tabli raised all sorts of surprisingly thorny implementation questions. Notably:
Where do we put the "last known" favIconUrl? Or last access time?  
Should this live per-saved-tab, per-window, or global (browser level) keyed by URL?

Much of this leads me to want to store state globally, keyed by URL.
But thinking more about that makes me want to just kill the hierarchy and make a tag-based bookmark system.

Also: Let's just build a different extension: Bunnytab.

Bunnytab should be an extension that takes over the New Tab and offers unified search across: - Open Tabs - Bookmarks - History - External bookmark sources (like Bunny) - Google

---

Notes / TODO porting to emotion.js:

TabItem:
X Need to recover top/bottom border on hover
X Audible icon no longer appearing
X Current does prod behavior for:
X color of checkbox? (gray)
X hover color of title text of closed tabs? (gray)
X Checkbox only on hover on TabItem

TODO:
X Might be nice to apply a lighten filter on black and white FavIcons for closed tabs
(github, which is mostly black)
X Move edit pencil next to title!
X Always show close x on modal dialog window header

---

=======
Notes, attempted port to Immer (on `immer` branch):

TabWindow currently uses `._id` as lazily evaluated cache.
How will we deal with this in Immer??
Hmmm, we could just make id an explicit property and calculate
eagerly instead of lazily.

Unnngh. It turns out a big "Caveat" of immer is that it doesn't work with ES6 classes
at all. :-(
See: https://github.com/mweststrate/immer/issues/202

---

3/10/19:

The time has come. A port to TypeScript and React Hooks, and the new ts-hooks based version
of OneRef....

4/13/19:

TS port mostly complete, but I think I've spotted a mistake:

I've been using

```typescript
type XProps = XBaseProps & oneref.StateRefProps<TabManagerState>;
```

in lots of places. This requires us to pass an entire appState down the component hierarchy.
The problem with this is that it won't work well with memoization at all; the appState will change
frequently, even though little should change as we move down the state tree. We'd like to be
able to memoize TabItemUI and FilterWindowUI, which requires that those only take individual
windows and tabs as props.

It looks like the only reason I'm passing around `appState` is because several actions take
`appState` as an argument. These should instead be passed just a stateRef, and we should
provide a synchronous `read` or `get` (or perhaps `mutableGet` or `getLatest`) to read
the current appState from the stateRef, but **we should only do this inside an action, never in a component.**
So `mutableGet` seems like a good name...

4/18/19:

Odds and ends left from TypeScript port:

[ ] Add back throttling of state updates. Old code:

```javascript
const viewStateListener = () => {
    const nextStore = storeRef.getValue();
    this.setState(this.storeAsState(nextStore));
};

const throttledListener = _.debounce(viewStateListener, 200);

var listenerId = storeRef.addViewListener(throttledListener);
```

---

11May19:

There still seem to be some issues with scrolling / focus in TypeScript port: In the prod version,
selecting a Chrome window will force the popout window to scroll to the top.

Looks like this is because all of the logic for scrolledToWindowId and updateScrollPos in
SelectablePopup.tsx hasn't been ported over yet....

12May19:

Have now restored the scroll update work.

Next focus: Let's figure out adding React.memo.
It would be really if we could create a standalone render-test that we could run as a non-extension
to be able to measure perf using React DevTools...

To start, let's try and profile with React DevTools:

From Tabli dir:

$ cd build
$ python -m SimpleHTTPServer

then open http://localhost:8000/renderTest.html

Current issue: FavIcons don't load, fails with
"Not allowed to load local resource: chrome://favicon/..."

---

23Nov19:

Time for a makeover.
At the very least, must move to react-beautiful-dnd.
Let's also try Streamline Icons for consistency and visual polish
Additionally, may want to try Chakra UI for popup menu, and possibly Chakra UI's
Accordion for window summaries.

UI / org improvements I'd like to add:

-   Allow at least one additional level of hierarchy: sections. Not clear if we should allow nested sections...certainly not obvious how to render them
-   Would really like to support multi-select, but this raises a ton of complications. Should actions like closing of tabs apply to multiple selections? How does multi-select work with keyboard navigation / keyboard selection?
-   Long-standing issue: Would like to be able to distinguish 'anchor' tabs (those to be re-opened on a revert operation) from associated bookmarks.

To start with, I'm going to try and slightly tweak the rendering of tab items to make them a better fit for use with react-beautiful-dnd. For now this means setting border-radius so that every tab is clearly an independent entity rather than just a row that takes 100% of the rectangular cell where it rendered in a window summary.

Let's try to swap the visual indicators for keyboard selection and hover...

But before that, let me try and upgrade packages and install react-beautiful-dnd...

OK, got react-beautiful-dnd working, and have done a bunch of other cosmetic layout tweaks.
A few more to do:

-   Clean up searchbar layout and sizing
-   Check out PR on improved glyph for tab close
-   Try to use better glyph for expand / contract button
-   Try to use react-spring for smooth animation of open/close
-   Expand / contract glyph for whole window list sections?

1Dec:

Interesting perf issue / observation:

If I get rid of the optimization in FilteredTabWindowUI that skips rendering of tabItems for
closed (non-expanded) window summaries, the time to render the initial view goes waaaay up,
from about 1.3 seconds to 6+ seconds. To me this suggests something hella slow about the
perf of TabItemUI.
Worth noting, though, that I discovered this while experimenting while trying to animate
the expand / collapse of windows. Maybe this is better if I get rid of the animation work?

Other notes on attempt to introduce react-spring:

-   The expansion was getting animated even when just moving a window from "Other Open Windows" to
    "Current Window" section.
-   Close window summary transition didn't appear to animate; not sure why. Originally figured this
    was due to the above optimization which removes all tabs from the render tree for closed windows,
    but seemed to still see this even when that optimization was disabled.
-   Looking at how Accordions were implemented in chakra UI was illuminating; provides a [collapse](https://chakra-ui.com/collapse) component, built on top of [react-animate-height](https://github.com/Stanko/react-animate-height)

Looking at perf again:

Interesting experiment:

-   Slow things down by disabling the non-expanded tab item culling optimization as mentioned above.
-   Replace FavIcon with emptyFavIcon to avoid drowning in FavIcon loads in Perf tab
-   We seem to spend about 1 sec loading PNGs for button icons.
    Specifically:
    Interface-77.png
    Files-26.png
    Status-9.png
    Edition-30.png
    chevron-double-mix-1-01.png

This seems to happen concurrently with other stuff, but still seems not great.
Can we just replace with SVGs?

OK, done -- all images above now replaced with SVGs.

TODO:

-   Try to refactor ExpanderButton to use HeaderButtonSVG

With all image buttons replaced with SVGs, and with current hack showing the perf issue with
the popup, let's once again try to debug the perf issue with initial render when opening
the popup.

Currently we are reliably seeing it take 2.3 seconds for a full render (wall clock, reported on console).

And that is with NO FavIcons.

Questions:

-   What's the baseline, i.e. doing NO rendering?
-   Does non-popup renderTest.html take similar time?
-   What if we make popup or renderTest use the same mock store?

renderTest time: 1.1 seconds

A reload on renderTest takes more like 600 ms. Still seems like a lot!

Time to render simple span on renderTest page: 5 to 50 ms.

Similar result on popup: 5 to 50 ms.

Let's try some branch and bound and try to figure out where the time is going....

If we eliminate the TabList (so just header and footer), rendering takes around 172ms for the popup.
Around 100ms for renderTest.

At some point because of issues with FavIcon caching, I deferred rendering to the onLoad handler.
What if we did it sooner?
( That really made no difference in render time for renderTest; sticking with onLoad...)

What if we try concurrent mode?

Concurrent mode definitely allowed the initial render call to return more quickly, but isn't
any faster at actual rendering the popup.

Tried SSR, but it really doesn't work well in browser; emotion didn't work, and lots of
warnings from react-beautiful-dnd re: useLayoutEffect. There's an 'isomorphic' variant of
this for server-side use in the implementation, but it uses (window === undefined) to detect
server-side, and that's just not true in browser. And emotion didn't give use styling info...

Stumbled upon https://benfrain.com/we-need-a-better-button-its-too-slow-and-wont-behave/ which
may explain some of what I am seeing. May be worth trying to use div's instead of buttons
since I style it all myself anyway...

Let's establish a baseline, using:

-   a prod build
-   renderTest served via localhost (Python SimpleHTTPServer),
-   Lighthouse
-   Incognito window
    and renderTest.html:

According to Lighthouse:
First Contentful Paint (FCP): 1.2s
First Meaningful Paint (FMP): 1.2s

Hmmm. Replacing button with div did relatively little for Lighthouse scores on renderTest (1.2s down to
1s) but the popup _seems_ significantly faster to open, so I'm leaving it...

7Dec19

OK, time to cut and ship.
TODO:
X change cursor on header buttons

-   better screenshots for Chrome Web Store
-   ? dnd on closed windows?
-   dnd bug with active tab indicator not updating! Happens when moving currently active tab in window.
    X need to move audibleIcon to SVG!

? Try pruning unused TS exports (particularly in, say, cssStyles) using something like ts-prune.

## @#$!@#$ YIKES!

Just saw a case where moving an open, saved tab appeared to result in an attempted unsaveTab
operation on the wrong tab!
I suspect this is a result of being overly simplistic with tab ids, particularly with draggable ids,
and particularly across await boundaries. An index just isn't sufficient to identify a tab, if we
also use the window id as some kind of stable identifier...
dig into this! Try to repro by moving the (saved) Facebook tab earlier in tab order in its saved window.

11Dec:

    - Grrrr. Made some tweaks to simplify layout so that header checkbox and FavIcon have reasonable spacing.
    Now 'x' close button on a Saved Window is not aligned with revert button chevron!
        - Let's put all the SVG buttons in single flexbox in Storybook so we can check alignment...

    - WHY is entering text in the search box SO laggy?? MUST FIX

14Dec: - Still looks to me like expand button aligned with baseline of text instead of being vertically centered.
SO annoying...

Shawn Axsom suggestions:

-   Allow editing of (saved) tab titles
    (Design challenge: do we ever care about the underlying tab title? Probably not, but at least need a way to cancel it and revert back to page title...)
-   Add a hotkey for closing a tab with the keyboard. '-' ?
    Tricky bit: Non-arrow / tab keys go direct to search box...

TOP Priorities:

-   DnD bug getting IDs confused
-   Laggy search box
-   closed windows as DnD target

15Dec: While investigating laggy isearch, put back the redundant setValue optimization in oneref.
Need to commit and publish this.
Then should also add in support for throttling; just use lodash...

\*\*\*\* Some interesting possibilities for perf:

-   Can we somehow cache style calls to avoid re-computing styles for themes? This seems particularly helpful
    for things like HeaderButtonSVG
-   The useCallback hook allows us to construct a stable callback in the parent so that we can use React.memo
    effectively in the child...

I haven't had much luck with the React profiler; timings seem confusing and off.

What I do see, consistently, is that bigRenderTest takes about 2.6 seconds:
full render complete. render time: ( 2684.4900001306087 ms)

What if we break out the core SVG in HeaderButtonSVG and memoize?

And.....NOPE. No significant change in timing if we React.memo SVGIcon. rats.

Alright, I think we have to give up on raw initial render perf. :-(
From the Profiler it actually looks like most of the time is going to react-beautiful-dnd overhead.

But let's do some experiments:

-   What happens if we completely eliminate HeaderButtonSVG from TabItemUI?
-   What happens if we remove dnd support from TabItemUI?
-   What happens if we leave dnd support, but remove all other rendering from TabItemUI?

1. Removing closeButton:
   Takes time from around 2.4 seconds to 2.1 seconds. Not a lot!

2. Replace everything with <span>{tabTitle}</span>:
   Down to 565 ms.

3. No dnd for TabItemUI, but everything else:
   Back to around 2.5 seconds. Suggests that dnd overhead isn't the issue.

4. Put back DnD, replace everything else with <span>{tabTitle}</span>:
   Still down at an impressive 643ms.

Let's slowly start putting back in the various pieces:

-   Outer div (tabItemHoverContainer): 760ms

Adding tabCheckItem and tabFavIcon:

-   Fairly big jump: around 2 seconds

Just tabFavIcon (no tabCheckItem):

-   Still >= 2 seconds.

with tabCheckItem (but no tabFavIcon):

-   Back down to under 1 second (around 985ms)

Let's go back to everything _except_ favIcon:
Around 1.3 seconds....!

OK, great. That's huge. Maybe we can lazy-load FavIcons; we'll try https://github.com/bluebill1049/react-simple-img
and look at some other solutions such as https://medium.com/@albertjuhe/an-easy-to-use-performant-solution-to-lazy-load-images-in-react-e6752071020c

But first: Where is that 1.3 seconds coming from?

One theory: the checkbox input components...
NOPE! Just doesn't appear to be significant; maybe 200 ms.

If we cut off everything in setup, just call render, takes about 50 ms.

If we render header and footer, but skip TabWindowList:
Now we're up to about 100ms.

With sections, but no actual windows:
Still around 100ms.

With windows, including headers, but no headers or TabItems:

Up to around 130 to 200 ms.

Headers only, no tab items: Around 250ms.

Add back tab items:
...and we're back up to 1.3 seconds.
So, basically, it just costs us around 1000ms for 1000 tab items. Which isn't terrible!

Let's try lazy loading the images for FavIcons!

## ...and it worked!

Fixed critical bug with tab de-dup'ing.

To also explore:

-   While URLs are pending can apparently end up displaying / persisting empty titles. Not good! Use
    saved bookmark title in this case.
-   DnD issue!

-   What if we always showed some kind of background for every tab item, and just used a highlight
    on mouseover?

-   Could we have a minimize / hide all option?

-   PUT BACK THROTTLING!

-   (!!) search box not centered when resizing....

Taking a brief break from dealing with DnD bugs to:

-   Checkpoint checkin dnd
-   Change keyboard selection initial index to be -1, and only show when user starts using arrows keys
-   Stronger visual indicator of active tab in EVERY window. Bold just isn't strong enough.

TODO: A problem with not auto-setting selectedTabIndex to active tab is ISearch. Want to be able to type a few
characters and hit Enter without using down-arrow. Should be fixable by adjusting index from -1 to 0 whenever the
search string has length > 0.

OK, we seem to have a reasonable active tab indicator by using boxShadow.
BUT: This shows that we have a bug! When we open a new tab, we can end up in a state with more than one
active tab within a window. It seems we don't get tab updated messages when a tab should lose its
active status...

-   When opening a tab window, can we update tab manager state while the window is opening? BIG lag
    right now when re-opening a saved window.

-   Need to update selected tab index back to 0 when searchStr changes from non-empty to empty...

\*\*\*\* - Bug in SimpleImg exposed by DnD: It looks like dragging within a window will mess up favicon images.
( Was due to bad key handling... )

New, annoying issue with rbd: Annoying flash at drop.
A new idea to pursue: What if we need to do the state update synchronously in onDragEnd?
Or at least...sooner? Like before we actually move the tab items? Like: What if we skip actually moving
the tabs for now, and just worry about the state?

Sequence of events we see when moving a tab:
Chrome Event: tabs.onDetached: 1042 {oldPosition: 3, oldWindowId: 689}
(We attempt to close it, but its already gone...)
Chrome Event: tabs.onAttached: 1042 {newPosition: 5, newWindowId: 858}
Chrome Event: tabs.onCreated: {...id: 1042, ...} // Not real! Comes from onAttached handler!

Let's check how we're handling these:
onDetached: Let's make sure handling it like closed only operates on source window:
onAttached --> onCreated: This seems risky, particularly with the optimistic UI update.

Problem 1:

-   tabWindowUtils.closeTab will bail out when it doesn't find the detached tab in the original tabWindow.
    This won't work when we move a saved tab!

I am seeing some strange behavior where fairly frequently dragging a tab to a new window results in a duplicate
in the target briefly (and then is corrected).
Theory is that this is the result of calling onCreated to handle onAttached....

handled by getting tab details and then passing state.handleTabCreated:
which just calls tabWindowUtils.createTab:

...turned out we could end up duplicating tabs in mergeTabWindowTabItems. Fixed, by filtering out dupes
after we've split open from saved, before merging.

TODO:

X fix handling of onDetached for saved tab items. Need to deal with both moves initiated from within Tabli
and reacting to dragging of tabs outside of Tabli.

X Make target window and tab active after drop operation.

X Support moving of closed, saved tabs, even across closed, saved windows

X Deal with using DnD to adjust ordering of both open tab index and bookmark index.

Release Prep, 26Dec19:

X Better screenshots for Chrome Web Store
X Better screenshots for Tabli web site
X Get gettabli.com domain working for support email ( Got it working as a "Group" email via gsuite via admin.google.com, using antonycourtney.com G Suite setup)

-   write relnotes
-   Update web site with rel notes
-   X Add link to Wired article to web site
    0 Maybe: write a "Getting the Most out of Tabli" post
-   Build and upload new release to CWS
-   Email tabli-users
-   Ship It
-   Chill

A quick thought on performance:

Profiling suggests that at this point, DnD overhead may be the most significant component of rendering performance.
Some thoughts:
  - We could try tweaking bigRenderTest to run with no DnD contexts and see if it impacts perf significantly.
If so, we could
  - Only support DnD in the popout window
  - Make an "editing / organize" mode and only turn on DnD in that mode.
   