module.exports = function(Exercise) {
    Exercise.beforeRemote('upsert', function( ctx, instance, next) {
        if (!ctx.req.body.id) {
            ctx.req.body.created = Date.now();
            ctx.req.body.ownerId = ctx.req.accessToken.userId;
            ctx.req.body.clientId = ctx.req.accessToken.userId;
        }
        next();
    });
};
