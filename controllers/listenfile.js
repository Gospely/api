var chokidar = require('chokidar');

var socket = require('../index');


var listenfile = {};



function render(data,all,cur,code,message) {

    return {
        code: code,
        message: message,
        all: all,
        cur: cur,
        fields: data
    }
}

listenfile.listenFile = function *() {


    var name_id = this.request.body['name_id'];
    var project_name = this.request.body['project_name'];
    var path = '/var/www/' + name_id + '/' + project_name;

    // var path = '/home/willian/Destop/project/js/api';

    console.log("watcher start");

    var ignored_path = [
        path + '/node_modules',
        path + '/.git',
        path + '/tmp',
        path + '/.idea'
    ];

    var watcher = chokidar.watch(path, {ignored: ignored_path});

    console.log("watcher end");

    watcher
        .on('add', path => {
            if(path.indexOf("__") < 0 ){
                //新建了文件
                socket.emit('add',{
                    path : path
                });
                console.log(path);
            }
        })
        .on('change', path => {
            if (path.indexOf("__") < 0 ){
                //文件被改变
                socket.emit('change',{
                    path : path
                });
                console.log(path);
            }
        })
        .on('unlink', path => {
            if (path.indexOf("__") < 0 ){
                //文件被删除
                socket.emit('delete',{
                    path : path
                });
                console.log(path);
            }
        });
    watcher
        .on('addDir', path => {
            if (path.indexOf("__") < 0 ){
                //添加文件夹
                socket.emit('add',{
                    path : path
                });
                console.log(path);
            }
        })
        .on('unlinkDir', path => {
            if (path.indexOf("__") < 0 ){
                //文件夹被删除
                socket.emit('delete',{
                    path : path
                });
                console.log(path);
            }
        })
        .on('error', error => console.log(`Watcher error: ${error}`))
        .on('ready', () => console.log('Initial scan complete. Ready for changes'));


    this.body = render(null, null, null, 1, "文件监听成功！！");
};

module.exports = listenfile;
