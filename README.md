XWMM - XBMC Web Media Manager
====

XWMM is a cross platform tool to manage the XBMC Media Database. It is completely web based, so you don't need to install anything on your workstation to manage your media.

This tool is intended to facilitate the use of the XBMC media management features (media infos, media categorization, scraping, etc ...)

#### Useful Links
* [Releases](https://github.com/slash2009/XWMM/releases)
* [Support and Discussion](http://forum.xbmc.org/showthread.php?tid=188839)
* [Report an issue](https://github.com/slash2009/XWMM/issues)
* [F.A.Q. - <b>F</b>requently <b>A</b>sked <b>Q</b>uestions](https://github.com/slash2009/XWMM/wiki/F.A.Q.-Frequently-asked-questions)
* [XWMM wiki](https://github.com/slash2009/XWMM/wiki)

- - -

### DEVELOPERS NEEDED - We don't pay either hehe ;)
Please join XWMM, help this XBMC web-interface be nr#1, we need skilled developers which can help improve and add exciting new features to XWMM.

- - -

### Installation Instructions

- Install XWMM:
  - Download [XWMM](https://github.com/slash2009/XWMM/releases)
  - Go to System > Add-ons
  - Select **[Install from a zip file](http://wiki.xbmc.org/index.php?title=HOW-TO:Install_an_Add-on_from_a_zip_file "HOW-TO:Install an Add-on from a zip file")**

- Enable web interface:
  - Go to System > Services > Webserver > Services
  - Enable **Allow control XBMC via HTTP**
  - Set **Web Interface** to XWMM *(optional)*

- Access XWMM:
  - If you made XWMM the default web interface open your browser to http://*xbmc_ip*:*port*/
  - Otherwise open your browser to http://*xbmc_ip*:*port*/addons/webinterface.XWMM/

- - -

### Submitting patches and PRs
The idea is to fork this repo work on your changes and make a pull request (PR) to the **master** branch, it should contain some of the following:

* What the patch addresses, if its a bug-fix a feature or improvement or something else.
* Any comments in code for what is not immediately obvious.

#### Note:
A pull request (PR) should be made to **master**, (using branches is ok if your going to make the same PR to master) by using master then your working with latest code and fixes. Any work can then be easily picked and pulled into branches if needed, especially if its a bug-fix.

#### What will happen to patches & PRs
* It will be reviewed and merged as soon as possible by someone who understands what's going on.

- - -
