# good-http

Http(s) broadcasting for Good process monitor

[![Build Status](https://travis-ci.org/hapijs/good-http.svg?branch=master)](https://travis-ci.org/hapijs/good-http)
[![Current Version](https://img.shields.io/npm/v/good-http.svg)](https://www.npmjs.com/package/good-http)

Lead Maintainer: [Adam Bretz](https://github.com/arb)

## Usage

`good-http` is a write stream use to send event to remote endpoints in batches. It makes a "POST" request with a JSON payload to the supplied `endpoint`. It will make a final "POST" request to the endpoint to flush the rest of the data on "finish".

## Good Http
### GoodHttp (endpoint, config)

Creates a new GoodHttp object where:

- `endpoint` - full path to remote server to transmit logs.
- `config` - configuration object
  - `[threshold]` - number of events to hold before transmission. Defaults to `20`. Set to `0` to have every event start transmission instantly. It is strongly suggested to have a set threshold to make data transmission more efficient.
  - `[errorThreshold]` - number of consecutive failed transmissions allowed (`ECONNRESET`, `ECONNREFUSED`, etc). Defaults to `0`. Failed events will be included in the next transmission until they are successfully logged or the threshold is reached (whichever comes first) at which point they will be cleared. Set to `null` to ignore all errors and always clear events.
  - `[wreck]` - configuration object to pass into [`wreck`](https://github.com/hapijs/wreck#advanced). Defaults to `{ timeout: 60000, headers: {} }`. `content-type` is always "application/json".


### Schema

Each POST will match the following schema. The payload that is POSTed to the `endpoint` has the following schema:

```json
{
  "host":"servername.home",
  "schema":"good-http",
  "timeStamp":1412710565121,
  "events":[
      {
        "event":"request",
        "timestamp":1413464014739,
        ...
      },
      {
        "event":"request",
        "timestamp":1414221317758,
        ...
      },
      {
        "event":"request",
        "timestamp":1415088216608,
        ...
      }
      {
        "event":"log",
        "timestamp":1415180913160,
        ...
      },
      {
        "event":"log",
        "timestamp":1422493874390,
        ...
      }
  ]
}
```
