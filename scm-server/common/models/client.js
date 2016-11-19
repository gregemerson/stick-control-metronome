
module.exports = function(Client) {
    var app = require('../../server/server');
    Client.beforeRemote('create', function(ctx, instance, next) {
        ctx.req.body.created = new Date();
        ctx.req.body.lastUpdated = new Date();
        ctx.req.body._userSettings = {
            "currentExerciseSet": -1,
            "numberOfRepititions": 20,
            "minTempo": 80,
            "maxTempo": 80,
            "tempoStep": 10
        };
        delete ctx.req.body.membershipExpiry;
        next();
    });

    Client.beforeRemote('*.__create__exerciseSets', function(ctx, instance, next) {
        ctx.req.body['created'] = new Date();
        ctx.req.body['ownerId'] = ctx.req.accessToken.userId;
        next();
    });            

    Client.beforeRemote('updateAttributes', function(ctx, instance, next) {
        delete ctx.req.body.membershipExpiry;
        next();
    });       
    Client.beforeRemote('login', function(ctx, instance, next) { 
        // Make ttl 2 week in senconds
        ctx.req.body.ttl = 60 * 60 * 24 * 7 * 2;
        next();
    });
    Client.beforeRemote('logout', function(ctx, instance, next) { 
        // Extra protection
        Client.find({where: {username: 'guest'}}, function(err, user){
            if (user.id == ctx.res.token.userId) {
                throw 'Guest cannot log out.'
            }
        });
        ctx.req.body.ttl = 60 * 60 * 24 * 7 * 2;
        next();
    });
    Client.afterRemote('login', function(ctx, auth, next) {
        var accessToken = app.models.AccessToken;
        var deleteCallback = function(err, info) {
            // @todo Need to log these
            console.log(err, info);
        };
        accessToken.destroyAll({and: [{userId: auth.userId}, {id: {neq: auth.id}}]}, deleteCallback);
        next();
    });
    Client.validatesUniquenessOf('username');
    Client.validatesUniquenessOf('email');
    Client.validatesLengthOf('email', {max: 40, min: 1});
};
