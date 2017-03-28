# white label

[![Build Status](https://travis-ci.org/bshack/white-label.svg?branch=master)](https://travis-ci.org/bshack/white-label)

Scaffolding for developing and deploying sites.

## Key Libraries

- Babel
- Foundation
- Browserify
- Browsersync
- Gulp
- Handlebars
- Jasmine
- Modernizr
- Node Events
- Karma
- ReactJS
- SCSS
- [White Label Model](https://github.com/bshack/white-label-model)

## Install Dependancies

IMPORTANT: Verify you have the latest versions of each of these if you have previously installed them.

### Nodejs

http://nodejs.org

_This project works with 'LTS' or 'Current'_

### Gulp

http://gulpjs.com

### Other

Debian/Ubuntu Users:
build-essential package

### Node Modules

```
npm install;
```

### Text Editor Config

Install the correct plugin for your text editor here:

http://editorconfig.org/#download

This will normalize settings like what tab character(s) to use and will avoid linting errors.

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
gulp deploy --www=(www domain - required) --cdn=(cdn domain - required) --service=(service domain - required) --production=(true|false - optional) --version=(unique deploy version - optional);
```

_The 'version' argument defaults to an epoch timestamp and the 'production' argument defaults to 'false'._

#### Example

```
gulp deploy --www=//www.example.com --cdn=//cdn.example.com --service=//service.example.com --version=123456789 --production=true;
```

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

## Getting Started

### Source Files

Site source files used to build your site are located in the '/app/' directory.

### Data

Any generated html page can have an associated JSON data file in 'app/assets/data/' directory. This is where you can
stub out data to be used for populating the markup templates for that page. Follow the same directory and file structure as your pages.

Define any data properties you want available for all your pages in 'global.json'. Any properties defined in page specific JSON files will override properties in 'global.json'.

### Markup

This project uses HandlebarJS for the templating for both server side and client side.

#### Directory Structure

/app - these are the top level templates. These are compiled directly to .html files in the www root of the project. This is where index.html lives.

/app/assets/markup - this is where all handlebars partials live

/app/assets/markup/tags - these are partials for basic html tags, useful if you don't want to reinvent the wheel constantly

/app/assets/script/template - all partials are precompiled into js files and placed into this directory

#### Client Side

To use templates client side you would simply require precompiled js template and then executed it. It will return a DOM object. If you have data you want to populate the template with you can optionally passed it in.

JS template files are just .handlebars files from the markup directory that have been precompiled.

source .handlebars template files are here:

/app/assets/markup/

precompiled .js versions of the .handlebars template files are here:

/app/assets/script/template/

As you create/modify the source .handlebars files precompiled .js versions will be automatically created.

##### Usage

import the template

```
import templateLogin from '../template/login';
```

set the html content of the body element to be the returned markup populated with passed in data

```
document.body.appendChild(templateLogin({
    someKey: 'someValue'
});
```

### CSS

This project uses SCSS for the CSS compilation.

#### Directory Structure

/app/assets/style - these are the top level scss files live, these are compiled directly into to .css files.

/app/assets/style/base - this is where all the scss files with reusable placeholders live

### Javascript

#### Utility

Utilities hold reusable bits of business logic that DO NOT touch the DOM. If you have some code that touches the DOM and is intended to be reusable it should instead just be another view (see below).

Utility code is the only code expected to be unit tested in the project.

In this project the utility files are placed here:

/app/assets/script/utility

#### Model

This project uses the [White Label Model](https://github.com/bshack/white-label-model). Full Documentation is available on the project page with examples of usage with collections of data.

In this project the model files are placed here:

/app/assets/script/model

#####Let's look at an example:

import the model module
```
const Model = require('white-label-model').Model;
```
instantiate your model
```
const modelColor = new Model();
```
set some data in the model
```
modelColor.set({
    name: 'red'
});
```
retrieve the data
```
const redColorData = modelColor.get();
```
update the data
```
modelColor.update({
    name: 'blue',
    isPrimaryColor: true
});
```
delete the data
```
modelColor.delete();
```
