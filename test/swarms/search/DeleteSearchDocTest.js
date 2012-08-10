/**
 * Created by: Narcis ARMASU <narcis.armasu@trp.ro>
 * Date: 7/12/12
 */

var deleteDocsTest = //swarming description
{
    vars:{

        doc:{'id':'322324', 'title':"Some title text"}

    },
    start:function () {
        this.swarm("addDocument");
    },
    addDocument:{          //phase
        node:"SearchAdaptor",
        code:function () {
            addDoc(this.doc, null, search.bind(this));
            function search() {
                this.swarm('searchDoc');
            }
        }
    },
    searchDoc:{  //phase
        node:"SearchAdaptor",
        code:function () {
            search({'id':this.doc.id}, null, testDocWasAdded.bind(this));
            function testDocWasAdded(err, res) {
                console.log("Search Result: " + JSON.stringify(res.response));
                assert.ok(res.response.numFound > 0, "the document could not be found");
                this.swarm('deleteDoc');
            }
        }
    },
    deleteDoc:{
        node:"SearchAdaptor",
        code:function () {
            deleteDoc(this.doc.id, null, testDel.bind(this));
            function testDel() {
                this.swarm('testDelete');
            }
        }
    },
    testDelete:{
        node:"SearchAdaptor",
        code:function () {
            function testDocWasDeleted(err, res) {
                console.log("Delete result: " + JSON.stringify(res.response));
                assert.ok(res.response.numFound == 0, "the document was not deleted");
            }

            search({'id':this.doc.id}, null, testDocWasDeleted);
        }
    }
};

deleteDocsTest;

