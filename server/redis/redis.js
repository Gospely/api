var redis = require("redis"),
    client = redis.createClient({
      host: 'localhost',
      port: 6379
    });

client.on('ready',function(err){
  console.log('ready');
});

client.on("error", function(err){
    console.log("Error: " + err);
});



module.exports = {

  setKey: function(key,val) {
    client.on("connect", function(){
        // start server();
        client.set(key, val, function(err, reply){
            console.log(reply.toString());
        });
    });
  },
  getKey: function* (key,next) {
    client.on("connect", function(){

        client.get(key, function(err, reply){
            console.log(reply.toString());
            return reply.toString();
        });
    });
  }
}
