# Buzz Radar Dashboards cross platform application
Repository for the cross platform made with Electron and NodeJS

Requirementss
------------

1. https://gitforwindows.org/
2. NodeJs 8.x.x
3. npm >= 5.2.x

Installing dependencies
-----------------------

1. git clone https://github.com/buzzradar/electroApp.git
2. `npm install`

Running the project
-------------------

1. Go inside the project's folder in a terminal window
2. `npx electron .`
3. ignore squirrel error, doesn't need that for develop

Packaging the project, creating the installer and release an update for Windows
----------------------------------------------------

This process needs to be done on a Windows pc.

3. Make sure you have the desired version attribute inside package.json (if you are updating the app it should be greater than the previous version).
4. Package the electron app in bash (powershell won't work) with `npm run pack:win`or `./node_modules/.bin/electron-packager . --out=builds --ignore='^/builds$' --platform=win32 --arch=ia32 --version-string.CompanyName='buzzradar' --icon=./br_desktop_icon.ico --overwrite`
5. Create the windows installer. This is done with `node js/create-installer-win.js`
6. Upload the content of `builds/installer-win-32` to rackspace STORAGE/FILES inside the container "buzz/desktop-dashboards-app-releases".
7. Make sure that the new RELEASES file contains a reference to the new version inside of it. I'm saying this because sometimes racksapce was keep showing a previous version of the file even when I successfuly replaced it with a new one. So, just download it and open it with a text editor and check if it is the new file or still the old.
If so select the purge option on the tools icon to the left of the file name on Rackspace.
8. The distributable file is `BuzzRadarSetup.exe`. This file can be passed to clients in order to install the app.

How auto-updates work
----------------

Averytime the app is opened it will check if there is a new version and also at 04.10 it will check and restart the app

How to update on windows for Immo : )
------------------------
(use my computer to update package and js and push, use other computers to pull and compile)

1. Replace js/buzzradar_fat.js with the latest version in projects/electroApp
2. Bump up version in package.json
3. On PC use Git Bash to open "electroApp", right click the folder and select GIT BASH
4. Run "git pull", tip: "git log --oneline" (exit with "q")
5. preview: `npx electron .`
6. Package the electron app with `npm run pack:win`. If that doesn't work try run directly from cli `./node_modules/.bin/electron-packager . --out=builds --ignore='^/builds$' --platform=win32 --arch=ia32 --version-string.CompanyName='buzzradar' --icon=./br_desktop_icon.ico --overwrite` https://www.christianengvall.se/electron-packager-tutorial/ if powershell won't work, try gitbash instead
7. compile app: `node js/create-installer-win.js`
8. upload the content of `builds/installer-win-32` to rackspace STORAGE/FILES inside the container "buzz/desktop-dashboards-app-releases"
9. purge release file on rackspace

Push changes on git bash

1. git add myfilesomething.something or git add .
2. git status
3. git commit -m "my update message something"
4. git push

Crash log: https://buzzradar.sp.backtrace.io/
u: buzzradar
p: XJVWAuxpNm3


"please enter a commit message to explain why this merge is necessary":

1. press "i"
2. write your merge message
3. press "esc"
4. write ":wq"
5. then press enter

add to ignore:
https://stackoverflow.com/questions/4308610/how-to-ignore-certain-files-in-git#4308645



DOWNLOAD LINKS:
------------------------

Mac download link (BuzzRadar-x.x.xx.dmg on rackspace)
http://b1cffd963dfbf2f86e49-75d66e349be7351b0bb87db3c2ed768a.r90.cf3.rackcdn.com/desktop-dashboards-app-releases/osx/BuzzRadar-x.x.xx.dmg

PC download link (BuzzRadarSetup.exe):
http://bit.ly/2ogErgO

!IMPORTANT
------------------------
Make sure users have admin rights on their computers, otherwise auto-updates won't work seamlessly


##For cross communication, app to dashboard and vice versa:
------------------------
1) check out "TALK TALK" main.js, preload.js and buzzradar.html in electro app
2) check out "onWrapperAppEvent" and "sendDashboardEvent" in A01_DisplayGlobals-srv.js in dashboard src
