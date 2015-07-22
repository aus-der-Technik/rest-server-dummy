#!/usr/bin/env node 

/**
# ----------------------------------------
# rest-server-dummy
# ----------------------------------------
# Dummy restserver to test GET, POST and 
# PUT in your client.
# 
# ausdertechnik.de 2015 
# ----------------------------------------
*/

// require the project modules 
var   path 					= require('path')
	, fs 					= require('fs')
	, events 				= require('events')
	, async					= require('async')
	, _						= require('underscore')
	, S						= require('string')
	, restify 				= require('restify')
	, mkdirp 				= require('mkdirp')
	;
	
/**
 * Global eventEmitter
 * @var object eventEmitter
 */
var eventEmitter = 		new events.EventEmitter();

/** 
 * The REST-Server
 * @var object server 
 */
var server = restify.createServer(_.extend({
	'acceptable': 'application/json'
},{
    "name": "restsserver",
    "version": ["1.0.0"],
    "throttle": {
        "rate": 10,
        "burst": 10,
        "ip": false,
        "xff": true
    }
}));

// pass X-Domain check 
server.use(
  function crossOrigin(req,res,next){
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    return next();
  }
);

// Configure the server
server.use(restify.authorizationParser());
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS({origins: ['*']}));
server.use(restify.fullResponse());

server.pre(restify.pre.userAgentConnection());


// set response header
server.use(function(req, res, next){
	var directory = (documentDirectory + req.url).split(path.sep);
	directory.pop();
	var filename = directory.join(path.sep) + '/' + path.basename(req.url, path.extname(req.url)) + '.response';
	fs.readFile( filename, {encoding: "utf-8"}, function (err, data) {
		if (err) return next();
		var headers = JSON.parse(data);			
		_.each(_.keys(headers), function(key){
			res.header(key, headers[key]);		
		});
		next();
	});
});

// Error handling
server.on('uncaughtException', function error(req, res, route, err){
	console.log("ROUTE", route);
	console.log("ERROR", err);
	var ERR = require("async-stacktrace");
	ERR(err, function callback(stack){
		// log to "told log recorder"
	 	console.error(stack.toString(), stack.stack);
	});
});

// ROUTES
var documentDirectory = process.env.DIRECTORY || process.cwd();

server.get('(.*)'
	, function(req, res, next){
		eventEmitter.emit('write::headers', req.url, _.clone(req));
		if(S(req.url).endsWith('/') == true){
			req.url = req.url + 'index.json';
		}
		if(S(req.url).endsWith('.json') == false){
			req.url = req.url + '.json';
		}
		fs.exists( documentDirectory + req.url, function documentIsAvailabel(exists){
			if(exists){ 
				fs.readFile( documentDirectory + req.url, {encoding: "utf-8"}, function (err, data) {
					
					if (err) return res.send(500, err);
					res.send(200, JSON.parse(data));
					return next();					
				});
			} else {
				return res.send(404);
			}
		});
	}	
);

server.post('(.*)'
	, function(req, res, next){
		eventEmitter.emit('write::headers', req.url, _.clone(req));
		if( typeof req.body === 'string'){
			req.body = JSON.parse(req.body);
		}
		if(S(req.url).endsWith('/') == true){
			req.url = req.url + 'index.json';
		}
		if(S(req.url).endsWith('.json') == false){
			req.url = req.url + '.json';
		}		
		fs.writeFile( documentDirectory + req.url, JSON.stringify(req.body, null, 2), {encoding: "utf-8"}, function (err, data) {
			if (err) return res.send(500, err);
			res.send(201, req.body);
			return next();					
		});
	}	
);

server.put('(.*)'
	, function(req, res, next){ 
		eventEmitter.emit('write::headers', req.url, _.clone(req));
		var document = {};
		if(S(req.url).endsWith('/') == true){
			req.url = req.url + 'index.json';
		}
		if(S(req.url).endsWith('.json') == false){
			req.url = req.url + '.json';
		}		
		fs.exists( documentDirectory + req.url, function documentIsAvailabel(exists){
			async.waterfall([
				function(callback){
					if(exists){ 
						fs.readFile( documentDirectory + req.url, {encoding: "utf-8"}, function (err, data) {
							if (err) return callback(err, null);	
							return callback(null, JSON.parse(data));	
						});
					} else {
						return callback(null, {});
					}
				}
				, function(results, callback){
					if( typeof req.body === 'string'){
						req.body = JSON.parse(req.body);
					}
					var data = _.extend(req.body, results || {} );
					
					fs.writeFile( documentDirectory + req.url, JSON.stringify(data, null, 2), {encoding: "utf-8"}, function (err) {
						if (err) return callback(err);
						return callback(null, data);		
					});
				}
			], function(err, result){
				if(err) return res.send(500, err);
				res.send(200, result);
			});		
		});
	}	
);

server.del('(.*)'
	, function(req, res, next){ 
		eventEmitter.emit('write::headers', req.url, _.clone(req));
		var document = {};
		if(S(req.url).endsWith('/') == true){
			req.url = req.url + 'index.json';
		}
		if(S(req.url).endsWith('.json') == false){
			req.url = req.url + '.json';
		}		
		fs.exists( documentDirectory + req.url, function documentIsAvailabel(exists){
			if(exists == false) return res.send(404);
			fs.unlink(documentDirectory + req.url, function(err){
				if(err) return res.send(500, err);
				var directory = (documentDirectory + req.url).split(path.sep);
				directory.pop();
				var filename = directory.join(path.sep) + '/' + path.basename(req.url, path.extname(req.url)) + '.request';				
				fs.unlink(filename, function(err){
					eventEmitter.emit('remove::directorytree', directory.join(path.sep));
				});
				res.send(200);
			});
		})
	}
);
	

/** 
 * EVENTS
 */
// write header
eventEmitter.on('write::headers', function(url, data){
	var directory = (documentDirectory + url).split(path.sep);
	directory.pop();
	var filename = directory.join(path.sep) + '/' + path.basename(url, path.extname(url)) + '.request';
	mkdirp(directory.join(path.sep), function (err) {
		if(err) return;
		fs.writeFile(filename, JSON.stringify(data.headers, null, 2), null);
	});
});

eventEmitter.on('remove::directorytree', function(directory){
	var rmdir = function rmdir(directory){
		var directories = directory.split(path.sep);
		fs.readdir(directories.join(path.sep), function ls(err, files){
			files = _.filter(files, function(file){
				if(file != '.' && file != '..') return true; 
				return false;
			});
			if(files.length == 0) {
				fs.rmdir(directory, function(err){
					directories.pop();
					rmdir(directories.join(path.sep));
				});			
			}
		});
	};
	rmdir(directory);
});

// START
server.listen(process.env.PORT || 8080, function() {
	console.log('%s listening at %s', server.name, server.url);
	console.log('writing files to ', documentDirectory);
});

