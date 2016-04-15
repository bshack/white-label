# white label

[![Build Status](https://travis-ci.org/bshack/white-label.svg?branch=master)](https://travis-ci.org/bshack/white-label)

Scaffolding for developing and deploying sites.

## Key Libraries

- Babel
- Browserify
- Browsersync
- Gulp
- Jasmine
- JSX
- Modernizr
- Karma
- React
- SCSS
- White Label Mediator
- White Label Model

## Install Dependancies

IMPORTANT: Verify you have the latest versions of each of these if you have previously installed them.

### Nodejs

http://nodejs.org

_This project works with 'LTS' or 'stable'_

### Gulp

http://gulpjs.com

### Other

Windows Users:
Python language support

Debian/Ubuntu Users:
build-essential & libvips-dev packages

### Node Modules

```
npm install;
```

### Text Editor Config

Install the correct plugin for your text editor here:

http://editorconfig.org/#download

This will normalize settings like what tab character(s) to use and will avoid linting errors.

## Locations

### Source Files

Site source files used to build your site are located in the 'app/' directory.

## Gulp Tasks

### Watch

```
gulp watch;
```

This will create a Browsersync server and reload your browser window(s) as you make code changes.

Learn more about Browsersync here: https://www.browsersync.io

### Deploy

This compiles and bundles everything into a deploy ready package outputted in the '\_deploy' directory.

```
gulp deploy --version=(unique deploy version - optional) --www=(www domain) --cdn=(cdn domain) --service=(service domain) --production=(true|false - optional);
```

_The 'version' argument defaults to an epoch timestamp and the 'production' argument defaults to 'false'._

### Unit Tests

watch:

```
gulp unitWatch;
```

single run:

```
gulp unit;
```

### More

These in additional to other tasks run as dependencies of the 'watch' and 'deploy' tasks.

```
gulp markup;
gulp style;
gulp script;
gulp sprite;
gulp accessibility;
gulp documentation;
```

## Test If Your Project Will Build

Run this when you want to verify your changes will build properly on the CI server before pushing:

```
npm test;
```

## NPM Shrinkwrap

This project uses npm shrinkwrap to freeze npm module versions for improved project stability. More information here: https://docs.npmjs.com/cli/shrinkwrap.

## Using it with Yeoman

Install as a node module:

```
npm install generator-white-label -g;
```

Then in an empty directory:

```
yo white-label;
```

Learn more about Yeoman here: https://yeoman.io

## Bugs or Feature Requests?

Pull request or log a ticket :)
