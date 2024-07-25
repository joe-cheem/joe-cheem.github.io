// everything.js

// Create a Proxy that represents the concept of "everything"
const everything = new Proxy(function() {}, {
  // When accessing any property of "everything", it returns "everything" itself
  // This represents the idea that any part of everything is still everything
  get: (_, prop) => everything,

  // When calling "everything" as a function:
  // - If given an argument, it returns that argument (everything can be anything specific)
  // - If no argument is given, it returns "everything" itself (everything remains everything)
  apply: (_, __, args) => args.length ? args[0] : everything,

  // When using "everything" as a constructor (with 'new'), it returns "everything" itself
  // This suggests that creating from everything still results in everything
  construct: () => everything
});

// Add a toString method to provide a string representation
everything.toString = () => "everything";

// Add a valueOf method to provide a numeric representation
everything.valueOf = () => Infinity;

// Export the 'everything' object for use in other modules or scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = everything;
} else if (typeof window !== 'undefined') {
  window.everything = everything;
}

// Run some tests if this script is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  console.log("Running tests:");
  console.log("everything === everything.anything:", everything === everything.anything);
  console.log("everything === everything():", everything === everything());
  console.log("everything === new everything():", everything === new everything());
  console.log("everything(42) === 42:", everything(42) === 42);
  console.log("everything.is.nothing.and.everything === everything:", everything.is.nothing.and.everything === everything);
  console.log("String(everything):", String(everything));
  console.log("Number(everything):", Number(everything));
}