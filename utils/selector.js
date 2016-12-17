//根据权重随机从host中选取主机
exports = module.exports = {

	select:function(set){

        function genNumber(n, m) {
          var w = m - n;
          return Math.round(Math.random() * w + n)
        }
        var total = 0;
        set.map(function(item){
            total = total + parseInt(item.priority);
        });
        var result = genNumber(0,total);
        total = 0;
        for(var i = 0; i<set.length; i++){
            total = total + parseInt(set[i].priority);
            if(result <= total){
                return set[i];
            }
        }
	}
}
