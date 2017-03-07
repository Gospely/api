var util = require('./utils.js');

var content = "src=styles.NzbWTd6Kpy.css";
content = content.replace(/styles.\w{10}.css/, 'tst');
console.log(content);

for (var i = 0; i < 9; i++) {
    console.log(util.randomString(8, 10).length);
}
