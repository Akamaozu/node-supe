# [Supe](../README.md) > Intro

## Why You Should Care About Fault Tolerance

Your coworkers, mentors and heroes write faulty code. **You** write faulty code.

JavaScript isn’t particularly forgiving when code fails, so your app rolls over and stays dead. While we have many tools for bringing a dead Node.js app back to life, we typically don’t structure them in ways that limit the problem's impact on the app.

**Fault Tolerance reduces the impact problems have on your app**. At worst you’ll have a bottleneck in a component, but it won’t bring everything else to a grinding halt, or worse yet, send it to the big farm in the cloud.

## Why You Should Try A Framework for Fault Tolerance

You definitely don’t need one but a framework makes it **really easy to start** making things more fault-tolerant while providing **a common platform for building, sharing ideas and tools** the same way Express.js does for writing web servers.

## How Supe Can Help

While making your app more fault-tolerance is very rewarding, it is a VERY HARD THING™.

- You need ways to communicate between formerly-cozy components.
- Each component now outputs data to a different stdout.
- Even though each component is still single-threaded, your overall application is now multi-threaded.

This is just the tip of the iceberg of concerns introduced by trying to be fault-tolerance.

Supe helps by providing good default solutions for these problems and allows you to modify (or overwrite) any particular one so you can implement the solution that works best for your specific challenge.