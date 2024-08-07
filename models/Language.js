/*
    Define scheme for collection User using in this project
*/
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Constant = require("../common/constant")
// const languages = require("../config/languages.json")
const fs = require('fs')
const path = require('path')

// const fields = {}
// languages.forEach(language => {
//     fields[language.key] = { type: String, unique: true } // word in a language
// })
// console.log(fields);
// const wordSchema = new Schema(fields, { strict: false }) // Allow dynamic fields
const languageSchema = new Schema({
    name: { type: String, required: true, unique: true },
    key: { type: String, required: true, unique: true },
    imageUrl: { type: String, required: true }
})

const Language = mongoose.model("languages", // "words" is the collection name
    languageSchema
)

Language.prototype.create = function (data) {
    return new Promise(async (resolve, reject) => {
        try {
            const document = new Language(data);
            const result = await document.save();
            // console.log(result) // Uncomment to see the query result
            const { name, key, imageUrl, _id } = result
            const resp = { result: Constant.OK_CODE, name, key, imageUrl, _id };
            console.log(resp);
            // saveLanguagesInJSON()
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


Language.prototype.search_by_condition = async function (
    condition,
    paging = {},
    fields = {},
    sort = {},
    resp_func = function (results) {

    } // callback function
) {
    try {
        const res = await Language.find(condition)
            .limit(paging.limit)
            .skip(paging.skip)
            .select(fields)
            .sort(sort)
        // Uncomment to respond HTTP request
        const total = await Language.countDocuments(condition) // total words
        const resp = {
            result: Constant.OK_CODE,
            data: {
                languages: res,
                // page: (paging.skip / paging.limit) + 1,
                // total,
                // totalPages: Math.max(Math.ceil(total / paging.limit), 1) // the smallest acceptable totalPages is 1
            },
        }
        // saveLanguagesInJSON()
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

// Word.prototype.update = function (conditions, data) {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const result = await Word.updateOne(conditions, data)
//             // console.log(result) // Uncomment to see the query result
//             const resp = { result: Constant.OK_CODE, };
//             resolve(resp);
//         } catch (error) {
//             const resp = {
//                 result: Constant.FAILED_CODE,
//                 message: Constant.SERVER_ERR,
//                 err: error
//             };
//             console.error(error);
//             reject(resp);
//         }
//     });
// };

// Word.prototype.delete = function (conditions) {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const result = await Word.deleteOne(conditions)
//             // console.log(result) // Uncomment to see the query result
//             const resp = { result: Constant.OK_CODE, };
//             resolve(resp);
//         } catch (error) {
//             const resp = {
//                 result: Constant.FAILED_CODE,
//                 message: Constant.SERVER_ERR,
//                 err: error
//             };
//             console.error(error);
//             reject(resp);
//         }
//     });
// };

// make this available to our users in our Node applications
module.exports = Language