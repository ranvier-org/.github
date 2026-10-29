# Ranvier

> The Nodes of Ranvier are the gaps in the insulating sheath that cover a neurons axon/arm. They regenerate the electric potential at these points, allowing passive conduction along the insulated path. This allows a speed and efficiency that is multiples of a completely uninsulated neuron arm.

Ranvier is, at its core, a fine-grained reactive computation library for .NET It's unique feature within the .NET family of reactive computation packages is the native Async and Error handling within the graph - heavily inspired by the fantastic work of the solid-js v2 team. Their implementation showed how great the development experience is with this native handling.

The reactive graph supports typical UI and resource intense computation use-cases in .NET, with C# and F# support. It is completely x-plat, with browser support through WASM & *JavaScript transpilation (only available to F# via Fable compiler)*.

Currently, F# is the only language to natively support the bespoke front-end framework built ontop of Ranvier. The framework compiles to fine grained DOM updates, with SSR and hydration support for the browser; compiles to native apps through a custom WebCore build and ABI that directly calls upon the CPP DOM engine in-process.
