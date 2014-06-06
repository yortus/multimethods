import references = require('references');
import sync = require('./sync');
import async = require('./async');
export var create = sync.create;
export var createAsync = async.createAsync;
