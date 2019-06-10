"use strict";
const TextLintTester = require("textlint-tester");
const tester = new TextLintTester();
// rule
const rule = require("../src/index");
// ruleName, rule, { valid, invalid }
tester.run("rule", rule, {
  valid: [
    // no problem
    "〜です(注:注釈文です。)。",
    "〜ですが(注:注釈文です。)、〜"
  ],
  invalid: [
    // single match

    // multiple match
    {
      text: `〜です(注:注釈文です)。〜です。(注:注釈文です。)`,
      errors: [
        {
          message: "注釈文の終わりに句読点がありません"
        },
        {
          message: "注釈文の括弧前に句読点があります"
        }
      ]
    },
    {
      text: `〜です(注:注釈文です).


〜です. (注:注釈文です.)`,
      errors: [
        {
          message: "注釈文の終わりに句読点がありません"
        },
        {
          message: "注釈文の括弧前に句読点があります"
        }
      ]
    }
  ]
});
