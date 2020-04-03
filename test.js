'use strict'

/*
 * This is an advanced example that demonstrates facts with dependencies
 * on other facts.  In addition, it demonstrates facts that load data asynchronously
 * from outside sources (api's, databases, etc)
 *
 * Usage:
 *   node ./examples/04-fact-dependency.js
 *
 * For detailed output:
 *   DEBUG=json-rules-engine node ./examples/04-fact-dependency.js
 */

require('colors')
var jsonRulesEngine = require('json-rules-engine').Engine;
var engine = new jsonRulesEngine();

engine.addOperator('startsWith', (factValue, jsonValue) => {
  if (!factValue.length) return false
  return factValue.toLowerCase().startsWith(jsonValue.toLowerCase());
})
engine.addOperator('startsWith-sensitive', (factValue, jsonValue) => {
  if (!factValue.length) return false
  return factValue[0].startsWith(jsonValue);
})

engine.addOperator('endsWith', (factValue, jsonValue) => {
  if (!factValue.length) return false
  return factValue[0].toLowerCase().endsWith(jsonValue.toLowerCase());
})
engine.addOperator('endsWith-sensitive', (factValue, jsonValue) => {
  if (!factValue.length) return false
  return factValue[0].endsWith(jsonValue.toLowerCase());
})

engine.addOperator('contains', (factValue, jsonValue) => {
  if (!factValue.length) return false
  console.log(jsonValue)
  return factValue.toLowerCase().includes(jsonValue.toLowerCase());
})

engine.addOperator('notContains', (factValue, jsonValue) => {
  if (!factValue.length) return false
  return !factValue.toLowerCase().includes(jsonValue.toLowerCase());
})

engine.addOperator('contains-sensitive', (factValue, jsonValue) => {
  if (!factValue.length) return false
  return factValue.includes(jsonValue);
})

engine.addOperator('notContains-sensitive', (factValue, jsonValue) => {
  if (!factValue.length) return false
  return !factValue.includes(jsonValue);
})

engine.addOperator('between', (factValue, jsonValue) => {
  if (!factValue) return false
  return ((factValue > jsonValue[0]) && (factValue < jsonValue[1]) );
})
engine.addOperator('betweenInclusive', (factValue, jsonValue) => {
  if (!factValue) return false
  return ((factValue >= jsonValue[0]) && (factValue <= jsonValue[1]) );
})

engine.addRule({
    conditions: {
      all: [
        { fact: 'Price', operator: 'betweenInclusive', value: [5, 40] }
      ]
    },
    event: {  // define the event to fire when the conditions evaluate truthy
      type: 'fouledOut',
      params: {
        message: 'Player has fouled out!'
      }
    }
  })
  
  /**
   * Define facts the engine will use to evaluate the conditions above.
   * Facts may also be loaded asynchronously at runtime; see the advanced example below
   */
  let facts = {
    Category: 'Bla Ha Show',
    Price: 40,
    Name: 1,
    Current_Inventory: 1
  }
  
  // Run the engine to evaluate
  engine
    .run(facts)
    .then(results => {
      // 'results' is an object containing successful events, and an Almanac instance containing facts
      results.events.map(event => console.log(event.params.message))
    })