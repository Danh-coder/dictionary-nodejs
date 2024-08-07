// /*
//     Define scheme for collection User using in this project
// */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Constant = require("../common/constant");

const fields = {};
const uniqueIndex = {};

// Define schema with dynamic fields
const wordSchema = new Schema(fields, { strict: false });

// Apply unique index to schema
// wordSchema.index(uniqueIndex, { unique: true });

// Define model
const Word = mongoose.model("words", wordSchema);

// Function to check indexes
// const checkIndexes = async () => {
//     try {
//         const indexes = await Word.collection.getIndexes();
//         console.log('Indexes:', indexes);
//     } catch (error) {
//         console.error('Error fetching indexes:', error);
//     }
// };
// Uncomment if you want to check indexes
// await checkIndexes();

// Add methods to Word prototype
Word.prototype.create = function (data) {
    return new Promise(async (resolve, reject) => {
        try {
            const document = new Word(data);
            const result = await document.save();
            // console.log(result) // Uncomment to see the query result
            const resp = { result: Constant.OK_CODE, _id: result["_id"] };
            resolve(resp);
        } catch (error) {
            const resp = {
                result: Constant.FAILED_CODE,
                message: Constant.SERVER_ERR,
                err: error
            };
            console.error(error);
            reject(resp);
        }
    });
};


Word.prototype.search_by_condition = async function (
    condition,
    paging = {},
    fields = {},
    sort = {},
    resp_func = function (results) {

    } // callback function
) {
    try {
        const res = await Word.find(condition)
            .limit(paging.limit)
            .skip(paging.skip)
            .select(fields)
            .sort(sort)
        // Uncomment to respond HTTP request
        const total = await Word.countDocuments(condition) // total words
        const resp = {
            result: Constant.OK_CODE,
            data: {
                words: res,
                page: (paging.skip / paging.limit) + 1,
                total,
                totalPages: Math.max(Math.ceil(total / paging.limit), 1) // the smallest acceptable totalPages is 1
            },
        }
        resp_func(resp)
        return res // Uncomment this and comment above to return query result instead of displaying it
    } catch (error) {
        const resp = {
            result: Constant.FAILED_CODE,
            message: Constant.SERVER_ERR,
            name: error.name,
            kind: error.kind
        }
        console.error(error);
        resp_func(resp)
    }
}

Word.prototype.update = function (conditions, data) {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await Word.updateOne(conditions, data)
            // console.log(result) // Uncomment to see the query result
            const resp = { result: Constant.OK_CODE, };
            resolve(resp);
        } catch (error) {
            const resp = {
                result: Constant.FAILED_CODE,
                message: Constant.SERVER_ERR,
                err: error
            };
            console.error(error);
            reject(resp);
        }
    });
};

Word.prototype.delete = function (conditions) {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await Word.deleteOne(conditions)
            // console.log(result) // Uncomment to see the query result
            const resp = { result: Constant.OK_CODE, };
            resolve(resp);
        } catch (error) {
            const resp = {
                result: Constant.FAILED_CODE,
                message: Constant.SERVER_ERR,
                err: error
            };
            console.error(error);
            reject(resp);
        }
    });
};

// Return the Word model after initialization
module.exports = Word;