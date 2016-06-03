# white label

[![Build Status](https://travis-ci.org/bshack/white-label.svg?branch=master)](https://travis-ci.org/bshack/white-label)

Scaffolding for developing and deploying sites.

## Key Libraries

- Babel
- Bootstrap
- Browserify
- Browsersync
- Gulp
- Handlebars
- Jasmine
- Modernizr
- Karma
- SCSS
- [White Label Mediator](https://github.com/bshack/white-label-mediator)
- [White Label Model](https://github.com/bshack/white-label-model)
- [White Label Router](https://github.com/bshack/white-label-router)
- [White Label View](https://github.com/bshack/white-label-view)

## Install Dependancies

IMPORTANT: Verify you have the latest versions of each of these if you have previously installed them.

### Nodejs

http://nodejs.org

_This project works with 'LTS' or 'Current'_

### Gulp

http://gulpjs.com

### Other

Windows Users:
Python language support

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

## Locations

### Source Files

Site source files used to build your site are located in the 'app/' directory.

### Stubbed JSON Data

Any generated html page can have an associated JSON data file in 'app/assets/data/' directory. This is where you can
stub out data to be used for populating the markup templates for that page. Follow the same directory and file structure as your pages.

Define any data properties you want available for all your pages in 'global.json'. Any properties defined in page specific JSON files will override properties in 'global.json'.

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

### Model

This project uses the [White Label Model](https://github.com/bshack/white-label-model). Full Documentation is available on the project page.

####Let's look at an example:

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
retrieve it
```
const redColorData = modelColor.get();
```
update it
```
modelColor.update({
    name: 'blue',
    isPrimaryColor: true
});
```
delete it
```
modelColor.delete();
```

### View

This project uses the [White Label View](https://github.com/bshack/white-label-view). Full Documentation is available on the project page.

####Let's look at an example:

import the view module
```
import View from 'white-label-view';
```
create the view
```
const MyView = class extends View {
    initialize() {
        this.addListeners();
    }
    addListeners() {
        window.addEventListener('scroll', (e) => {
            window.console.log('window is scrolling', e);
        }, false);
    }
};
```
instantiate the view
```
const myView = new MyView();
```
initialize the view
```
myView.initialize();
```

### Mediator

This project uses the [White Label Mediator](https://github.com/bshack/white-label-mediator). Full Documentation is available on the project page.

A mediator pattern (also sometimes called pub/sub) is an event bus for messaging between views. It's strength is in that it decouples views from one another because you are not directly binding events between views. You simply are broadcasting a message through the mediator that other views throughout the application can listen and react to as needed.

####Let's look at an example:

import the mediator module
```
import Mediator from 'white-label-mediator';
```
instantiate the mediator
```
const myMediator = new Mediator();
```
import the view module
```
import View from 'white-label-view';
```
create the first view to listen to the mediator for a 'window-scrolling' message
```
const MyView1 = class extends View {
    initialize() {
        this.addListeners();
    }
    addListeners() {
        myMediator.on('window-scrolling', (data) => {
            window.console.log('MyView2 is messaging that the window is scrolling', data);
        });
    }
};
```
create the second view to emit through the mediator the 'window-scrolling' event as the window scrolls and pass the event object along
```
const MyView2 = class extends View {
    initialize() {
        this.addListeners();
    }
    addListeners() {
        window.addEventListener('scroll', (e) => {
            myMediator.emit('window-scrolling', e);
        }, false);
    }
};
```
instantiate the views
```
const myView1 = new MyView1();
const myView2 = new MyView2();
```
initialize the views
```
myView1.initialize();
myView2.initialize();
```

### Router

This project uses the [White Label Router](https://github.com/bshack/white-label-router). Full Documentation is available on the project page.

####Let's look at an example:

import the module
```
import Router from 'white-label-router';
```
extend the router
```
const MyRoute = class extends Router {
    // this is the constructor. This executed whenever the view is instantiated.
    constructor() {
        // always do this
        super();
        this.routes = {
            defaultRoute: () => {
                //here you would put any view specific logic for the defaultRoute
                window.console.log('the defaultRoute executed');
            },
            page2: () => {
                //here you would put any view specific logic for the page2 route
                window.console.log('the page2 route executed');
            }
        };
    }
};
```
instantiate your router
```
const myRoute = new MyRoute();
```
initialize your router

```
myRoute.initialize();
```
In the example above we have set up two routes. The first route 'defaultRoute' is a catch all route. If no other routes match the current hash this is the route that will be executed. In this example the defaultRoute would execute for 'http://example.com' or 'http://example.com/#home' but not 'http://example.com/#page2'.

The second route 'page2' will only be executed when the hash matches exactly 'page2', or for example 'http://example.com/#page2'.

## Bugs or Feature Requests?

Pull request or log a ticket :)
