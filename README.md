## SwarmESB  (beta version)

Warning: SwarmESB is a new approach for creating scalable, complex, distributed and highly parallel systems.
In a few hours you can have your maintainable system working!
All the communication and how services get composed is described in the simplest way!
The essence of swarming idea is that offer a practical way to describe communication and to structure your code for 
a distributed application in a maintainable, easy to understand way.

    We claim that by using SwarmESB, you can get the benefits of asynchronous message passing without paying the usual price.
        Why? 
    Because your code will follow the open/close principle and get a better separation of concerns. 

    
SwarmESB ca be also used as a light, open source, ESB replacement for your enterprise applications.
Instead of message oriented communication or web services, you describe your communication between "nodes" in what
we call "swarm descriptions" or simple "swarms".
"Nodes" can be adapters to various servers or clients connected to the "swarming middleware": SwarmESB.

Your adapters can use web services as a particular case of providing some specific API in a node.


## Examples
    
A swarm description is written in Java Script and is composed from:  variable declarations (for defaults),
constructors (functions that get called on the adapter that starts a swarm) and phases (code that get executed
remotely, usually in another node) 
    
The swarm described bellow will magically get executed without any other programming efforts in 3 nodes:

            vars:{
                message:"Hello World",
            },
            start:function(){ //constructor  that can be executed in any adapter
                        this.swarm("concat");  // swarm is a "primitive" used to invoke execution in a phase
                    },
            concat:{ // phase that get executed in "Core" adapter
                node:"Core",
                code : function (){
                        this.message=this.message + " The swarming has begun! ";
                        this.swarm("print");    //move again
                    }
            },
            print:{ //print phase executed in "Logger" adapter
            node:"Logger",
            code : function (){
                cprint(this.message);    //use of some api, specific only to the Logger node
                },
            }
 

Imagine: each node could be on a different continent!  Check other swarms for parallel execution examples.


## Instalation:  https://github.com/salboaie/SwarmESB/wiki/Install-guide

## Conclusions:

    1. Maintainable code: Open/closed principle, no threads get abused (ever), simple
    2. High performance: We are using node.js and his asynchronous capabilities revealed no throughput degradation in
    our benchmarks. Network latency have no effect in capability of the system to execute things in parallel.
    3. Scalability: Load balancing and sharding can be implemented using swarming concepts
    4. High availability: Still at the research level but looks promising


## License:

    LGPL