# Supe
## Fault-Tolerant Node.js Programs

[![npm version](https://badge.fury.io/js/supe.svg)](https://badge.fury.io/js/supe) [![travis ci](https://travis-ci.org/Akamaozu/node-supe.svg?branch=master)](https://travis-ci.org/Akamaozu/node-supe) [![Coverage Status](https://coveralls.io/repos/github/Akamaozu/node-supe/badge.svg?branch=master)](https://coveralls.io/github/Akamaozu/node-supe?branch=master)

Node.js makes it easy (and quick) to write a useful program.

**Unfortunately, there's only so much you can do in one event loop before things start stepping on each other's toes**. It only takes one slow/busy component to bring the rest of the program to its knees.

**Supe is a two-pronged approach to writing safer Node.js programs**:
1. Make it easy to put parts of your program into private Node.js instances.
2. Provide tools that make working with multiple Node.js instances a breeze.

**The resultant program is safer because faults are isolated on a per-component basis, and likely faster because it utilizes multiple event loops**.

![Multiple Node.js instances working together](http://public.designbymobi.us/img/node-satellite-error.jpg)
Output from [TorontoJS Workshop Satellite](https://github.com/Akamaozu/workshop-satellite).

# Install
```js
npm install --save supe
```

# [Why Supe](docs/why.md)
A few reasons why you should use Supe.

# [Getting Started](docs/getting-started.md)
Handy guide to help you quickly get started with Supe.

# [Core Components](docs/core-components.md)
The pieces that make up Supe's core and how to use them.

# Add-ons
An easy way to get more out of Supe is using (or creating + sharing your own) Supe add-ons.

Some examples:
- [Supervisor Add-On: Log Citizen Output](https://github.com/Akamaozu/supe-addon-log-citizen-output)
- [Supervisor Add-On: Log Citizen Lifecycle](https://github.com/Akamaozu/supe-addon-log-citizen-lifecycle)
