module.exports = function(Exerciseset) {
    Exerciseset.beforeRemote('upsert', function( ctx, instance, next) {
        if (!instance.id) {
            instance.created = Date.now();
            instance.clientId = ctx.req.accessToken.userId;
            instance.ownerId = ctx.req.accessToken.userId;
        }
        next();
    });
};