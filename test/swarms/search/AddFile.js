var addFileTest = //swarming description http://www.tobcon.ie/assets/files/test.pdf/
{
    vars:{
        filePath:"http://www.tobcon.ie/assets/files/test.pdf",
        contentType:"text/plain;charset=utf-8",
        solrIndex:"collection1"
    },
    start:function () {
        this.swarm("addFile");
    },
    addFile:{          //phase
        node:"SearchAdaptor",
        code:function () {
            addFile(this.filePath,this.contentType,this.solrIndex);
            this.swarm("searchText");
        }
    },
    searchText :{
        node:"SearchAdaptor",
        code:function(){
            var params = new SearchParameters();
            params.startDoc = 0;
            params.pageRows = 5;
            searchFile("If you can read this, you have Adobe Acrobat Reader installed on your com","categ1",this.solrIndex,params,null);
        }
    }
   /* clean :{
        node:"SearchAdaptor",
        code:function () {
            deleteDocs("*",  null);
        }
    }*/
};
addFileTest;