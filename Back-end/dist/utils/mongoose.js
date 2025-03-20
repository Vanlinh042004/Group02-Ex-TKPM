module.exports = {
    mutipleMongooseToObject: function (mongooses) {
        return mongooses.map((mongoose) => mongoose.toOject());
    },
    mongooseToOject: function (mongoose) {
        return mongoose ? mongoose.toOject() : mongoose;
    },
};
//# sourceMappingURL=mongoose.js.map