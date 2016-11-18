module.exports = function(Exercise) {
    Exercise.beforeRemote('create', function( ctx, instance, next) {
        ctx.req.body.created = new Date();
        ctx.req.body.ownerId = ctx.req.accessToken.userId;
        next();
    });
};
