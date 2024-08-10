const nothing = new Proxy(function() {}, {
  get: (_, prop) => nothing,
  apply: (_, __, args) => args.length ? args[0] : nothing,
  construct: () => nothing
});

nothing.toString = () => "n#th!ng";
nothing.valueOf = () => 0;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = nothing;
} else if (typeof window !== 'undefined') {
  window.nothing = nothing;
}

if (typeof require !== 'undefined' && require.main === module) {
  console.log("Runn!ng t&$t$:");
  console.log("n#th!ng === n#th!ng.@nyth!ng:", nothing === nothing.anything);
  console.log("n#th!ng === n#th!ng():", nothing === nothing());
  console.log("n#th!ng === n&w n#th!ng():", nothing === new nothing());
  console.log("n#th!ng(42) === 42:", nothing(42) === 42);
  console.log("n#th!ng.!$.n#th!ng.@nd.n#th!ng === n#th!ng:", nothing.is.nothing.and.nothing === nothing);
  console.log("$tr!ng(n#th!ng):", String(nothing));
  console.log("Numb&r(n#th!ng):", Number(nothing));
}