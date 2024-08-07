// Comment the line below if it's in production
Vue.config.debug = true; Vue.config.devtools = true;

// Vue Component
Vue.component('navbar', {
    props: {
        currentPage: {
            type: String,
            required: false
        }
    },
    template: `
        <div class="navbar">
            <ul>
                <li><a :href="wordsUrl" :class="{active: currentPage === 'words'}"><i class="fa-regular fa-comment"></i>Words</a></li>
                <li><a :href="addNewUrl" :class="{active: currentPage === 'new'}"><i class="fa-solid fa-circle-plus"></i>New</a></li>
                <li><a :href="languageUrl" :class="{active: currentPage === 'add-language'}"><i class="fa-solid fa-language"></i>Language</a></li>
                <li><a :href="meUrl" :class="{active: currentPage === 'me'}"><i class="fa-solid fa-circle-user"></i>Me</a></li>
            </ul>
        </div>
    `,
    data() {
        return {
            domain: 'http://localhost:3000/'
        }
    },
    computed: {
        wordsUrl() { return this.domain + './words/' },
        addNewUrl() { return this.domain + './words/new' },
        languageUrl() { return this.domain + './words/language' },
        meUrl() { return this.domain + './me' }
    }
});