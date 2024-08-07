var express = require('express');
var router = express.Router();
const fs = require('fs')
const csv = require('csv-parser');
const { Parser } = require('json2csv');
const upload = require('../utils/multer')
const Constant = require('../common/constant')
// const languages = require('../config/languages.json') // Load languages from JSON file
const Language = require('../models/Language');
const Word = require('../models/Word');
const Gemini = require('../utils/gemini')

router.get('/', function (req, res, next) {
  res.render('words')
});

/* GET words translated */
router.get('/translate', async (req, res) => {
  const { baseWord, baseLanguage } = req.query

  try {
    // Fetch language names
    const language = new Language()
    const languages = await language.search_by_condition()
    const languageNames = languages.map(language => language.name)

    // Translate words
    const gemini = new Gemini()
    const results = await gemini.translateWord(baseWord, baseLanguage, languageNames)
    const resultObj = JSON.parse(results)
    res.json(resultObj)
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred when translating words')
  }
})

// Endpoint to fetch language metadata
router.get('/languages', async (req, res) => {
  try {
    const language = new Language()
    await language.search_by_condition(
      {},
      {},
      {},
      {},
      function (results) {
        res.status(200).json(results)
      }
    )
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred while fetching documents');
  }
});

/* GET add word form */
router.get('/new', function (req, res, next) {
  res.render('addnew')
});

/* GET add language form */
router.get('/language', function (req, res, next) {
  res.render('language')
});

/* POST add language to database */
router.post('/language', upload.single('image'), async (req, res, next) => {
  const { name, key } = req.body
  const imageUrl = req.file ? `/images/uploads/${req.file.filename}` : ''
  if (!name || !key) {
    return res.status(400).send('Language name and key are required');
  }

  try {
    const newLanguage = { name, key, imageUrl };
    // Uncomment below to debug
    // console.log(newLanguage);
    const language = new Language()
    const result = await language.create(newLanguage)
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred when adding data.');
  }

})

/* GET word list */
router.get('/list', async function (req, res, next) {
  try {
    const word = new Word()
    // pagination
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.pageSize) || 10;

    // Uncomment to create sample data
    // await word.create({
    //   english: 'Hello',
    //   german: 'Halo',
    //   french: 'Bonjour',
    //   vietnamese: 'Xin chào'
    // }, function (results) { console.log(results) })

    // Set condition or filter
    let conditions = {}
    if (req.query.searchLanguage && req.query.searchQuery) {
      conditions = {
        [req.query.searchLanguage]: {
          $regex: req.query.searchQuery,
          $options: 'i' // case-insensitive
        }
      }
    }
    // console.log(conditions);

    // Set pagination
    let paging = {}
    paging = { limit, skip: (page - 1) * limit }

    // Set sorting
    let sort = {}
    if (req.query.sortKey && req.query.isAscending !== undefined) {
      sort = {
        [req.query.sortKey]: (req.query.isAscending === 'true' ? 1 : -1)
      }
    }
    // Uncomment below to debug
    // console.log(req.query.isAscending);
    // console.log(sort);

    await word.search_by_condition(
      conditions,
      paging,
      {},
      sort,
      function (results) {
        res.status(200).json(results)
      }
    )
  } catch (error) {
    res.status(500).send('Error occurred during fetching data.')
    console.error(error);

  }
})

/* POST add new word */
router.post('/addnew', async (req, res, next) => {
  try {
    const word = new Word();
    const { body } = req;
    const query = {};

    // Construct regex-based query to check for uniqueness
    for (const key in body) {
      if (body.hasOwnProperty(key)) {
        query[key] = new RegExp(`^${body[key]}$`, 'i'); // Case-insensitive match
      }
    }
    // Uncomment below to debug
    // console.log(query);    

    const existingWord = await word.search_by_condition(query)
    // Uncomment below to debug
    // console.log(existingWord);

    if (existingWord.length) {
      return res.status(400).send('Word already exists.');
    }
    const result = await word.create(body);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred during adding new word.');
  }
});

