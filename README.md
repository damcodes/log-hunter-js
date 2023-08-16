# Log Hunter

This tool is for us to use to search through the CommonLogger directory, parse the logs, and dump them into a text file per app in a directory per date for the parsed logs.

## Setup

You need the LTS version of Node.js installed to run this app.
To install, go to [Setting up Node.js on native Windows](https://learn.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-windows#install-nvm-windows-nodejs-and-npm)
and follow the instructions for installing NVM (node version manager).

After installing Node.js, go to the root of this app and do the following:

1. Run `npm i` to install the xml2js dependency.
2. Run `npm i -g .` to install this app as a global npm package that can be run from any directory

## How to Use

1. Run `hunter` in the command line to start the app. Optionally, you can run `hunter --1d` ('ONEd' not ID) which will run a 1 day hunt and gather all logs starting the day before at 12 AM
2. You'll be prompted for the following information:
    - App Name:             defaults to All apps
    - Log Severity Level:   defaults to All
    - Start Date:           defaults to 12 AM of the day before End Date
    - End Date:             defaults to the current dateTime
        - Time can be specified as part of Start and End Date. Defaults to 12 AM of the provided date
        - Time can be passed in as 24 hour time or formatted like --> 4:00 AM/PM (don't forget the space)
    - SAMAccountName:       defaults to null
    - Exception Keywords:   you can provide a comma separated list of keywords or phrases you're looking for in the log exception messages
    - Stack Trace KeyWords: you can provide a comma seaprated list of keywords or phraess you're looking for in the log stack trace
    To use default settings for any of the prompts, just hit enter.
3. If logs have been found matching your parameters, they'll be parsed and written to a text file