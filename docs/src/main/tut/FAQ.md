---
layout: docs
title: FAQ
section: en
position: 3
---

# Frequently Asked Questions
### How it's different from redux?

unlike redux, xreact turn FRP to 11 in react, it model problem different

- "global" intent stream(using redux's word should be intent store) not global state store
- there's not such thing as state store, no state will store anywhere, only state transformations
- FRP lib as your choice, choose any lib your familiar with

### How it's different from cycle.js?

think xreact as a more specify and optimized cycle just for react.

### Why not global state?
global is state is not scalable, think it as a database, and every component query data from it,however, database are hard to scale, design and maintain.

instead of making state global, we think a better choice of doing such reversely, just have what you want to do(intent) globally instead. So, every component can just broadcast what it's trying to do, but only focus on how to reduce intent into a state transformation for it self.

In this case, one component won't need worry about how the global state structure, and just focus on itself. So, components are more modular and decoupled.

Furher more, it's composable, we can build small x component constructors and compose them at will to create a bigger and powerfult component constructors. It's much easier and flexible by compose small behavior and state into a big component, not destruct a big global state into small components.
