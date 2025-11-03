# Mock Packages

This directory contains mock packages used for testing arbitrary specifier/tag combinations.

## snoot

A mock package that exports a `boop` function, used to test that transformers work with custom packages beyond just `lit` and `@microsoft/fast-element`.

The package is symlinked into the root `node_modules` directory so it's available during tests.
