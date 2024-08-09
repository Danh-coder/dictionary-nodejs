// script.js
// Uncomment to debug
// Swal.fire("SweetAlert2 is working!"); // A pretty-styled alert

const app = new Vue({
    el: '#app',
    data: {
        domain: 'http://localhost:3000/words/',
        dataTable: null,
        languagesWithFlags: [],
        selectedLanguage: null,
        languages: [],
        words: [],
        currentPage: 1, // init value
        pageSize: 10, // Adjust as needed 
        totalPages: 1, // init value
        isAscending: null, // boolean
        sortKey: '',
        csv: null,
        word: {},
        errorMessage: '',
        id: '',
        searchQuery: '', // Add this line
        searchLanguage: '', // Add this line
    },
    watch: {
        languages(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.searchLanguage = newVal[0]?.key || '';
                this.sortKey = this.searchLanguage;
            }
        }
    },
    async mounted() {
        const path = window.location.pathname;
        const pathParts = path.split('/');
        // Uncomment to debug
        // console.log(path);
        // console.log(pathParts);

        await this.fetchLanguages();
        this.initializeWord();

        if (path === '/words/') {
            await this.fetchWords();

            // Init Bootstrap data table
            this.initDataTable()
            this.updateDataTable()
        } else if (pathParts.length === 4 && pathParts[1] === 'words' && ['show', 'edit'].includes(pathParts[2])) {
            this.id = pathParts[3];
            this.fetchWordDetails();
        } else if (pathParts.length === 3 && pathParts[1] === 'words' && ['language'].includes(pathParts[2])) {
            this.fetchLanguageList() // for select input
        }
    },
    methods: {
        async deleteLanguage(key) {
            // Uncomment below to display warning popup
            // const result = await Swal.fire({
            //     icon: 'warning',
            //     title: 'Are you sure?',
            //     showDenyButton: true,
            //     showCancelButton: true,
            //     confirmButtonText: "Yes",
            //     denyButtonText: 'No'
            // })
            // if (!result.isConfirmed) return

            // Uncomment below to debug
            console.log(key);

            try {
                const result = await axios.delete(this.domain + `./language`, { params: { key } })
                this.languages = this.languages.filter(language => language.key !== key);
                Toast.fire({
                    icon: 'success',
                    title: 'Delete successfully'
                })
            } catch (error) {
                console.error('Error deleting language:', error);
                PopupError.fire({
                    title: 'Error occurred while deleting language'
                })
            }
        },
        async fetchLanguageList() {
            try {
                const response = await axios.get(this.domain + './all-languages'); // unify url link                
                this.languagesWithFlags = response.data
                // this.errorMessage = ''
                // console.log(response.data);

            } catch (error) {
                console.error('Error fetching all languages:', error);
                // this.errorMessage = 'Error occurred while translating'
                PopupError.fire({
                    title: 'Error occurred while fetching all languages'
                })
            }
        },
        initDataTable() {
            // Uncomment to use the old way to display data table
            // this.dataTable = $('#example').DataTable();
            // return

            // Define data columns
            let columns = []
            for (const language of this.languages) {
                columns.push({
                    "data": language.key
                })
            }
            columns.push({ "data": 'action' }) // contain action buttons
            // console.log(columns);

            // Disable alert warning when displaying data table
            $.fn.dataTable.ext.errMode = 'none';

            // Load data table
            this.dataTable = $('#example').on('error.dt', function (e, settings, techNote, message) {
                console.log('An error has been reported by DataTables: ', message);
            }).DataTable({
                "columns": columns
            });
        },
        updateDataTable() {
            // Uncomment to use the old way to display data table
            // return 

            // Add action buttons to data rows
            let wordsWithButtons = []
            this.words.forEach(word => {
                wordsWithButtons.push({
                    ...word,
                    action: `
                        <ul class="action-list">
                            <li><a href="#" data-tip="show" onclick="app.showWord('${word._id}')"><i class="fa-solid fa-magnifying-glass"></i></a></li>
                            <li><a href="#" data-tip="edit" onclick="app.editWord('${word._id}')"><i class="fa fa-edit"></i></a></li>
                            <li><a href="#" data-tip="delete" onclick="app.destroyWord('${word._id}')"><i class="fa fa-trash"></i></a></li>
                        </ul>
                    `
                })
            })

            // Refresh data table
            this.dataTable = $('#example').DataTable();
            this.dataTable.clear()
            this.dataTable.rows.add(wordsWithButtons).draw()
        },
        async translateAll() {
            const baseLanguage = 'english'; // Assuming the base language is English
            const baseWord = this.word[baseLanguage];
            if (!baseWord) {
                // this.errorMessage = 'Please enter a word in English to translate.';
                Popup.fire({
                    icon: "error",
                    title: "Oops...",
                    text: 'Please enter a word in English to translate.',
                });
                return;
            }

            try {
                // System is loading...
                // this.errorMessage = 'Translating...'
                Toast.fire({
                    icon: 'info',
                    title: 'Translating...'
                })

                const response = await axios.get(this.domain + './translate', {
                    params: { // in the form of: ?abc=xyz&...
                        baseWord,
                        baseLanguage
                    }
                }); // unify url link                
                this.word = response.data
                // this.errorMessage = ''
                // console.log(response.data);

            } catch (error) {
                console.error('Error translating words:', error);
                // this.errorMessage = 'Error occurred while translating'
                PopupError.fire({
                    title: 'Error occurred while translating'
                })
            }
        },
        handleFileUpload(event) {
            this.newLanguage.flagImage = event.target.files[0];
        },
        toTitleCase(str) {
            return str.replace(
                /\w\S*/g,
                text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
            );
        },
        async addLanguage() {
            // console.log(this.newLanguage);

            // if (!this.newLanguage.name || !this.newLanguage.flagImage) {
            //     // this.errorMessage = "Please provide both the language name and it's flag image"
            //     PopupError.fire({
            //         title: "Please provide both the language name and it's flag image"
            //     })
            //     return;
            // }

            // const isOk = this.validImage()
            // if (!isOk) return false

            // const formData = new FormData();
            // formData.append('name', this.toTitleCase(this.newLanguage.name.trim()));
            // formData.append('key', this.newLanguage.name.trim().toLowerCase());
            // formData.append('image', this.newLanguage.flagImage);
            
            if (!this.selectedLanguage) {
                PopupError.fire({
                    title: "Language is not selected"
                })
                return;
            }

            try {
                // this.errorMessage = 'Loading...'
                // const response = await axios.post('./language', formData, {
                //     headers: {
                //         'Content-Type': 'multipart/form-data'
                //     }
                // });
                // this.languages.push(response.data);
                // this.errorMessage = ''
                // this.newLanguage.name = '';
                // this.newLanguage.key = '';
                // this.newLanguage.flagImage = null;
                // console.log(this.languages);
                // console.log(response.data);

                // Add new field
                this.selectedLanguage.key = this.selectedLanguage.name.toLowerCase()
                this.selectedLanguage.imageUrl = `https://flagcdn.com/${this.selectedLanguage.countryCode}.svg`
                // Ask server to add new language
                const response = await axios.post('./language', this.selectedLanguage)
                this.languages.push(response.data);
                this.errorMessage = ''
                console.log(this.languages);
                console.log(response.data);

                // Notify success
                Toast.fire({
                    icon: 'success',
                    title: 'Add language successfully'
                })

            } catch (error) {
                console.error('Error adding language:', error);
                // this.errorMessage = 'Error occurred while adding language'
                PopupError.fire({
                    title: 'Error occurred while adding language'
                })
            }
        },
        validImage() {
            let allowedExtension = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp'];
            let isValid = false;
            const flagImage = this.newLanguage.flagImage

            // Validate file type
            if (!allowedExtension.includes(flagImage.type)) {
                this.errorMessage = 'Please upload a valid image file.';
                return isValid;
            }

            // Validate file size (e.g., limit to 5MB)
            const maxSize = 5 * 1024 * 1024;
            if (this.newLanguage.flagImage.size > maxSize) {
                this.errorMessage = `File size should not exceed ${maxSize / (1024 * 1024)}MB.`;
                return isValid;
            }

            isValid = true
            return isValid
        },
        async fetchLanguages() {
            try {
                const response = await axios.get(this.domain + './languages'); // unify url link                
                this.languages = response.data.data.languages;
                console.log(response.data);
            } catch (error) {
                console.error('Error fetching languages:', error);
                PopupError.fire({
                    title: 'Error fetching languages: ' + error
                })
            }
        },
        initializeWord() {
            this.languages.forEach(language => {
                // console.log(language);
                this.$set(this.word, language.key, '');
            });
            // console.log(this.word);
        },
        exportCSV() {
            axios.get('./csvexport', {
                params: { // in the form of: ?abc=xyz&...
                    sortKey: this.sortKey,
                    isAscending: this.isAscending,
                    searchQuery: this.searchQuery, // Pass search query to the backend
                    searchLanguage: this.searchLanguage, // Pass search language to the backend
                },
                responseType: 'blob'
            })
                .then(response => {
                    const BOM = '\uFEFF'; // UTF-8 BOM
                    const reader = new FileReader();

                    reader.onload = function (event) {
                        const csvContent = BOM + event.target.result;
                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'words.csv');
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);

                        Toast.fire({
                            icon: 'success',
                            title: 'Export CSV successfully'
                        })
                    };

                    reader.readAsText(response.data);

                })
                .catch(error => {
                    PopupError.fire({
                        title: 'Error exporting CSV!'
                    })
                    console.error('Error exporting CSV:', error.message);
                });
        },
        sortWords(sortKey) {
            // this.currentPage = 1
            if (sortKey !== this.sortKey) this.isAscending = null // Make sure sorting always starts with ascending sort

            this.sortKey = sortKey
            switch (this.isAscending) {
                case null:
                    this.isAscending = true
                    break;
                case true:
                    this.isAscending = false
                    break;
                case false:
                    this.isAscending = null
                    break
                default:
                    break;
            }

            this.fetchWords()
        },
        searchWords() {
            this.currentPage = 1 // reset page to display
            this.fetchWords()
        },
        // fetchWords() {
        //     axios.get('./list', {
        //         params: { // in the form of: ?abc=xyz&...
        //             page: this.currentPage,
        //             pageSize: this.pageSize,
        //             sortKey: this.sortKey,
        //             isAscending: this.isAscending,
        //             searchQuery: this.searchQuery, // Pass search query to the backend
        //             searchLanguage: this.searchLanguage, // Pass search language to the backend
        //         }
        //     })
        //         .then(response => {
        //             // Handle successful response
        //             const { data } = response.data
        //             console.log(data);
        //             this.words = data.words
        //             this.totalPages = data.totalPages
        //         })
        //         .catch(error => {
        //             // Handle error
        //             console.log(error.message);
        //         })
        // },
        // Update function with async/await
        async fetchWords() {
            try {
                const response = await axios.get('./list', {
                    params: {
                        // Uncomment to allow pagination and sorting in backend
                        // page: this.currentPage,
                        // pageSize: this.pageSize,
                        // sortKey: this.sortKey,
                        // isAscending: this.isAscending,
                        searchQuery: this.searchQuery,
                        searchLanguage: this.searchLanguage,
                    }
                });

                // Handle successful response
                const { data } = response.data;
                console.log(data);
                this.words = data.words;
                this.totalPages = data.totalPages;
            } catch (error) {
                // Handle error
                console.error(error.message);
                PopupError.fire({
                    title: 'Error occurred while fetching words'
                })
            }
        },
        changePage(pageNumber) {
            if (pageNumber >= 1 && pageNumber <= this.totalPages) {
                this.currentPage = pageNumber;
                this.fetchWords();
            }
        },
        fetchWordDetails() {
            // console.log('fetch word details');
            axios.get('../get/' + this.id, {})
                .then(response => {
                    // Handle successful response
                    const { data } = response.data
                    // console.log(data);
                    this.word = data.words[0]
                    // this.english = word.english
                    // this.german = word.german
                    // this.french = word.french
                    // this.vietnamese = word.vietnamese
                })
                .catch(error => {
                    // Handle error
                    console.log(error.message);
                    PopupError.fire({
                        title: 'Error occurred while fetching word details'
                    })
                })
        },
        showWord(id) {
            // alert('Show clicked for word with ID ' + id);
            window.location.href = './show/' + id
        },
        editWord(id) {
            // alert('Edit clicked for word with ID ' + id);
            window.location.href = './edit/' + id
        },
        async destroyWord(id) {
            // const ok = confirm('Are you sure?');
            const result = await Swal.fire({
                icon: 'warning',
                title: 'Are you sure?',
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: "Yes",
                denyButtonText: 'No'
            })
            if (!result.isConfirmed) return

            axios.delete('./delete/' + id)
                .then(response => {
                    console.log(response.data);

                    // Success insertion
                    this.words = this.words.filter(word => word._id !== id) // Remove deleted words
                    Toast.fire({
                        icon: 'success',
                        title: 'Delete successfully'
                    })
                    this.updateDataTable()
                })
                .catch(error => {
                    // Handle error
                    console.log(error.response.data);
                    PopupError.fire({
                        title: 'Error occurred while deleting words'
                    })
                })
        },
        updateWord() {
            // Validate user input
            // Uncomment to debug
            // console.log(this.word);
            const missingFields = this.languages.filter(language => !this.word[language.key])
            if (missingFields.length > 0) {
                // this.errorMessage = 'All fields are required!';
                PopupError.fire({
                    title: 'All fields are required!'
                })
                return;
            }

            // Send data to backend
            // Trim all user input
            for (let [key, value] of Object.entries(this.word)) {
                console.log(key, value);
                if (typeof value === 'string') {
                    this.word[key] = value.trim();
                } else {
                    console.error(`Unexpected type for key ${key}:`, value);
                }
            }
            axios.put('../update/' + this.id, this.word) //{ // Uncomment below and comment this.word) to use static data
                // english: this.english.trim(),
                // german: this.german.trim(),
                // french: this.french.trim(),
                // vietnamese: this.vietnamese.trim()
                //})
                .then(response => {
                    console.log(response.data);

                    // Success insertion
                    // alert('Update words successfully!');
                    Popup.fire({
                        icon: 'success',
                        title: 'Update successfully!'
                    }).then((result) => {
                        // After the pop up is closed
                        window.location.href = '../';
                    })
                })
                .catch(error => {
                    // Handle error
                    console.log(error.response.data);
                    // this.errorMessage = error.response.data || 'Error occurred while updating words!';
                    PopupError.fire({
                        title: error.response.data || 'Error occurred while updating words!'
                    })
                });
        },
        addNewWord() {
            // Validate user input
            // Uncomment to debug
            // console.log(this.word);
            const missingFields = this.languages.filter(language => !this.word[language.key])
            if (missingFields.length > 0) {
                // this.errorMessage = 'All fields are required!';
                PopupError.fire({
                    title: 'All fields are required!'
                })
                return;
            }

            // Send data to backend
            axios.post('./addnew', this.word) //{ // Uncomment below and comment this.word) to use static data
                // english: this.english.trim(),
                // german: this.german.trim(),
                // french: this.french.trim(),
                // vietnamese: this.vietnamese.trim()
                //})
                .then(response => {
                    console.log(response.data);

                    // Success insertion
                    // alert('Add new words successfully!');
                    Popup.fire({
                        icon: 'success',
                        title: 'Add words successfully!'
                    }).then((result) => {
                        // After the pop up is closed
                        window.location.href = './';
                    })
                })
                .catch(error => {
                    // Handle error
                    console.log(error.response.data);
                    // this.errorMessage = error.response.data || 'Error occurred while adding words!';
                    PopupError.fire({
                        title: error.response.data || 'Error occurred while adding words!'
                    })
                });
        },
        onFileChange(event) {
            this.csv = event.target.files[0];
            // Uncomment to debug
            // console.log(this.csv);
        },
        async addNewWordCSV() {
            if (!this.csv) {
                // this.errorMessage = "CSV file isn't uploaded!";
                PopupError.fire({
                    title: "CSV file isn't uploaded!"
                })
                return;
            }

            try {
                // Validate csv file
                const isValid = await this.validCSVFile();
                if (!isValid) return;

                // Append data
                const formData = new FormData();
                formData.append('csv', this.csv);

                // Send data to backend to validate
                const response = await axios.post('./csvimport', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data' // Specifically for sending FormData
                    }
                });

                // Handle successful response
                const data = response.data;
                console.log(data);
                // alert('Add new words successfully!');
                this.errorMessage = '';

                Popup.fire({
                    icon: 'success',
                    title: 'Add words successfully!'
                }).then((result) => {
                    // After the pop up is closed
                    window.location.href = './';
                })
            } catch (error) {
                // Handle error response
                if (error.response && error.response.data) {
                    const errorData = error.response.data;
                    if (errorData.failedWords) {
                        this.errorMessage = 'Some words failed to save:\n' + errorData.failedWords.map(fw => `Row: ${JSON.stringify(fw.row)}, Error: ${fw.error}`).join('\n');

                        PopupError.fire({
                            title: this.errorMessage
                        })
                    } else if (errorData.error) {
                        // this.errorMessage = errorData.error;
                        PopupError.fire({
                            title: errorData.error
                        })
                    }
                } else {
                    // this.errorMessage = 'An error occurred while processing the request.';
                    PopupError.fire({
                        title: 'An error occurred while processing the request.'
                    })
                }
                console.log(error);
            }
        },
        validCSVFile() {
            return new Promise((resolve, reject) => {
                let isValid = false;

                // Validate file type
                const allowedTypes = ['text/csv'];
                if (!allowedTypes.includes(this.csv.type)) {
                    // this.errorMessage = 'Please upload a valid CSV file.';
                    PopupError.fire({
                        title: 'Please upload a valid CSV file.'
                    })
                    resolve(isValid);
                    return;
                }

                // Validate file size (e.g., limit to 5MB)
                const maxSize = 5 * 1024 * 1024;
                if (this.csv.size > maxSize) {
                    // this.errorMessage = `File size should not exceed ${maxSize / (1024 * 1024)}MB.`;
                    PopupError.fire({
                        title: `File size should not exceed ${maxSize / (1024 * 1024)}MB.`
                    })
                    resolve(isValid);
                    return;
                }

                // Make sure column names are correct
                const reader = new FileReader();
                reader.onload = () => {
                    const rows = reader.result.trim().split(/\r\n|\n|\r|\t/);
                    const colnames = rows[0].split(',');
                    const requiredLanguages = this.languages.map(language => language.name)

                    const requiredLanguagesNotIncluded = requiredLanguages.filter(name => !colnames.includes(name))
                    console.log(requiredLanguagesNotIncluded);
                    if (requiredLanguagesNotIncluded.length) {
                        this.errorMessage = 'Column names are incorrect. They must be respectively: ' + requiredLanguages.join(', ');
                        PopupError.fire({
                            title: 'Column names are incorrect. They must be respectively: ' + requiredLanguages.join(', ')
                        })
                        resolve(isValid);
                        return;
                    }

                    // Uncomment to validate empty values
                    // for (let index = 2; index < rows.length; index += 2) { // avoid some row elements' values are '\r\n'
                    //     const rowValues = rows[index].split(',');
                    //     if (rowValues.includes('')) {
                    //         this.errorMessage = `In row ${index + 1}, there is one or more missing words.`;
                    //         resolve(isValid);
                    //         return;
                    //     }
                    // }

                    // CSV file is valid
                    isValid = true;
                    resolve(isValid);
                };

                // Handle file read errors
                reader.onerror = () => {
                    // this.errorMessage = 'Error reading file.';
                    PopupError.fire({
                        title: 'Error reading file.'
                    })
                    reject(isValid);
                };

                // Start reading the file. When it is done, calls the onload event defined above.
                reader.readAsBinaryString(this.csv);
            });
        }

    },
    computed: {
        pagesToShow() {
            const pages = [];
            let startPage = Math.max(1, this.currentPage - 5);
            let endPage = Math.min(this.totalPages, startPage + 9);
            if (endPage - startPage < 9) {
                startPage = Math.max(1, endPage - 9);
            }
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
            return pages;
        }
    }
});
