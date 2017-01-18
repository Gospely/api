var chokidar = require('chokidar');
function getClient(path, ctx){

    var split = path.split('/'),
        namespace = split[5] + split[6];
    return ctx.context.clients[namespace];
}
var listenServer = {

    buildListener: function(path, ignoredPath, ctx){

        var watcher = chokidar.watch(path, {ignored: ignoredPath});
        watcher
            .on('ready', () => {
            })
            .on('addDir', path => {
                var client = getClient(path, ctx);
                if(client != null){
                    client.emit( 'message', 'addDir' )
                }
            })
            .on('unlinkDir', path => {

                var client = getClient(path, ctx);
                if(client != null){
                    client.emit( 'message', 'unlinkDir' )
                }
            })
            .on('add', path => {

                var client = getClient(path, ctx);
                if(client != null){
                    client.emit( 'message', 'add' )
                }
            })
            .on('change', path => {
                var client = getClient(path, ctx);
                if(client != null){
                    client.emit( 'message', 'change' )
                }
            })
            .on('unlink', path => {
                var client = getClient(path, ctx);
                if(client != null){
                    client.emit( 'message', 'remove' )
                }

            })
            .on('error', error => console.log(`Watcher error: ${error}`));

            return watcher;

    }
}
module.exports = listenServer
