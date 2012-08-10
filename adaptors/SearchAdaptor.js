/**
 * Created by: Narcis ARMASU <narcis.armasu@trp.ro>
 * Date: 7/9/12
 */

var thisAdaptor;

var searchConfigLocation = 'etc/searchConfig';
var searchConfig = require('swarmutil').readConfig(searchConfigLocation);
//solr indexes
var cores = new Array();
var printDebugMsgs = true;
var DEBUG = true;
//require('assert');
var querystring = require('querystring');

var solr = require('solr-client');

function log(message, debug) {
    if (debug && printDebugMsgs) {
        console.log("[DEBUG] SEARCH_ADAPTOR: " + message);
    }
    else {
        console.log("SEARCH_ADAPTOR: " + message);
    }
}
function logErr(message) {
    console.error("SEARCH_ADAPTOR: " + message);
}

function initCoreClients() {
    var i;
    for (i in searchConfig.cores) {
        var client = solr.createClient({
            host:searchConfig.host,
            port:searchConfig.port,
            core:searchConfig.cores[i],
            path:'/solr'
        });
        cores[searchConfig.cores[i]] = client;
    }
    log("Created client for: " + i + " cores");
}

process.on('message', function (m) {
    //console.log('CHILD got message:', m);
    redisHost = m.redisHost;
    redisPort = m.redisPort;
    initCoreClients();
    thisAdaptor = require('swarmutil').createAdaptor("SearchAdaptor", redisHost, redisPort);
});

function getSolrClient(index) {
    if (!index) {
        index = searchConfig.defaultCore;
    }
    var core = cores[index];
    if (!core) {
        log("No SOLR client found for index: " + index);
    }
    return core;
}

addDoc = function (doc, index, callback) {

    var client = getSolrClient(index);
    getNumberOfDocuments(client, addDoc);
    function addDoc(numberOfDocs) {
        if (!doc.id) {
            doc.id = numberOfDocs + 1;
        }
        client.add(doc, function (err) {
            if (err) {
                logErr(err);
                callback(err);
            } else {
                log('Solr doc was added to the index ');
                client.commit(callback);
            }
        });
    }
}

addFile = function(fileURL,contentType,index, fileId, callback){
    log("start addFile - 1");
    var client = getSolrClient(index);

    getNumberOfDocuments(client, addFile);

    if(!contentType){
        contentType = "text/plain;charset=utf-8";
    }

    function addFile(numberOfDocs){
        var id = null;
        if(fileId){
            id = fileId;
        }else{
            id = numberOfDocs+1;
        }

        var options = {
            parameters : {'stream.contentType' : contentType, 'literal.id':'1', 'literal.category':'categ1'},
            path: fileURL,
            format : 'extract'
        }

        client.addRemoteResource(options,function(err,obj){
            if(err){
                console.log(err);
            }else{
                console.log(obj);
                client.commit(callback);
            }
        });
    }
}

searchFile = function(textSearched, category, index, searchParams, callBack){
    var query = "category:"+category + " AND " + '\''+ textSearched+ ' \'';
    var client = getSolrClient(index);
    if (!client) {
        logErr("Could not obtain client for index: " + index);
        return;
    }

    var query = client.createQuery().q(query);
//    var query = client.createQuery().q({"title":"Lorem ipsum"});
    if (searchParams) {
        log("RECEIVED THE FOLLOWING SEARCH PARAMETERS: " + JSON.stringify(searchParams));
        if (searchParams.queryFilter) {
            log("QUERY FILTER: " + JSON.stringify(searchParams.queryFilter));
            var parameter = 'fq=';
            parameter += querystring.stringify(searchParams.queryFilter, '%20', ':');
            query.parameters.push(parameter);
        }
        if (searchParams.facet) {
            query.facet(searchParams.facet)
        }
        if (searchParams.startDoc) {
            query.start(searchParams.startDoc);
        }
        if (searchParams.pageRows) {
            query.rows(searchParams.pageRows);
        }
        if (searchParams.rangeFilter) {
            query.rangeFilter(searchParams.rangeFilter);
        }
    }

    if (callBack) {
        log("Query: " + JSON.stringify(query));
        client.search(query, callBack);
    }
    else {
        log("No callback was provided. The result will displayed to console");
        log("Query: " + JSON.stringify(query));
        client.search(query, function (err, response) {
            // log(JSON.stringify(response));
            if (response) {
                log("Results: " + JSON.stringify(response.response.docs));
            }
            else {
                logErr("NULL result ");
            }
            if (err) {
                logErr(err);
            }
        });
    }

}

