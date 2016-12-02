

module.exports = function(Exerciseset) {
    var app = require('../../server/server');

    Exerciseset.beforeRemote('*.__create__exercises', function(ctx, instance, next) {
        // @todo Need to limit number of exercises here

        ctx.req.body['created'] = new Date();
        ctx.req.body['ownerId'] = ctx.req.accessToken.userId;
        next();
    });   

    // Set the new set as currentExerciseSet
    Exerciseset.afterRemote('create', function(ctx, exerciseSet, next) {
        // @todo Limit number of exercise sets here

        app.models.Usersettings.find(
            {where: {clientId: ctx.req.accessToken.userId}},
                function(err, settings) { 
                    settings.currentExerciseSet = exerciseSet.id;
                    settings.save();
                });

        next();
    });
/*
    // For diagnostics
    Exerciseset.beforeRemote('**', function(ctx, exerciseSet, next) {
        console.log(ctx.methodString, 'was invoked remotely');
        next();
    });
*/

    Exerciseset.createdExercises = function(id, data, cb) {
        Exerciseset.beginTransaction({}, function(err, tx) {
            try {
                if (err) throw err;
                data.created = Date.now();
                Exerciseset.findById(id, [], function(err, exerciseSet) {
                    if (err) throw err;
                    console.log('exercise set: ' + exerciseSet);
                    exerciseSet.exercises.create(data, {transaction: tx}, function(err, newExercise) {
                        if (err) throw err;
                        console.log('exercise: ' + newExercise);
                        let ordering = JSON.parse(exerciseSet.exerciseOrdering);
                        ordering.push(newExercise.id);
                        exerciseSet.exerciseOrdering = JSON.stringify(ordering);
                        exerciseSet.save({transaction: tx}, function(err, newSet) {
                            if (err) throw err;
                            console.log('new exercise set: ' + newSet);
                            tx.commit(function(err) {
                                if (err) throw err;
                            });
                            cb(null, newExercise);
                        });
                    });
                });
            }
            catch (err) {
                tx.rollback(function(err) {});
                var error = new Error("Could not create exercise.");
                error.status = 500;
                return cb(error);
            }
        });
    }
     
    Exerciseset.remoteMethod(
        'createdExercises', 
        {
          accepts: [
              {arg: 'id', type: 'number', required: true},
              {arg: 'data', type: 'Object', http: {source: 'body'}, required: true}
            ],
          http: {path: '/:id/createdExercises', verb: 'post'},
          returns: {arg: 'exercise', type: 'Object'}
        }
    );

    Exerciseset.remoteMethod(
        'share', 
        {
          accepts: [
              {arg: 'id', type: 'number', required: true},
              {arg: 'data', type: 'Object', http: {source: 'body'}, required: true}
            ],
          http: {path: '/:id/createdExercises', verb: 'post'},
          returns: {arg: 'exercise', type: 'Object'}
        }
    );
};