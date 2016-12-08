/*
    Business Rules.
    - Clients can have only one access token at a time. Tokens time-out in 2 weeks
    - Guests cannot login or logout and the guest access token (virtually) never expires
    - When no client references an exercise set, the set will be deleted
    - 
*/

module.exports = function(Client) {
    var app = require('../../server/server');
    var constraints = require('../constraints');

    Client.validatesUniquenessOf('username');
    Client.validatesUniquenessOf('email');
    Client.validatesLengthOf('email', {max: constraints.email.maxEmailLength});

    Client.beforeRemote('create', function(ctx, instance, next) {
        ctx.req.body.created = new Date();
        ctx.req.body.lastUpdated = new Date();
        // @todo put into config file
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

    Client.addExerciseSets = function(client, exerciseSets, next, error) {
        if (exerciseSets.length > 0 && !error) {
            client.exerciseSets.add(exerciseSets.pop, function(err, instance) {
                Client.addExerciseSets(client, exerciseSets, next, err);
            });
        }
        else {
            if (error) {
                next(error);
                return;
            }
            next();
        }
    }

    Client.afterRemote('create', function(err, newClient, next) {
        app.models.Exerciseset.find({where: {public: 1}}, function(err, sets) {
            Client.addExerciseSets(newClient, sets, next, err);
        });
    });

    Client.beforeRemote('*.__create__exerciseSets', function(ctx, instance, next) {
        ctx.req.body['created'] = new Date();
        ctx.req.body['ownerId'] = ctx.req.accessToken.userId;
        next();
    });

    Client.beforeRemote('*.__unlink__exerciseSets', function(ctx, emptyObj, next) {
        let exerciseSetId = parseInt(ctx.req.params.fk);
        app.models.Client.findOne(exerciseSetId, function(err, exerciseSet) {
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
        var deleteCallback = function(err, info) {
            // @todo Need to log these
            console.log(err, info);
        };
        app.models.AccessToken.destroyAll({and: [{userId: auth.userId}, {id: {neq: auth.id}}]}, deleteCallback);
        next();
    });

    Client.createClientError = function(message) {
        var error = new Error();
        error.status = 400;
        error.message = message;
        return error;
    }  

    Client.remoteMethod(
        'sharedExerciseSets',
        {
          accepts: [
              {arg: 'sharerId', type: 'number', required: true},
              {arg: 'data', type: 'Object', http: {source: 'body'}, required: true}
            ],
            http: {path: '/:sharerId/sharedExerciseSets', verb: 'post'},
            returns: {arg: 'share', type: 'Object'}
        }
    );

    Client.sharedExerciseSets = function(sharerId, shareIn, cb) {
        try {
            if (shareIn.receiverEmail == constraints.email.guest) {
                return cb(Client.createClientError("Cannot share with guest"));
            }
            shareIn.created = Date.now();
            Client.findOne({where: {email: shareIn.receiverEmail}}, function(err, receiver){
                if (err) return cb(err);
                if (!receiver) {
                    return cb(Client.createClientError("User does not exist"));
                }
                shareIn.receiverId = receiver.id;
                Client.findOne({where: {id: sharerId}}, function(err, sharer) {
                    if (err) return cb(err);
                    if (sharer.email == constraints.email.guest) {
                        return cb(Client.createClientError("Guest cannot share"));
                    }
                    sharer.exerciseSets.findOne({where: {id: shareIn.exerciseSetId}}, function(err, exerciseSet) {
                        if (err) return cb(err);
                        if (!exerciseSet) {
                            return cb(Client.createClientError(
                                'Sharer does not have the exercise set'));
                        }
                        app.models.SharedExerciseSet.findOne({where: {
                            exerciseSetId: shareIn.exerciseSetId,
                            sharerId: sharerId,
                            receiverId: shareIn.receiverId
                        }}, function(err, existingShare) {
                            if (err) return cb(err);
                            if (existingShare) {
                                return cb(existingShare);
                            }
                            app.models.SharedExerciseSet.create(shareIn, function(err, instance) {
                                if (err) return cb(err);
                                return cb(instance);
                            });
                        });
                    });
                });
            });
        }
        catch (err) {
            return cb(err);
        }
    }

    Client.remoteMethod(
        'receiveExerciseSets',
        {
          accepts: [
              {arg: 'clientId', type: 'number', required: true},
              {arg: 'exerciseSetId', type: 'number', required: true}
            ],
          http: {path: '/:clientId/receivedExerciseSets/:exerciseSetId', verb: 'get'},
          returns: {arg: 'receiveExerciseSet', type: 'Object'}
        }
    );

    Client.receiveExerciseSets = function(clientId, exerciseSetId, cb) {
        try {
            Client.findOne({where: {id: clientId}}, function(err, client) {
                if (err) return cb(err);
                if (!client) return cb(Client.createClientError('Could not fiind user'));
                client.receivedExerciseSets.findOne({where: {id: exerciseSetId}}, function(err, exerciseSet) {
                    if (err) return cb(err);
                    if (!exerciseSet) return cb(Client.createClientError('Exercise set has not be shared with user'));
                    client.exerciseSets.add(exerciseSet, options, function(err) {
                        if (err) return cb(err);
                        cb(exerciseSet);
                    }); 
                });
            });
        }
        catch (err) {
            cb(err);
        }
    }
}