/* POST import csv file */
router.post('/csvimport', upload.single('csv'), async (req, res, next) => {
  const csvFilePath = req.file.path;

  // Query languages in database
  const language = new Language()
  const languages = await language.search_by_condition()
  // console.log(languages);    

  const words = [];
  // const requiredHeaders = ['English', 'German', 'French', 'Vietnamese'];
  const requiredHeaders = languages.map(language => language.name)
  let headersValidated = false;
  let errorOccurred = false;
  let failedWords = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('headers', (headers) => {
      headersValidated = requiredHeaders.every(header => headers.includes(header));
      if (!headersValidated) {
        fs.unlinkSync(csvFilePath);
        return res.status(400).json({ error: 'CSV file is missing required headers: English, German, French, Vietnamese' });
      }
    })
    .on('data', (row) => {
      if (headersValidated) {
        // Additional content validation
        const missingFields = languages.filter(language => !row[language.name]);

        if (missingFields.length > 0) {
          errorOccurred = true;
          failedWords.push({
            row,
            error: 'Missing required data in CSV'
          });
        } else {
          words.push(row);
        }
      }
    })
    .on('end', async () => {
      if (!errorOccurred && headersValidated) {
        console.log('CSV file successfully processed');
        fs.unlinkSync(csvFilePath); // Remove the file after processing

        const word = new Word();
        for (const row of words) {
          try {
            // Dynamically construct the object to be created
            let wordData = {};
            languages.forEach(language => {
              wordData[language.key] = row[language.name];
            });

            await word.create(wordData, function (results) {

            });
          } catch (error) {
            failedWords.push({
              row,
              error: 'Failed to save to database'
            });
          }
        }

        if (failedWords.length > 0) {
          return res.status(400).json({
            error: 'Some words failed to save',
            failedWords
          });
        }

        res.json({ message: 'CSV file uploaded successfully!', words });
      } else {
        res.status(400).json({
          error: 'Error occurred during CSV processing.',
          failedWords
        });
      }
    })
    .on('error', (error) => {
      console.error('Error processing CSV file:', error);
      res.status(500).json({ error: 'Error processing CSV file.' });
    });
});

/* GET CSV file exported */
router.get('/csvexport', async (req, res, next) => {
  try {
    const word = new Word()
    const language = new Language()

    // Query languages in database
    const languages = await language.search_by_condition()
    // console.log(languages);

    // Set condition or filter
    let conditions = {}
    if (req.query.searchLanguage && req.query.searchQuery) {
      conditions = {
        [req.query.searchLanguage]: {
          $regex: req.query.searchQuery,
          $options: 'i' // case-insensitive
        }
      }
    }
    // console.log(conditions);

    // Set sorting
    let sort = {}
    if (req.query.sortKey && req.query.isAscending !== undefined) {
      sort = {
        [req.query.sortKey]: (req.query.isAscending === 'true' ? 1 : -1)
      }
    }
    // Uncomment below to debug
    // console.log(req.query.isAscending);
    // console.log(sort);

    await word.search_by_condition(conditions,
      {},
      {},
      sort,
      resp_func = function (results) {
        const fields = languages.map(language => language.key);
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(results.data.words);

        // Uncomment to debug
        // console.log(results.data.words);

        // Convert CSV to UTF-8 encoded buffer
        const csvBuffer = Buffer.from(csv, 'utf-8');

        res.header('Content-Type', 'text/csv; charset=utf-8');
        res.attachment('words.csv');
        res.send(csvBuffer);
      });

  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
})

/* GET word details page */
router.get('/show/:id', (req, res, next) => {
  res.render('show')
})

/* GET word details from database */
router.get('/get/:id', async (req, res, next) => {
  try {
    const word = new Word()
    await word.search_by_condition(
      { _id: req.params.id },
      {},
      {},
      {},
      function (results) {
        res.status(200).json(results)
      }
    )
  } catch (error) {
    res.status(500).send('Error while fetching word details.')
    console.error(error);
  }
})

/* GET word edit form */
router.get('/edit/:id', (req, res, next) => {
  res.render('edit')
})

/* PUT word update */
router.put('/update/:id', async (req, res, next) => {
  const { id } = req.params
  const { body } = req
  try {
    const word = new Word()
    const query = {};

    // Construct regex-based query to check for uniqueness
    for (const key in body) {
      if (body.hasOwnProperty(key)) {
        query[key] = new RegExp(`^${body[key]}$`, 'i'); // Case-insensitive match
      }
    }
    // Uncomment below to debug
    // console.log(query);    

    const existingWord = await word.search_by_condition(query)
    // Uncomment below to debug
    // console.log(existingWord);

    if (existingWord.length) {
      return res.status(400).send('Word already exists.');
    }

    // Ready to update in database
    const result = await word.update({
      _id: id
    }, req.body)

    res.status(200).json(result)
  } catch (error) {
    console.error(error);
    res.status(500).send('Error while updating words.')
  }
})

/* DELETE word */
router.delete('/delete/:id', async (req, res, next) => {
  const { id } = req.params
  try {
    const word = new Word()
    const result = await word.delete({ _id: id })

    res.status(200).json(result)
  } catch (error) {
    console.error(error);
    res.status(500).send('Error while deleting words.')
  }
})

module.exports = router;
