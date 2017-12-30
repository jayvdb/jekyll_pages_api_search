#! /usr/bin/env node
'use strict'

var path = require('path')
var express = require('express')
var app = express()
var port = process.argv[2]

app.use(express.static(path.resolve(__dirname, '..')))
app.listen(port)
console.log(path.basename(__filename) + ' listening on port', port)
