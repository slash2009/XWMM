Ext.onReady(function() {

    //Load all movies
    //Loadmovie();
    //Loadnico()
    //Load existing genres
    Loadgenre();



    //Start Application with Main Panel
    top.render(document.body)
    // We can retrieve a reference to the data store
    // via the StoreMgr by its storeId

    //Ext.StoreMgr.get('gridmoviestore').load();

});
