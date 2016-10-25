var exec =  require('child_process').exec;
var port = {};

function genNumber(n,m) {
  var w = m - n;
  return Math.round(Math.random()*w+n)
}


port.generatePort = function* (){

   var port = 0;
   var loop = true;
   while(loop){

     port =  genNumber(1024,49151);
     var data = yield checkBind(port);
     console.log(data);
     loop = data.isBind;

   }
   return port;
}

function* checkBind (port) {
  return new Promise(function(resolve,reject) {
    exec("ssh root@gospely.com lsof -i:" + port,function(err,data) {

      if(err){
          console.log(err);
          resolve("{isBind: false}")
      }else{
          resolve("{isBind: true}")
      }

    });

  });
}
module.exports = port
