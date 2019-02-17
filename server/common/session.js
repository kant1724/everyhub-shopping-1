module.exports = {
    checkSession : async function(req, res, next) {
        console.log(req.session.userId);
        next();
    }
};
