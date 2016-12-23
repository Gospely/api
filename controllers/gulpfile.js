var chokidar = require('chokidar');



var file_socket = require('../filesocket/filesocket');

var gulpfile = {};



function render(data,all,cur,code,message) {

    return {
        code: code,
        message: message,
        all: all,
        cur: cur,
        fields: data
    }
}

gulpfile.startSocket = function *() {


    // var name_id = this.query['name'];
    // var project_name = this.query['name'];
    // var path = '/var/www' + name_id + project_name;

    var path = '/home/willian/Destop/project/js/api';

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
                console.log(path);
            }
        })
        .on('change', path => {
            if (path.indexOf("__") < 0 ){
                //文件被改变
                console.log(path);
            }
        })
        .on('unlink', path => {
            if (path.indexOf("__") < 0 ){
                //文件被删除
                console.log(path);
            }
        });
    watcher
        .on('addDir', path => console.log(`Directory ${path} has been added`))
        .on('unlinkDir', path => console.log(`Directory ${path} has been removed`))
        .on('error', error => console.log(`Watcher error: ${error}`))
        .on('ready', () => console.log('Initial scan complete. Ready for changes'));

        // .on('raw', (event, path, details) => {
        //     console.log('Raw event info:', event, path, details);
        // });

    this.body = render(null, null, null, -1, "应用创建失败");
};

module.exports = gulpfile;
