// Allowed extensions for file upload
const imageMimeTypes = [
    'image/webp',
    'image/tiff',
    'image/svg+xml',
    'image/png',
    'image/jpeg',
    'image/vnd.microsoft.icon',
    'image/gif',
    'image/bmp',
];

const app = new Vue({
    el: '#app',
    data: {
        test: 'hello',
        teams: [],
        name: '',
        description: '',
        team: '',
        gender: '',
        avatar: null,
        fbProfile: '',
        twitterProfile: '',
        errorMessage: ''
    },
    mounted: function () {
        // This function is called after all DOM elements rendered in HTML page
        this.$nextTick(function () {
            this.fetchTeams()
        })
    },
    methods: {
        logOut() {
            localStorage.removeItem('userLoggedIn')
        },
        fetchTeams() {
            axios.get('./teams', {})
                .then(response => {
                    this.teams = response.data.data
                })
                .catch(error => {
                    this.errorMessage = 'Error occurred during fetching teams.'
                })
        },
        onFileChange(event) {
            this.avatar = event.target.files[0];
        },
        saveMember() {
            if (!this.validImageUpload()) return

            const formData = new FormData();
            formData.append('name', this.name.trim());
            formData.append('description', this.description.trim());
            formData.append('team', this.team);
            formData.append('gender', this.gender);
            formData.append('avatar', this.avatar);
            formData.append('fbProfile', this.fbProfile.trim());
            formData.append('twitterProfile', this.twitterProfile.trim());
            // console.log(formData.get('avatar'));

            // Send data to backend to validate
            axios.post('./addnew', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data' // Specifically for sending FormData
                }
            })
                .then(response => {
                    // Handle successful response
                    const data = response.data
                    console.log(data);
                    alert('Add member successfully!')

                    // Reset attributes
                    this.errorMessage = ''
                    this.name = ''
                    this.description = ''
                    this.team = ''
                    this.gender = ''
                    this.avatar = null
                    this.fbProfile = ''
                    this.twitterProfile = ''
                })
                .catch(error => {
                    // Handle error response
                    this.errorMessage = 'Error occurred during adding new member.'
                    // console.log(error); // Uncomment to debug
                })
        },
        validImageUpload() {
            let isValid = false
            const MB = 1024 ** 2
            const maxMB = 5
            if (!this.validateExtension(this.avatar, imageMimeTypes)) {
                this.errorMessage = "The avatar upload is not an image."
                return isValid
            }
            if (!this.validateSize(this.avatar, 5 * MB)) {
                this.errorMessage = "The avatar size exceeds " + maxMB + " Megabytes."
                return isValid
            }

            isValid = true
            return isValid
        },
        validateSize(file, max) {
            return file.size <= max
        },
        validateExtension(file, allowedExtensions = []) {
            return allowedExtensions.includes(file.type)
        }
    },
    computed: {
        loggedIn: function () {
            const userLoggedIn = localStorage.getItem('userLoggedIn')
            return !(userLoggedIn === null || userLoggedIn === '')
        },
    }
});
