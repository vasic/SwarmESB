/**
 * Created by: Narcis ARMASU <narcis.armasu@trp.ro>
 * Date: 7/12/12
 */


var filterTst = //swarming description
{
    vars:{
        FIRST_CATEGORY:'first',
        SECOND_CATEGORY:'second',
        INDEX:'testIndex'
    },
    start:function (query) {
        console.log('STARTING SEARCH FILTER TEST');
        this.queryStr = query;
        this.swarm("addDocs");
    },
    addDocs:{          //phase
        node:"SearchAdaptor",
        code:function () {
            addDoc({'id':'1', 'title':"title for doc with id: 1", category:this.FIRST_CATEGORY});
            addDoc({'id':'2', 'title':"title for doc with id: 2", category:this.SECOND_CATEGORY});
            this.swarm('testDocsArePresent');
        }
    },
    testDocsArePresent:{  //phase
        node:"SearchAdaptor",
        code:function () {
            var params = new SearchParameters();
            params.pageRows = 5;
            search({'title':'title'}, this.INDEX, testDocsPresent.bind(this), params);
            function testDocsPresent(err, res) {
                assert.equal(res.response.numFound, 2, "There should be 2 docs returned");
                this.swarm('testSearchWithFilter')
            }
        }
    },
    testSearchWithFilter:{
        node:"SearchAdaptor",
        code:function () {
            var params = new SearchParameters();
            params.pageRows = 5;
            params.queryFilter = {id:1, category:'first'};
            console.log("Search Parameters: " + JSON.stringify(params));
            search({'title':'title'}, this.INDEX, testQFResult.bind(this), params);

            function testQFResult(err, res) {
                console.log(JSON.stringify(res));
                assert.equal(res.response.numFound, 1, "There should be 1 doc returned");
                assert.equal(res.response.docs[0].id, 1, "The document with id 1 should have bean returned");
                this.swarm('clean');
            }
        }
    },
    clean:{
        node:"SearchAdaptor",
        code:function () {
            deleteDocs("*", this.INDEX);
        }
    }
}
filterTst
