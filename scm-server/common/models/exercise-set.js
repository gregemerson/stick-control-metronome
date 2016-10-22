

module.exports = function(Exerciseset) {
    
    Exerciseset.beforeRemote('upsert', function( ctx, instance, next) {
        if (!ctx.req.body.id) {
            ctx.req.body.created = Date.now();
            ctx.req.body.clientId = ctx.req.accessToken.userId;
            ctx.req.body.ownerId = ctx.req.accessToken.userId;
        }
        next();
    });

    Exerciseset.createdExercises = function(id, data, cb) {
        Exerciseset.beginTransaction({}, function(err, tx) {
            var app = require('../../server/server');
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
                        ordering.unshift(newExercise.id);
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
};