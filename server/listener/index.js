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
                console.log('addDir');
                var client = getClient(path, ctx);
                if(client != null){
                    client.emit( 'message', 'addDir-:-' + path.replace('/var/www/storage/codes', '') )
                }
            })
            .on('unlinkDir', path => {

                var client = getClient(path, ctx);
                if(client != null){
                    client.emit( 'message', 'unlinkDir-:-' + path.replace('/var/www/storage/codes', ''))
                }
            })
            .on('add', path => {
                console.log('add');
                var client = getClient(path, ctx);
                if(client != null){
                    client.emit( 'message', 'add-:-' + path.replace('/var/www/storage/codes', ''))
                }
            })
            .on('change', path => {
                console.log('change');
                var client = getClient(path, ctx);
                if(client != null){
                    client.emit( 'message', 'change-:-' + path.replace('/var/www/storage/codes', ''))
                }
            })
            .on('unlink', path => {
                console.log('remove');
                var client = getClient(path, ctx);
                if(client != null){
                    client.emit( 'message', 'remove-:-' + path.replace('/var/www/storage/codes', '') )
                }

            })
            .on('error', error => console.log(`test error`,error.toString()));

            return watcher;

    }
}
module.exports = listenServer
