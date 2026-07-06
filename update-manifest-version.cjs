#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

const manifest = JSON.parse(fs.readFileSync('./manifest.json', 'utf8'));

manifest.version = pkg.version;

fs.writeFileSync('./manifest.json', JSON.stringify(manifest, null, 2) + '\n');

console.log(`Updated manifest.json version to ${pkg.version}`);
