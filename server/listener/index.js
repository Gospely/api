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
                var client = getClient(path, ctx);
                if(client != null){
                    client.emit( 'message', 'add-:-' + path.replace('/var/www/storage/codes', ''))
                }
            })
            .on('change', path => {

                var client = getClient(path, ctx);
                if(client != null){
                    client.emit( 'message', 'change-:-' + path.replace('/var/www/storage/codes', ''))
                }
            })
            .on('unlink', path => {

                var client = getClient(path, ctx);
                if(client != null){
                    client.emit( 'message', 'remove-:-' + path.replace('/var/www/storage/codes', '') )
                }

            })
            .on('error', error => );

            return watcher;

    }
}
module.exports = listenServer
