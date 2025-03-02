<h1 align="center">Women in EECS</h1>

<div align="center">
	<a href="#overview">Overview</a>
  <span> • </span>
    	<a href="#setup">Setup</a>
  <span> • </span>
    	<a href="#hosting-details">Hosting Details</a>
  <span> • </span>
        <a href="#directory-overview">Directory Overview</a>
  <p></p>
</div>

## Overview

This is Women in EECS's primary website.

## Setup

1. Install [Node.js LTS](https://nodejs.org/en/download)
2. [Clone the Repository](https://github.com/womenineecs/womenineecs.github.io)
3. `npm install`
4. `npm start`

## Hosting Details

This website is hosted on scripts.mit.edu. To update this website, the
easiest thing to do is:

- Update this Github repository with your desired changes.
- ssh to athena.dialup.mit.edu [more info](http://web.mit.edu/dialup/www/ssh.html)
  `ssh athena.dialup.mit.edu -l <your_kerb> -p 22`
- From Athena, run `ssh -k womenineecs@scripts` (if you have trouble with this step, it's possible that you don't have the correct permissions -- ask an administrator to give you permissions according to instructions [here](https://scripts.mit.edu/faq/58/). They should run something like `attach womenineecs; fs sa /mit/womenineecs <user> all` (for access and write, etc)
- Run `git pull`.

This website also uses SASS. See [here](https://sass-lang.com/) for details. Generally you want to edit the file `stylesheets/main.scss` while running something like `sass --watch stylesheets/scss:stylesheets/`.

## Directory Overview

```
womenineecs.github.io/
├── README.md
├── index.html                       # Main file with all the content!
├── package.json                     # Package manager
├── stylesheets
│   ├── gallery_clean.css
│   ├── main.css
│   └── scss                         # Main CSS file
├── public
│   ├── assets/                      # Assets (anything not images)
│   └── images/                      # All images
│   │   ├── events/
│   │   ├── profiles/
│   │   └── sponsors.ts
├── js
│   ├── main.js          # Enables link-scrolling
│   └── populate.js      # Automatically populates people, events, and sponsors based off /data json files
└── data/                         # JSON Data for autopopulated information
    ├── events.json
    ├── people.json
    └── sponsors.json
```

## How to Update People, Events, Sponsors

1. Go to data/
2. Go to the respective json file and update it
