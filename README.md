
<!-- <img width="64px" height="64px" src="./extras/multimethods-logo.png" alt="Logo" /> -->
![Multimethods](./extras/multimethods-title.png)


Create fast and flexible [multimethod](https://en.wikipedia.org/wiki/Multiple_dispatch) functions in JavaScript. Use them for dynamic dispatch (like virtual methods but more flexible), or for pattern-matched control flow.

A multimethod looks and acts like an ordinary function from the outside. On the inside, a multimethod consists of any number of alternative *methods*, each of which provides a different implementation depending on the kinds of arguments passed to the multimethod. When a multimethod is called, the arguments are examined and the call is forwarded to the best-matching method.

The multimethod creator specifies how arguments are examined and matched to methods, via a flexible pattern-matching system based on [discriminants and patterns](#discriminants-and-patterns).

Additional features:
- TypeScript users can take advantage of extensive type checking and type inference when working with multimethods.
- Multimethods are immutable. When a multimethod is extended with new methods, a new multimethod is created, and the base multimethod remains unchanged.
- Both synchronous and asynchronous (i.e., `Promise`-returning) multimethods are supported.
- Dynamically dispatch based on any kind or number of arguments.
- Dispatch behaviour is guaranteed to be deterministic and unambiguous.




## Installation
```
npm add multimethods
```




## Usage
```ts
// TypeScript implementation of the example from the wikipedia page:
// (https://en.wikipedia.org/wiki/Multiple_dispatch)
interface SpaceObject { type: string; }
interface Asteroid extends SpaceObject { type: 'asteroid', /* ...more props */ }
interface Spaceship extends SpaceObject { type: 'spaceship', /* ...more props */ }

const collideWith = Multimethod((x: SpaceObject, y: SpaceObject) => `${x.type}/${y.type}`).extend({
    'asteroid/asteroid': (_, x: Asteroid, y: Asteroid) => { /* deal with asteroid hitting asteroid */ },
    'asteroid/spaceship': (_, x: Asteroid, y: Spaceship) => { /* deal with asteroid hitting spaceship */ },
    'spaceship/asteroid': (_, x: Spaceship, y: Asteroid) => { /* deal with spaceship hitting asteroid */ },
    'spaceship/spaceship': (_, x: Spaceship, y: Spaceship) => { /* deal with spaceship hitting spaceship */ },
    '{t1}/{t2}': ({t1, t2}) => { throw new Error(`Don't know how to collide ${t1} with ${t2}`); },
});
```




## API

```ts

// Multimethod constructor / factory function
function Multimethod(discriminator: (...args: ArgTypes) => string | Promise<string>): Multimethod;

// Multimethod instance
type Multimethod = {

    // Call the multimethod like an ordinary function.
    (...args: ArgTypes): Result | Promise<Result>;

    // Create a new multimethod extended with additional methods.
    extend({
        '<pattern 1>': (patternbindings, arg1, arg2, ...) => Result | Promise<Result>,
        '<pattern 2>': (patternbindings, arg1, arg2, ...) => Result | Promise<Result>,
        ...
    }): Multimethod;

    // Create a new multimethod extended with additional decorators.
    decorate({
        '<pattern 1>': (patternbindings, method: Function, args: ArgTypes) => Result | Promise<Result>,
        '<pattern 2>': (patternbindings, method: Function, args: ArgTypes) => Result | Promise<Result>,
        ...
    }): Multimethod;
};

```



## Discriminants and Patterns
When a multimethod is called, the first thing it does is pass the arguments to the discriminator function to get the *discriminant* string. The discriminator function is the function that was passed to the constructor when the multimethod was created. The discriminator function has complete freedom to map multimethod arguments to a discriminant string in any way it chooses.

Once the discriminant string is known, is it matched against all the patterns associated with the multimethod's methods. This matching process is required to be unambiguous. In the simplest case, the best-matching method is chosen, and called with the arguments passed to the multimethod. Whatever this method returns is returned from the multimethod.

Various more advanced dispatching behaviours are supported, including:
- Multiple matching methods, tried from most-specific-match to least-specific-match.
- *Decorator* methods, which may observe and/or alter the arguments passed in, the value returned, and the control flow.

Two kinds of dispatching errors are detected and reported, depending on the set of patterns that match a given discriminant:
1. **Unhandled cases**: The set of matching patterns is empty - i.e., no method matches the discriminant.
2. **Ambiguous cases**: The set of matching patterns contains two or more patterns, where the patterns *cannot* be ordered unambiguously from most- to least-specific.




## License

[MIT © Troy Gerwien](./LICENSE)
