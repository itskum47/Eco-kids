/**
 * Global Mongoose Plugin to enforce query limits on potentially 
 * unbounded queries to prevent V8 Out of Memory crashes at scale.
 */
const queryDefaultsPlugin = (schema) => {
    schema.pre('find', function () {
        // If no explicit limit was set in the query chain
        if (this._mongooseOptions.limit === undefined) {
            this.limit(100);
        }
    });

    // findOne already intrinsically returns 1 document, so no change needed
    schema.pre('findOne', function () { });
};

module.exports = queryDefaultsPlugin;
