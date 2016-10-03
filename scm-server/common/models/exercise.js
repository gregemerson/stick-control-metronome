module.exports = function(Exercise) {
    Exercise.beforeRemote('upsert', function( ctx, instance, next) {
        if (!instance.id) {
            instance.created = Date.now();
            instance.ownerId = ctx.req.accessToken.userId;
        }
        next();
    });
};
