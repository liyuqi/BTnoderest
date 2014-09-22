//curl -i -X POST -H "Content-Type: application/json" -d '{"title":"NodeJS Developer Required" , "description":"NodeJS Developer Required" , "location":"Sector 30, Gurgaon, India"}' http://127.0.0.1:8080/jobs

var restify = require('restify');
var mongojs = require("mongojs");
var os = require('os');
var ip = require('ip');

var ip_addr = ip.address();
var port    =  '8006';

var server = restify.createServer({
    name : "myapp"
});

server.listen(port ,ip_addr, function(){
    console.log('%s listening at %s ', server.name , server.url);
});

server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());


var connection_string = '127.0.0.1:27017/events';
var db = mongojs(connection_string, ['events']);
var collection = db.collection("events");


var PATH = '/events'
server.get({path : PATH , version : '0.0.1'} , findLogs);
server.get({path : PATH +'/:oid' , version : '0.0.1'} , findLog);
server.get({path : PATH +'.count' , version : '0.0.1'} , countLog);

server.get({path : PATH +'.page/:page', version : '0.0.1'} , findLogsPage);
server.get({path : PATH +'.agg', version : '0.0.1'} , agg);

server.post({path : PATH , version: '0.0.1'} ,insertLog);
server.del({path : PATH +'/:oid' , version: '0.0.1'} ,deleteLog);

server.get({path : PATH +'.runCmd', version : '0.0.1'} , runCmd);

function findLogs(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    collection.find().limit(20).sort({postedOn : -1} , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(200 , success);
            return next();
        }else{
            return next(err);
        }
    });
}

function findLog(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    collection.findOne({_id:mongojs.ObjectId(req.params.oid)} , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(200 , success);
            return next();
        }
        return next(err);
    })
}

function findLogsPage(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    collection.find().limit(20).skip(req.params.page*20).sort({postedOn : -1} , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(200 , success);
            return next();
        }else{
            return next(err);
        }
    });
}

function countLog(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    collection.count(function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(200 , success);
            return next();
        }else{
            return next(err);
        }
    });
}

function agg(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
	var query = [
		{	$group : {_id : {level : "$level"},
						count : {$sum : 1}
		}},{$project : {level : 1,	count : 1	}
		}
	];
    collection.aggregate(query , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(200 , success);
            return next();
        }else{
            return next(err);
        }
    });
}



function insertLog(req , res , next){
    var event = {};
    event.level = req.params.level;
    event.ip = req.params.ip;

    res.setHeader('Access-Control-Allow-Origin','*');

    collection.save(event , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(201 , event);
            return next();
        }else{
            return next(err);
        }
    });
}

function deleteLog(req , res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    collection.remove({_id:mongojs.ObjectId(req.params.oid)} , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(204);
            return next();      
        } else{
            return next(err);
        }
    })
}

function runCmd(req , res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    db.runCommand({ping:1} , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(204);
            return next();      
        } else{
            return next(err);
        }
    })
}


/*
function runCmd(req , res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    db.runCommand({ping:1} , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(204);
            return next();      
        } else{
            return next(err);
        }
    })
}

*/


/*
*****db.collection.aggregate([pipeline], [callback])
*db.collection.count([query], callback)
db.collection.createIndex(keys, options, [callback])
*db.collection.distinct(field, query, callback)
-db.collection.drop([callback])
-db.collection.dropIndex(index, [callback])
-db.collection.dropIndexes([callback])
db.collection.ensureIndex(keys, options, [callback])
*****db.collection.find([criteria], [projection], [callback])
*****db.collection.findOne([criteria], [projection], callback)
db.collection.findAndModify(document, callback)
db.collection.getIndexes(callback)
db.collection.group(document, callback)
*****db.collection.insert(docOrDocs, [callback])
+db.collection.isCapped(callback)
***db.collection.mapReduce(map, reduce, options, [callback])
+db.collection.reIndex([callback])
*****db.collection.remove(query, [justOne], [callback])
+db.collection.runCommand(command, [callback])
*****db.collection.save(doc, [callback])
+db.collection.stats(callback)
*****db.collection.update(query, update, [options], [callback])
db.addUser(document)
db.createCollection(name, options, [callback])
-db.dropDatabase([callback])
db.eval(code, [params], [options], [callback])
+db.getCollectionNames(callback)
+db.getLastError(callback)
+db.getLastErrorObj(callback)
db.removeUser(username, [callback])
+db.runCommand(command, [callback])
+db.stats([callback])
-db.close()
*/