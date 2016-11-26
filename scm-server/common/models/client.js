/*
    Business Rules.
    - Clients can have only one access token at a time. Tokens time-out in 2 weeks
    - Guests cannot login or logout and the guest access token (virtually) never expires
    - When no client references an exercise set, the set will be deleted
    - 
*/

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

    Client.beforeRemote('*.__unlink__exerciseSets', function(ctx, exerciseSet, next) {
        // @todo only admin can set isPublic to true
        console.log('unlinking');
        console.dir(ctx);
        console.dir(exerciseSet);
/*
        if (exerciseSet.isPublic) {
            // Public exercise sets are never deleted only references by clients to them.
            next();
            return;
        }
        // If no client references the exercise set, delete it and all associated exercises
*/
        // If the set is the current one for user, remove it from user settings 
    });

    // For diagnostics
    Client.beforeRemote('**', function(ctx, exerciseSet, next) {
        console.log(ctx.methodString, 'was invoked remotely');
        next();
    });
           

    Client.beforeRemote('updateAttributes', function(ctx, instance, next) {
        // @todo add acl that the membershipExpiry property can only be set by the admin
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
            if (err || !ctx.req.accessToken || user.id == ctx.req.accessToken.id) {
                var error = new Error();
                error.status = 400;
                error.message = 'Guests cannot logout.';
                next(error);           
            }
            else {
                next();
            }
        });
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
