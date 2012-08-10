/**
 * Created by: Narcis ARMASU <narcis.armasu@trp.ro>
 * Date: 7/13/12
 */

var basicConfigFile = "test/config/search.cfg";

var cfg = require('swarmutil').readConfig(basicConfigFile);
descriptionsFolder = cfg.swarmsfolder;
redisHost = cfg.redisHost;
redisPort = cfg.redisPort;

//The adaptor is named "Core" so the descriptions will still get loaded,
// otherwise wo should export upload descriptions method in AdaptorBase
var adaptor = require('swarmutil').createAdaptor("Core", redisHost, redisPort, descriptionsFolder);

//adaptor.uploadDescriptions(descriptionsFolder);

var childForker = require('child_process');

var forkOptions;


for (var i = 0; i < cfg.adaptors.length; i++) {
    forkOptions = {
        cwd:process.cwd(),
        env:process.env
    };
    var n = childForker.fork(cfg.adaptors[i], null, forkOptions);
    n.on('message', function (m) {
        console.log('PARENT got message:', m);
    });
    n.send({ "redisHost":redisHost, "redisPort":redisPort });
}

setTimeout(
    function () {
     startSwarm("AddFile.js", "start");
//        startSwarm("SearchFilterTst.js", "start");
//        startSwarm("AddMultipleSearchDocsTest.js", "start");
//        startSwarm("DeleteSearchDocTest.js", "start");
//        startSwarm("DeleteBatchDocsTest.js", "start");
//        startSwarm("SearchSuggestionsTest.js", "start");
//        startSwarm("SearchFacetsTest.js", "start");
//        startSwarm("SearchFilterTst.js", "start");
//          startSwarm("AddSearchDeleteDoc.js", "start");
    },
    1000);