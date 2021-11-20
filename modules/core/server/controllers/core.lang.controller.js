'use strict';

var url = require('url');
var fs = require('fs');

/**
 * Render the server not found responses
 * Performs content-negotiation on the Accept HTTP header
 */
exports.getLanguaje = function (req, res) {
  function answer(code, data) {
    res.writeHead(code, {
      'Content-Type': 'application/json;charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'X-Requested-With'
    });
    res.end(data);
  }

  var _get = url.parse(req.url, true).query;

  fs.readFile('./l10n/' + _get.lang + '.json', function (err, data) {
    if (err) answer(404, '');
    else answer(200, data);
  });
};

exports.varsConfig = function (req, res) {
  if (!req.params.itemjson) {
    res.json({});
    return true;
  }

  var allow = {
    socketsConfig: true,
    app: true,
    geocoderConfig: true
  };

  if (!allow[req.params.itemjson]) {
    res.json({});
    return true;
  }

  var path = require('path');
  var config = require(path.resolve('./config/config'));

  if (!config[req.params.itemjson]) {
    res.json({});
    return true;
  }

  res.json(config[req.params.itemjson]);
};