deleteAll = function(index,callback){
    var client = getSolrClient(index);

    var field = 'id';
    var query = '*'; // Everything !Dangerous!

// Delete every documents
    client.delete('id','*',function(err,obj){
        if(err){
            console.log(err);
            client.commit(callback);
        }else{
            console.log(obj);
        }
    });
}

addDocBatch = function (docs, index, callback) {
    var client = getSolrClient(index);
    getNumberOfDocuments(client, addDocs);
    function addDocs(numberOfDocs) {
        console.log("Adding documents: " + JSON.stringify(docs));
        for (var i in docs) {
            var doc = docs[i];
            if (!doc.id) {
                doc.id = ++numberOfDocs;
            }
            log('Doc with id: ' + doc.id + " will be added to index: <" + client.options.core + ">");
            client.add(doc, function (err) {
                if (err) {
                    logErr(err);
                }
            });
        }
        client.commit(callback);
    }
}

SearchParameters = function (startDoc, queryFilter, facet, pageRows, rangeFilter, category) {
    this.startDoc = startDoc;
    this.pageRows = pageRows;
    this.queryFilter = queryFilter;
    this.facet = facet;
    this.rangeFilter = rangeFilter;
    this.category =  category;
}

/**
 *
 * @param ids
 * @param index
 * @param callback
 */
deleteDocs = function (ids, index, callback) {
    var client = getSolrClient(index);
    for (var i in ids) {
        client.delete('id', ids[i], function (err, res) {
            if (err) {
                console.log(err);
            }
        })
    }
    client.commit(callback);
}

deleteDoc = function (id, index, callback) {
    var client = getSolrClient(index);
    client.delete('id', id, function (err, res) {
        if (err) {
            console.log(err);
        }
        else {
            log('Solr delete doc response status:' + res.responseHeader.status);
        }
        client.commit(callback);
    })
}


search = function (query, index, callBack, searchParameters) {
    var client = getSolrClient(index);
    if (!client) {
        logErr("Could not obtain client for index: " + index);
        return;
    }
    var query = client.createQuery().q(query);
//    var query = client.createQuery().q({"title":"Lorem ipsum"});
    if (searchParameters) {
        log("RECEIVED THE FOLLOWING SEARCH PARAMETERS: " + JSON.stringify(searchParameters));
        if (searchParameters.queryFilter) {
            log("QUERY FILTER: " + JSON.stringify(searchParameters.queryFilter));
            var parameter = 'fq=';
            parameter += querystring.stringify(searchParameters.queryFilter, '%20', ':');
            query.parameters.push(parameter);
        }
        if (searchParameters.facet) {
            query.facet(searchParameters.facet)
        }
        if (searchParameters.startDoc) {
            query.start(searchParameters.startDoc);
        }
        if (searchParameters.pageRows) {
            query.rows(searchParameters.pageRows);
        }
        if (searchParameters.rangeFilter) {
            query.rangeFilter(searchParameters.rangeFilter);
        }
    }

    if (callBack) {
        log("Query: " + JSON.stringify(query));
        client.search(query, callBack);
    }
    else {
        log("No callback was provided. The result will displayed to console");
        log("Query: " + JSON.stringify(query));
        client.search(query, function (err, response) {
            // log(JSON.stringify(response));
            if (response) {
                log("Results: " + JSON.stringify(response.response.docs));
            }
            else {
                logErr("NULL result ");
            }
            if (err) {
                logErr(err);
            }
        });
    }
}

function getNumberOfDocuments(client, callback) {
    if (!client) {
        logErr("No index client passed, cannot continue");
        return;
    }

    var retVal;
    var query = client.createQuery().q({"*":"*"});
    client.search(query, function (err, res) {
        if (res) {
            var numberOfDocs = res.response.numFound;
            callback(numberOfDocs);
        }
        else {
            logErr("Cannot get number od documents. NULL result ");
        }
        if (err) {
            logErr(err);
        }
    });
}

