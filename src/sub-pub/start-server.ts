var ipc=require('node-ipc');
require('dotenv');

ipc.config.id = "NGSBotServer";
ipc.config.retry= 1500;

ipc.serve(
    function(){
        ipc.server.on(
            'message',
            function(data,socket){
                ipc.server.broadcast('message',  
                    data
                );
            }
        );
    }
);

ipc.server.start();