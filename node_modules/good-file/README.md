# good-file

Simple Node write stream to write to a file.

![Build Status](https://travis-ci.org/hapijs/good-file.svg?branch=master)![Current Version](https://img.shields.io/npm/v/good-file.svg)

Lead Maintainer: [Adam Bretz](https://github.com/arb)

## Good File

This is a basic write stream wrapper of Node core `Fs.createWriteStream()`. The advantage is `GoodFile` will create the file and directory if they do not already exist.

### `new GoodFile (path, options)`

Creates a new GoodFile write stream.
- `path` a string for the file to write to. Will be created *only* if needed.
- `[options]` optional file stream options. Defaults to `{ encoding: 'utf8', flags: 'a', mode: 0o666 }`. `fd` will always default to -1 during object construction. For more information about options, refer to the [Node documentation](https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options)

## Rotation

If you're looking for a stream with built-in rotation options, please check out [stream-rotate](https://github.com/nw/stream-rotate) or [rotating-file-stream](https://github.com/iccicci/rotating-file-stream). good-file no longer does file rotation because there are better ways to deal with log rotation at the operating system level.
