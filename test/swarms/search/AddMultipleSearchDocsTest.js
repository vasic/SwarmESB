/**
 * Created by: Narcis ARMASU <narcis.armasu@trp.ro>
 * Date: 7/12/12
 */

var addDocsTest = //swarming description
{
    vars:{
        NUMBER_OF_DOCUMENTS:5,
        INDEX:'testIndex'
    },
    start:function () {
        this.swarm("initIndex");
    },
    initIndex:{
        node:"SearchAdaptor",
        code:function () {
            console.log("INIT INDEX");
            //clean test index
            deleteDoc("*", this.INDEX, addDocs.bind(this));
            function addDocs() {
                this.swarm("addDocuments");
            }
        }
    },
    addDocuments:{          //phase
        node:"SearchAdaptor",
        code:function () {
            console.log("ADDING DOCUMENTS");
            var docs = new Array();
            for (var i = 1; i <= this.NUMBER_OF_DOCUMENTS; i++) {
                docs[i] = {'id':i, 'title':"title of doc with id:" + i}
            }
            addDocBatch(docs, this.INDEX, search.bind(this));
            function search() {
                this.swarm('searchDoc');
            }
        }
    },
    searchDoc:{  //phase
        node:"SearchAdaptor",
        code:function () {
            console.log("TESTING");
            search({'*':'*'}, null, testDocWasAdded.bind(this));
            function testDocWasAdded(err, res) {
                console.log("Search Result: " + JSON.stringify(res.response));
                assert.ok(res.response.numFound == this.NUMBER_OF_DOCUMENTS,
                    "Not all the documents were added");
                console.log(JSON.stringify(res.response.docs));
                this.swarm('clean');
            }
        }
    },
    clean:{
        node:"SearchAdaptor",
        code:function () {
            console.log("CLEANING");
            deleteDoc('*', this.INDEX);
        }
    }
};
addDocsTest;