const queryDefaultsPlugin = (schema) => {
    schema.pre('find', function () {
        if (!this._mongooseOptions.limit) {
            this.limit(100); // default safety limit
        }
    });
};
module.exports = queryDefaultsPlugin;
