# basic-maps-webapp
Simplified Version of P5 (Pub Crawl App)

How to use:
- Download from github.com/shui91/basic-maps-webapp or open shui91.github.io/basic-maps-webapp
- Click on "Get Started"
- List of bars/breweries in Vancouver, BC open up as default.
- User may search for their own location to load FourSquare's recommended drinking holes
- Locations are marked as Breweries (Barrels) and Pubs(Beer Glasses).
- Users can add/remove specific venues to their crawl list
- Users can clear the list
- Users can click "Create Crawl" to generate a directions list to plan their pub crawl!

Resources Used:

http://stackoverflow.com/questions/18444161/google-maps-responsive-resize
http://stackoverflow.com/questions/6502566/google-markers-setvisible-true-false-show-hide
http://opensoul.org/2011/06/23/live-search-with-knockoutjs/
http://jsfiddle.net/mythical/XJEzc/
http://stackoverflow.com/questions/21181211/how-to-overlay-a-div-on-a-map
http://stackoverflow.com/questions/237104/array-containsobj-in-javascript
http://stackoverflow.com/questions/10306883/prevent-a-double-click-on-a-button-with-knockout-js
http://gmaps-samples-v3.googlecode.com/svn/trunk/styledmaps/wizard/index.html?utm_medium=twitter
http://guidobouman.github.io/jquery-panelsnap/

Issues:
- Unfortunately, due to FourSquare's broad "Pub" Category ID '4bf58dd8d48988d116941735', there are sometimes other night life locations thrown in, reducing the effectiveness of the location icons
	- Location Icons disappear on Route Creation, because Google Maps Directions uses its own markers
- Currently users can NOT add/remove from InfoWindow, to be implemented in the future
- InfoWindows don't close on list view search
- If screen is too small, search bars will overlap with toggles


To-Dos to Meet Project Expectations:
- ~~Responsive Design for Mobile~~
    - ~~Cohesive and enjoyable user experience~~
- ~~Search Bar: filters both list view and markers~~
- ~~List View: filters through searched locations and opens associated marker~~
- ~~"Unique Functionality"~~
    - ~~Route making counts...right?~~
- ~~Incorporate Build Process~~
    - ~~Production quality minified code~~
- Data persists when app is opened and closed
    - Firebase/localStorage
- ~~Populates dynamic model with info retrieved from API~~
- ~~Error handling for API~~
- Include third-party API beyond what's required
- ~~Style marker differently and usefully~~
- Search function is optimized and provides things like autocomplete
- ~~README file detailing steps on how to run the project~~
- ~~Comments are concise and self documenting~~
- ~~Code ready for personal review~~

To-Dos for the Future:
- Menu
- Close InfoWindows on List View Search
- Users can add/remove locations directly from infowindow