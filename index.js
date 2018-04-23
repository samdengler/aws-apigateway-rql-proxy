'use strict';

const http = require('http');
const https = require('http');
const query = require("rql/query");
const rqlKeywords = [...query.knownOperators, ...query.knownScalarOperators, ...query.arrayMethods].map(x => `${x}(`);
const DEFAULT_CONTENT_TYPE = "application/json";

exports.handler = async (event, context, callback) => {
  console.log("\nEVENT\n", JSON.stringify(event, null, 2));
  validateEvent(event, callback);

  var options = buildOptions(event);
  console.log("\nOPTIONS\n", JSON.stringify(options, null, 2));

  try {
    const response = await makeRequest(options, event.body);
    const data = {
      statusCode: response.statusCode,
      headers: response.headers,
      body: response.body
    };
    console.log("\nRESPONSE\n", JSON.stringify(data, null, 2));
    callback(null, data);
  } catch (err) {
    console.log('request error: ' + err.message);
    callback(null, {
      statusCode: 500,
      headers: {},
      body: JSON.stringify({ message: "Internal server error" })
    });
  }
}

async function makeRequest(options, body) {
  return new Promise((resolve, reject) => {
    const lib = options.port == 443 ? require('https') : require('http');

    const request = lib.request(options, (response) => {
      if (response.statusCode < 200 || response.statusCode > 299) {
         reject(new Error('Failed to load page, status code: ' + response.statusCode));
       }
      const responseBody = [];
      response.on('data', (chunk) => responseBody.push(chunk));
      response.on('end', () => resolve(
        Object.assign({ body: responseBody.join('') }, response)
      ));
    });

    if (body && body !== "") {
      request.write(body);
    }

    request.on('error', (err) => reject(err))
    request.end();
  });
}

function buildOptions(event) {
  var options = {
    host: event.stageVariables.proxyHost,
    port: event.stageVariables.proxyPort,
    path: event.path,
    method: event.httpMethod,
    headers: event.headers
  };

  if (!event.headers["Content-Type"]) {
    event.headers["Content-Type"] = DEFAULT_CONTENT_TYPE;
  }

  var queryString = rqlQueryString(event.queryStringParameters);
  if (queryString !== "") {
    options.path += "?" + queryString;
  }

  return options;
}

function isRqlKeyword(key) {
  return rqlKeywords.find(x => {
    return key.startsWith(x)
  });
};

function rqlQueryString(queryStringParameters) {
  const rqlQueryStringParameters = Object.entries(queryStringParameters).map(x =>
    isRqlKeyword(x[0]) && x[1] === "" ? x[0] : x.join('=')
  );
  return rqlQueryStringParameters.join('&');
}

function validateEvent(event, callback) {
  var errorMessage = null;

  if (event.stageVariables == null) {
    errorMessage = "event.stageVariables is required";
  } else if (event.stageVariables.proxyHost == null) {
    errorMessage = "event.stageVariables.proxyHost is required";
  } else if (event.stageVariables.proxyPort == null) {
    errorMessage = "event.stageVariables.proxyPort is required";
  }

  if (errorMessage != null) {
    callback(null, {
      statusCode: 500,
      headers: {},
      body: JSON.stringify({ message: errorMessage })
    });
  }
}
