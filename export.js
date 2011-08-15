
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
  myWin= open("", "displayWindow",
    "width=900,height=700,status=yes,toolbar=yes,scrollbars=yes");

  // open document for further output
  myWin.document.open();
    // create export document
  createHTMLHeader("Complete Movies List");

  for (var i=0; i<storeMovie.data.items.length; i++) {
		myWin.document.write("<tr>");
		myWin.document.write("<td>"+storeMovie.data.items[i].data.Movietitle+"</td>");
		myWin.document.write("<td>"+storeMovie.data.items[i].data.MovieRelease+"</td>");
		myWin.document.write("<td>"+storeMovie.data.items[i].data.Moviegenres+"</td>");
		var myRecord = new MovieRecord;
		myRecord.data.idFile = storeMovie.data.items[i].data.idFile;
		GetVideoStreams(myRecord);
		GetAudioStreams(myRecord);
		myWin.document.write("<td>"+myRecord.data.strVideoCodec+"</td>");
		myWin.document.write("<td>"+myRecord.data.strAudioCodec+"</td>");
		myWin.document.write("</tr>");
		
	};
  myWin.document.write("</table> ");
  myWin.document.write("</body></html>");
  // close the document - (not the window!)
  myWin.document.close();
}

function watchedMoviesHTML() {
  myWin= open("", "displayWindow",
    "width=900,height=700,status=yes,toolbar=yes,scrollbars=yes");

  // open document for further output
  myWin.document.open();
    // create export document
  createHTMLHeader("Watched Movies List");

  for (var i=0; i<storeMovie.data.items.length; i++) {
	if (storeMovie.data.items[i].data.watched != "") {
		myWin.document.write("<tr>");
		myWin.document.write("<td>"+storeMovie.data.items[i].data.Movietitle+"</td>");
		myWin.document.write("<td>"+storeMovie.data.items[i].data.MovieRelease+"</td>");
		myWin.document.write("<td>"+storeMovie.data.items[i].data.Moviegenres+"</td>");
		var myRecord = new MovieRecord;
		myRecord.data.idFile = storeMovie.data.items[i].data.idFile;
		GetVideoStreams(myRecord);
		GetAudioStreams(myRecord);
		myWin.document.write("<td>"+myRecord.data.strVideoCodec+"</td>");
		myWin.document.write("<td>"+myRecord.data.strAudioCodec+"</td>");
		myWin.document.write("</tr>");
	}
		
	};
  myWin.document.write("</table> ");
  myWin.document.write("</body></html>");
  // close the document - (not the window!)
  myWin.document.close();
}

function unwatchedMoviesHTML() {
  myWin= open("", "displayWindow",
    "width=900,height=700,status=yes,toolbar=yes,scrollbars=yes");

  // open document for further output
  myWin.document.open();
    // create export document
  createHTMLHeader("Unwatched Movies List");

  for (var i=0; i<storeMovie.data.items.length; i++) {
	if (storeMovie.data.items[i].data.watched == "") {
		myWin.document.write("<tr>");
		myWin.document.write("<td>"+storeMovie.data.items[i].data.Movietitle+"</td>");
		myWin.document.write("<td>"+storeMovie.data.items[i].data.MovieRelease+"</td>");
		myWin.document.write("<td>"+storeMovie.data.items[i].data.Moviegenres+"</td>");
		var myRecord = new MovieRecord;
		myRecord.data.idFile = storeMovie.data.items[i].data.idFile;
		GetVideoStreams(myRecord);
		GetAudioStreams(myRecord);
		myWin.document.write("<td>"+myRecord.data.strVideoCodec+"</td>");
		myWin.document.write("<td>"+myRecord.data.strAudioCodec+"</td>");
		myWin.document.write("</tr>");
	}
		
	};
  myWin.document.write("</table> ");
  myWin.document.write("</body></html>");
  // close the document - (not the window!)
  myWin.document.close();
}