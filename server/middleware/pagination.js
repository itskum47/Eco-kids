module.exports = (req, res, next) => {

    let limit = parseInt(req.query.limit) || 20;

    if (limit > 100) limit = 100;

    req.query.limit = limit;

    next();

};
