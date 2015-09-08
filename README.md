# basic-maps-webapp
Simplified Version of P5

Resources Used:
http://stackoverflow.com/questions/18444161/google-maps-responsive-resize 
http://stackoverflow.com/questions/6502566/google-markers-setvisible-true-false-show-hide
http://opensoul.org/2011/06/23/live-search-with-knockoutjs/
http://jsfiddle.net/mythical/XJEzc/
http://stackoverflow.com/questions/21181211/how-to-overlay-a-div-on-a-map
http://stackoverflow.com/questions/237104/array-containsobj-in-javascript

Issues:
- Can't close infoWindow when venue is filtered out from ListView
    - Solution: Have not started
- Markers aren't clearing on new location search
    - Solution: In progress
- Route creation has duplicate start/end locations 
    - this is because the start and end are included in the waypoints 
    - Solution: Create dropdown for user to select start/end, create separate method to add waypoints

To-Dos: 
- Responsive Design for Mobile
    - Cohesive and enjoyable user experience
- ~~~Search Bar: filters both list view and markers~~~
- ~~~List View: filters through searched locations and opens associated marker~~~
- ~~~"Unique Functionality"~~~
    - Route making counts...right? 
- Incorporate Build Process
    - Production quality minified code
- Data persists when app is opened and closed
    - Firebase/localStorage
- ~~~Populates dynamic model with info retrieved from API~~~
- Error handling for API
- Include third-party API beyond what's required
- Style marker differently and usefully
- Search function is optimized and provides things like autocomplete
- README file detailing steps on how to run the project
- Comments are concise and self documenting
- Code ready for personal review