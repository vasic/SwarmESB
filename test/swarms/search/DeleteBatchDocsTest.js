/**
 * Created by: Narcis ARMASU <narcis.armasu@trp.ro>
 * Date: 7/13/12
 */

var deleteBatchDocsTest = //swarming description
{
    vars:{
        NUMBER_OF_DOCUMENTS:5,
        INDEX:'testIndex',
        docs:{}
    },
    start:function () {
        this.swarm("addDocument");
    },
    addDocument:{
        node:"SearchAdaptor",
        code:function () {
            for (var i = 1; i <= this.NUMBER_OF_DOCUMENTS; i++) {
                this.docs[i] = {'id':i, 'title':"title of doc with id:" + i}
            }
            addDocBatch(this.docs, this.INDEX, testDocsAdded.bind(this));
            function testDocsAdded() {
                this.swarm('testDocsAreAdded');
            }
        }
    },
    testDocsAreAdded:{
        node:"SearchAdaptor",
        code:function () {
            search({"*":"*"}, this.INDEX, function (err, res) {
                assert.equal(res.response.numFound, this.NUMBER_OF_DOCUMENTS, "Found " + res.response.numFound + " results, instead of: " + this.NUMBER_OF_DOCUMENTS);
                this.swarm('deleteDocs');
            }.bind(this))
        }
    },
    deleteDocs:{
        node:"SearchAdaptor",
        code:function () {
            var docIds = new Array();
            for (var i in this.docs) {
                docIds.push(this.docs[i].id);
            }
            deleteDocs(docIds, null, testDel.bind(this));
            function testDel() {
                search({"*":"*"}, this.INDEX, function (err, res) {
                    assert.equal(res.response.numFound, 0);
                })
            }
        }
    }
};

deleteBatchDocsTest;


