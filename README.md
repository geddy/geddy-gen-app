Experimental app generator for the [geddy.js](http://geddyjs.org) MVC framework.

1. Clone this repository into your local node_modules folder under geddy-gen-app/.
2. Clone the [geddy generator-revamp branch](https://github.com/der-On/geddy/tree/generator-revamp) in your local node_modules folder under geddy-gen-revamp/ or similar.
3. Create a simlink named "geddy-gen-revamp" to the geddy-generator-revamp/bin/cli.js in your /bin folder.

Then run:

    $ geddy-gen-revamp gen app create[some app name]

And watch the magic happen.