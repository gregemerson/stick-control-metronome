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
      cb(null, 'Greetings... ' + msg);
    }
     
    Exerciseset.remoteMethod(
        'createdExercises', 
        {
          accepts: [
              {arg: 'data', type: 'object', http: {source: 'body'}}, 
              {arg: 'id', type: 'number'}],
          http: {path: '/:id/createdExercises', verb: 'post'},
          returns: {arg: 'exerciseId', type: 'number'}
        }
    );
};