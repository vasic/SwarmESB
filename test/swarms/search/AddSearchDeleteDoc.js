/**
 * Created by: Narcis ARMASU <narcis.armasu@trp.ro>
 * Date: 7/9/12
 */

var searchTest = //swarming description
{
    vars:{
        queryStr:"true1"
    },
    start:function (query) {
        this.queryStr = query;
        this.swarm("addDocument");
    },
    addDocument:{          //phase
        node:"SearchAdaptor",
        code:function () {
            addDoc({'id':'', 'title': this.queryStr});
            this.swarm('searchDoc');
        }
    },
    searchDoc:{  //phase
        node:"SearchAdaptor",
        code:function () {
            var params = new SearchParameters();
            params.startDoc = 0;
            params.pageRows = 5;
            search({'title':this.queryStr}, null, null, params);
            //this.swarm('clean');
        }
    },
    clean :{
        node:"SearchAdaptor",
        code:function () {
            deleteDocs("*",  null);
        }
    }
};

searchTest;
