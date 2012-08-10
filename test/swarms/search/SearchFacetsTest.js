/**
 * Created by: Narcis ARMASU <narcis.armasu@trp.ro>
 * Date: 7/12/12
 */

var facetsTest = //swarming description
{
    vars:{
        FIRST_CATEGORY:'first',
        SECOND_CATEGORY:'second',
        INDEX:'testIndex'
    },
    start:function (query) {
        this.queryStr = query;
        this.swarm("addDocs");
    },
    addDocs:{          //phase
        node:"SearchAdaptor",
        code:function () {
            addDoc({'id':'1', 'title':"title for doc with id: 1", category:this.FIRST_CATEGORY});
            addDoc({'id':'2', 'title':"title for doc with id: 2", category:this.FIRST_CATEGORY});
            addDoc({'id':'3', 'title':"title for doc with id: 3", category:this.SECOND_CATEGORY});
            addDoc({'id':'4', 'title':"title for doc with id: 4", category:this.SECOND_CATEGORY});
            addDoc({'id':'5', 'title':"title for doc with id: 5", category:this.SECOND_CATEGORY});
            addDoc({'id':'6', 'title':"title for doc with id: 6", category:this.SECOND_CATEGORY});
            this.swarm('testFilter');
        }
    },
    testFilter:{  //phase
        node:"SearchAdaptor",
        code:function () {
            var params = new SearchParameters();
            params.startDoc = 0;
            params.pageRows = 5;
            params.facet = {
                field:'category',
                prefix:'',
                //query:'',
                limit:3,
                offset:0,
                sort:'count',
                mincount:0,
                missing:false,
                method:'fc'}
            search({'title':'title'}, this.INDEX, testFacetsFound.bind(this), params);

            function testFacetsFound(err, res) {
                // res.facet_counts.facet_fields = {"category":["second",3,"first",2]}
                assert.equal(res.facet_counts.facet_fields['category'][0], 'second', "There should be ordered by count");
                assert.equal(res.facet_counts.facet_fields['category'][1], 3, "There should be 3 occurrences. That is the maximum allowed limit");
                assert.equal(res.facet_counts.facet_fields['category'][2], 'first');
                assert.equal(res.facet_counts.facet_fields['category'][3], 2, "There should be 2 occurrences");
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

facetsTest