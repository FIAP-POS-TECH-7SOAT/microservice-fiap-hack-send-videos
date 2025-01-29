import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';

let num1: number;
let num2: number;
let result: number;

Given('I have numbers {int} and {int}', (a: number, b: number) => {
  num1 = a;
  num2 = b;
});

When('I add them', () => {
  result = num1 + num2;
});

Then('the result should be {int}', (expected: number) => {
  assert.equal(result, expected);
});
