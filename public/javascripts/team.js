Vue.component('navbar', {
    props: {
        loggedIn: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    template: `
        <nav class="navbar">
            <ul class="nav-list">
                <li class="nav-item"><a href="./" class="nav-link">Home</a></li>
                <li class="nav-item" v-show="!loggedIn"><a href="./login" class="nav-link">Login</a></li>
                <li class="nav-item" v-show="loggedIn"><a href="./login" @click="logOut" class="nav-link">Logout</a></li>
            </ul>
        </nav>
    `,
    data() {
        return {

        }
    },
    methods: {
        logOut: function () {
            localStorage.removeItem('userLoggedIn')
            this.loggedIn = false
        }
    }
})

const app = new Vue({
    el: '#app',
    data: {
        test: 'hello',
        members: [],
        page: 1,
        totalPages: 1,
        totalMembers: 1,
        gender: 'all'
    },
    mounted: function () {
        // This function is called after all DOM elements rendered in HTML page
        this.$nextTick(function () {
            this.fetchMembers(1);
        })
    },
    methods: {
        logOut() {
            localStorage.removeItem('userLoggedIn')
        },
        fetchMembers(page, filterGender = this.gender) {
            this.page = page
            axios.get(`./members?page=${this.page}&gender=${filterGender}`, {})
                .then(response => {
                    // Handle successful fetching
                    this.members = response.data.data.members
                    this.totalMembers = response.data.data.total
                    this.totalPages = response.data.data.totalPages
                    console.log(response.data);
                })
                .catch(error => {
                    // Handle error message
                    console.log(error.message);
                })
        },
        getPage(add = 0) {
            return Math.max(this.page + add, 1)
        },
        arrayRange(start, stop, step) {
            return Array.from(
                { length: (stop - start) / step + 1 },
                (value, index) => start + index * step
            );
        },
        addNewMember() {
            window.location.href = './addnew'
        }
    },
    computed: {
        loggedIn: function () {
            const userLoggedIn = localStorage.getItem('userLoggedIn')
            return !(userLoggedIn === null || userLoggedIn === '')
        },
        pagesToDisplay: function () {
            const maxNumberOfPagesToDisplay = 5
            if (this.totalPages <= maxNumberOfPagesToDisplay) return this.arrayRange(1, this.totalPages, 1)
            if (this.page <= maxNumberOfPagesToDisplay) return this.arrayRange(1, maxNumberOfPagesToDisplay ,1)
            return this.arrayRange(this.page - 4, this.page, 1)
        }
    }
});
