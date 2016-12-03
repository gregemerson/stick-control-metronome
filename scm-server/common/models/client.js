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

    Client.beforeRemote('*.__unlink__exerciseSets', function(ctx, emptyObj, next) {
        let exerciseSetId = parseInt(ctx.req.params.fk);
        app.model.Client.findOne(exerciseSetId, function(err, exerciseSet) {
            if (err) {
                next(err);
            }
            else {
                exerciseSet.clients.find({limit: 1}, function(err, clients) {
                    if (clients.length == 0) {
                        exerciseSet.destroy(function(err) {
                            if (err) {
                                next(err);
                            }
                            else {
                                next();
                            }
                        });
                    }
                    else {
                        next();
                    }
                });
            }
        });
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
                next(Client.createClientError('Guests cannot logout.'));           
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

    Client.createClientError = function(message) {
        var error = new Error();
        error.status = 400;
        error.message = message;
        return error;
    }

    Client.validatesUniquenessOf('username');
    Client.validatesUniquenessOf('email');
    Client.validatesLengthOf('email', {max: 40, min: 1});

    Client.beforeRemote('sharedExerciseSets', function(ctx, instance, next) {
        ctx.req.body['sharerId'] = ctx.req.accessToken.userId;
    });

    Client.sharedExerciseSets = function(id, shareIn, cb) {
        try {
            shareIn.created = Date.now();
            shareIn.sharerId = id;
            Client.findOne({where: {email: shareIn.receiverEmail}}, function(err, receiver){
                if (err) throw err;
                if (!receiver) {
                    return cb(Client.createClientError("User does not exist"));
                }
                shareIn.receiverId = receiver.id;
                Client.findOne({where: {id: id}}, function(err, sharer){
                    if (err) throw err;
                    sharer.exerciseSets.findOne({where: {id: shareIn.exerciseSetId}}, function(err, exerciseSet) {
                        if (err) throw err;
                        if (!exerciseSet) {
                            return cb(Client.createClientError(
                                'Sharer does not have the exercise set'));
                        }
                        app.models.SharedExerciseSet.findOne({where: {
                            exerciseSetId: shareIn.exerciseSetId,
                            sharerId: shareIn.sharerId,
                            receiverId: shareIn.receiverId
                        }}, function(err, existingShare) {
                            if (err) throw err;
                            if (existingShare) {
                                return cb(existingShare);
                            }
                            app.models.SharedExerciseSet.create(shareIn, function(err, instance) {
                                if (err) throw err;
                                return cb(instance);
                            })
                        })
                    })
                })
            })
        }
        catch (err) {
            return cb(err);
        }
    }    

    Client.remoteMethod(
        'sharedExerciseSets',
        {
          accepts: [
              {arg: 'id', type: 'number', required: true},
              {arg: 'data', type: 'Object', http: {source: 'body'}, required: true}
            ],
          http: {path: '/:id/sharedExerciseSets', verb: 'post'},
          returns: {arg: 'share', type: 'Object'}
        }
    );
};
