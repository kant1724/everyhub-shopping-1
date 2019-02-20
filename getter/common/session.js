module.exports = {
    checkSession : function(req, res, next) {
        console.log(req.session.userId);
        next();
    }
};
