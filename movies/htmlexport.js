
function movieExport() {
	this.AllMovies = showHtmlAllMovies;
	this.writeHtmlLine = writeHtmlLine;
	this.WatchedMovies = showHtmlWatchedMovies;
	this.UnwatchedMovies = showHtmlUnwatchedMovies
}

function showHtmlAllMovies(window) {
	for (var i=0; i< storeMovie.data.length ; i++) {	
		this.writeHtmlLine(window, i)
	}
}

function showHtmlWatchedMovies(window) {
	for (var i=0; i< storeMovie.data.length; i++) {
		if (storeMovie.data.items[i].data.watched > 0) {
			this.writeHtmlLine(window, i)
		}
	}
}

function showHtmlUnwatchedMovies(window) {
	for (var i=0; i< storeMovie.data.length; i++) {
		if (storeMovie.data.items[i].data.watched == 0) {
			this.writeHtmlLine(window, i)
		}
	}
}

function writeHtmlLine(window, index) {	
		var movieList = storeMovie.data.items;
		window.document.write("<tr>");
		window.document.write("<td>"+movieList[index].data.Movietitle+"</td>");
		window.document.write("<td>"+movieList[index].data.MovieRelease+"</td>");
		window.document.write("<td>"+movieList[index].data.Moviegenres+"</td>");
		if  (movieList[index].data.streamdetails == null) 
			window.document.write("<td> </td><td> </td>")
		else {
			if (movieList[index].data.streamdetails.video.length != 0)
				window.document.write("<td>"+movieList[index].data.streamdetails.video[0].codec+"</td>");
			else
				window.document.write("<td> </td>");
				
			if (movieList[index].data.streamdetails.audio.length != 0)
				window.document.write("<td>"+movieList[index].data.streamdetails.audio[0].codec+"</td>")
			else
				window.document.write("<td> </td>");
		}	
		window.document.write("</tr>");
}

function createHTMLHeader(title) {
	myWin.document.write("<html><head><title>Movies List");
	myWin.document.write("</title></head><body>");
	myWin.document.write("<center><font size=+3>");
	myWin.document.write(title);
	myWin.document.write("</font></center>");
	myWin.document.write("<table border='1'>");
	myWin.document.write("<tr>");
	myWin.document.write("<td><b>Movie Title</b></td>");
	myWin.document.write("<td><b>Release</b></td>");
	myWin.document.write("<td><b>Genres</b></td>");
	myWin.document.write("<td><b>Video</b></td>");
	myWin.document.write("<td><b>Audio</b></td>");
	myWin.document.write("</tr>");
}

function moviesHTML() {
  myWin= open("", "displayWindow", "width=900,height=700,status=yes,toolbar=yes,scrollbars=yes");
  // open document for further output
  myWin.document.open();
    // create export document
  createHTMLHeader("Complete Movies List");
  
  var myExport = new movieExport();
  myExport.AllMovies(myWin);
  
  myWin.document.write("</table> ");
  myWin.document.write("</body></html>");
  // close the document - (not the window!)
  myWin.document.close();
}

function watchedMoviesHTML() {
  myWin= open("", "displayWindow", "width=900,height=700,status=yes,toolbar=yes,scrollbars=yes");

  // open document for further output
  myWin.document.open();
    // create export document
  createHTMLHeader("Watched Movies List");
  
  var myExport = new movieExport();
  myExport.WatchedMovies(myWin);
  
  myWin.document.write("</table> ");
  myWin.document.write("</body></html>");
  // close the document - (not the window!)
  myWin.document.close();
}

function unwatchedMoviesHTML() {
  myWin= open("", "displayWindow", "width=900,height=700,status=yes,toolbar=yes,scrollbars=yes");

  // open document for further output
  myWin.document.open();
    // create export document
  createHTMLHeader("Unwatched Movies List");

  var myExport = new movieExport();
  myExport.UnwatchedMovies(myWin);
  
  myWin.document.write("</table> ");
  myWin.document.write("</body></html>");
  // close the document - (not the window!)
  myWin.document.close();
}
