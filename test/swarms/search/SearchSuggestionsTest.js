/**
 * Created by: Narcis ARMASU <narcis.armasu@trp.ro>
 * Date: 7/13/12
 */

var ss = //swarming description
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
            deleteDoc("*", this.INDEX, addDocs.bind(this));
            function addDocs() {
                this.swarm("addDocuments");
            }
        }
    },
    addDocuments:{          //phase
        node:"SearchAdaptor",
        code:function () {
            console.log("ADDING DOCUMENTS");             s
            var docs = new Array();
            for (var i = 1; i <= this.NUMBER_OF_DOCUMENTS; i++) {
                docs[i] = {'id':i, 'title':"In the next part of the autocomplete functionality I’ll show how to modify its configuration to use static dictionary into the mechanism and how this can helk you get better suggestions. The last part of the series will be a performance comparison of each method in which I’ll try to diagnose which method is the fastest one in various situations." + i}
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
ss;