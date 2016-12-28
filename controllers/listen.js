var chokidar = require('chokidar');
var models = require('../models');

var listen = {};



function render(data,all,cur,code,message) {

    return {
        code: code,
        message: message,
        all: all,
        cur: cur,
        fields: data
    }
}
var socket_id = "";


function getSocket(sockets) {
    for(var i=0;i<sockets.length;i++){
        var socket = sockets[i];
        if (socket_id === socket.id){
            return socket;
        }else {
            return null;
        }
    }
}

listen.fileListen = function *() {

    //先创建连接
    //再监听文件

    var user_id = this.request.body['user_id'];
    var project_name = this.request.body['project_name'];
    var path = '/var/www/' + name_id + '/' + project_name;

    var sockets = this.app.io.sockets.sockets;


    var user = yield models.gospel_users.findById(user_id);

    socket_id = user.socket_id;


    // var path = '/home/willian/Destop/project/js/api';


    var ignored_path = [
        path + '/node_modules',
        path + '/.git',
        path + '/tmp',
        path + '/.idea'
    ];

    var watcher = chokidar.watch(path, {ignored: ignored_path});
    watcher
        .on('ready', () => {
            var socket = getSocket(sockets);
            socket.emit('ready',{
                path:'ready'
            });
        })
        .on('addDir', path => {

            if (path.indexOf("__") < 0 ){
                //添加文件夹
                var socket = getSocket(sockets);
                socket.emit('file',{
                    type : 'fileChange',
                    path : path
                });
            }
        })
        .on('unlinkDir', path => {
            if (path.indexOf("__") < 0 ){
                var socket = getSocket(sockets);
                //文件夹被删除
                socket.emit('file',{
                    type : 'fileChanger',
                    path : path
                });
            }
        })
        .on('add', path => {
            //第一次加载会执行该回调
            //客户端接受到监听完毕后才开始socket.on
            // var socket = io.connect("http://localhost:8089");
            // socket.on('ready',function () {
            //         console.log(data);
            //     });
            //     socket.on('content',function (data) {
            //         console.log(data);
            //     });
            // });
            if(path.indexOf("__") < 0 ){
                //新建了文件
                var socket = getSocket(sockets);
                socket.emit('file',{
                    type : 'fileChange',
                    path : path
                });
            }
        })
        .on('change', path => {
            //文件被改变
            if(path.indexOf("__") < 0 ){
                var socket = getSocket(sockets);
                socket.emit('content',{
                    type : 'contentChange',
                    path : path
                });
            }
        })
        .on('unlink', path => {
            if (path.indexOf("__") < 0 ){
                var socket = getSocket(sockets);
                //文件被删除
                socket.io.emit('file',{
                    type : 'fileChange',
                    path : path
                });
            }
        })
        .on('error', error => console.log(`Watcher error: ${error}`));

    //s
    this.body = render(null, null, null, 1, "文件监听成功！！");
};

module.exports = listen;
