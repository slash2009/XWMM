XWMM - XBMC Web Media Manager
====

### v4 Rewrite Branch
This is an experimental branch of XWMM looking at the possibility of moving to
ExtJS 4, which effectively requires a rewrite due to ExtJS 4 being very
different from ExtJS 3.

This is all highly experimental, it might break stuff, don't use it on
irreplaceable data.

### Prerequisites
[Sencha Cmd](http://docs.sencha.com/extjs/4.2.1/#!/guide/command "Title") is
required to build ExtJs 4 based applications.

- - -

### To Do
* Write a to do list :p

- - -

### Directory Structure
#### XWMM/app

This folder contains the javascript files for the application.

#### XWMM/resources

This folder contains static resources (typically an `"images"` folder as well).

#### XWMM/overrides

This folder contains override classes. All overrides in this folder will be 
automatically included in application builds if the target class of the override
is loaded.

#### XWMM/sass/etc

This folder contains misc. support code for sass builds (global functions, 
mixins, etc.)

#### XWMM/sass/src

This folder contains sass files defining css rules corresponding to classes
included in the application's javascript code build.  By default, files in this 
folder are mapped to the application's root namespace, 'XWMM'. The
namespace to which files in this directory are matched is controlled by the
app.sass.namespace property in XWMM/.sencha/app/sencha.cfg. 

#### XWMM/sass/var

This folder contains sass files defining sass variables corresponding to classes
included in the application's javascript code build.  By default, files in this 
folder are mapped to the application's root namespace, 'XWMM'. The
namespace to which files in this directory are matched is controlled by the
app.sass.namespace property in XWMM/.sencha/app/sencha.cfg. 
