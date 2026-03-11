const paginate = (query, req, defaultLimit = 20) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(parseInt(req.query.limit) || defaultLimit, 100);
    return query.skip((page - 1) * limit).limit(limit);
};

const paginatedResponse = (data, total, page, limit) => ({
    success: true,
    data,
    pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
    },
});

module.exports = { paginate, paginatedResponse };
