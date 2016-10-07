var fs = require('fs-extra')

var buildSource = './www';
var staticSource = './static';
var buildDestination = './scm-server/client';

fs.emptyDir(buildDestination, function(err) {
    if (err) return console.log(err);
    console.log('Server build directory cleaned.');
    fs.copy(buildSource, buildDestination, function(err) {
        if (err) return console.log(err);
        console.log('Copied build directory.');
    });
    fs.copy(staticSource, buildDestination, function(err) {
        if (err) return console.log(err);
        console.log('Copied static directory.');
    });
});



