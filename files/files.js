
var stackTable =[];

function normalizeString(string) {

	string = string.replace(/\%5c/g,"\\");
	string = string.replace(/\%20/g," ");
	string = string.replace(/\%3a/g,":");
	string = string.replace(/\\/g,"\\\\");
	return string;
}
function rootRecord(text, string, parentPath) {
	this.text = text;
	this.data = string;
	this.parentPath = parentPath;
	this.xbmcIdFile = "";
	this.checkIsInDB = checkIsInDB;
	this.checkFilePath = checkFilePath;
	this.checkDirPath = checkDirPath;
	this.xbmcIdPath = "";
	this.xbmcstrPath = "";
	this.xbmcScraper = "";
	this.xbmcContent = "";
	this.isStack = false;
}

function nodeRecord(text, string, parentPath) {
	this.text = text;
	this.data = string.file;
	this.parentPath = parentPath;
	this.xbmcIdFile = "";
	this.checkIsInDB = checkIsInDB;
	this.checkFilePath = checkFilePath;
	this.checkDirPath = checkDirPath;
	this.xbmcIdPath = "";
	this.xbmcstrPath = "";
	this.xbmcScraper = "";
	this.xbmcContent = "";
	this.xbmcWatched = "";
	this.isStack = false;
}

function checkIsInDB() {

	this.xbmcIdFile = -1;
	var storeIdFile = storeFiles.findExact('strFilename', this.text, 0, false, false);
	
	// check if stack 
	if (storeIdFile == -1) { 
		var myIndex = stackTable.find(this.parentPath+this.text);
		if (myIndex != -1) {
			this.isStack = true;
			this.xbmcIdFile = myIndex
		}
	}
	else {	
		this.xbmcIdFile = storeFiles.getAt(storeIdFile).data.idFile;
		this.xbmcWatched = storeFiles.getAt(storeIdFile).data.watched;
	}
}

Array.prototype.find = function(searchStr) {
	
	for (i=0; i<this.length; i++) {
		if (this[i].data.strFilename == searchStr) return this[i].data.idFile;
    }
	return -1;
}

function getStacks() {

	var stackResult = storeFiles.query('strFilename', 'stack://', false, false);
	for (var i=0; i < stackResult.items.length; i++) {
		var temp = stackResult.items[i].data.strFilename.split(' , ');
		
		for (var j=0; j < temp.length; j++) {
			myRec = new filesRecord;
			myRec.data.strFilename = temp[j].replace(/stack:\/\//g,"");
			myRec.data.idFile = stackResult.items[i].data.idFile;
			myRec.data.idPath = stackResult.items[i].data.idPath;
			
			stackTable.push(myRec);
		}
	}
}

function checkFilePath() {
	
	this.xbmcIdPath = -1;
	var storeIdPath = storePath.findExact('strPath', this.parentPath, 0, false, false);
	
	if (storeIdPath != -1) {
		this.xbmcContent = storePath.getAt(storeIdPath).data.strContent;
		this.xbmcScraper = storePath.getAt(storeIdPath).data.strScraper;
		this.xbmcIdPath = storePath.getAt(storeIdPath).data.idPath;
		this.xbmcstrPath = storePath.getAt(storeIdPath).data.strPath;
	}
	if (this.xbmcstrPath != this.parentPath) this.xbmcIdPath = -1;
}

function checkDirPath() {
	this.xbmcIdPath = -1;
	var storeIdPath = storePath.findExact('strPath', this.data, 0);
	
	if (storeIdPath != -1) {
		this.xbmcContent = storePath.getAt(storeIdPath).data.strContent;
		this.xbmcScraper = storePath.getAt(storeIdPath).data.strScraper;
		this.xbmcIdPath = storePath.getAt(storeIdPath).data.idPath;
	}
}