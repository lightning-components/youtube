class LightningYoutube extends HTMLElement {
    static DEFAULT_WIDTH = 560;
    static DEFAULT_HEIGHT = 315;

    constructor() {
        super();

        // encode untrusted values
        this.videoId = encodeURIComponent(this.dataset.videoid);
        this.width = +encodeURIComponent(this.dataset.width) || LightningYoutube.DEFAULT_WIDTH;
        this.height = +encodeURIComponent(this.dataset.height) || LightningYoutube.DEFAULT_HEIGHT;

        this.attachShadow({mode: 'open'}).innerHTML = this.template();;
    }

    connectedCallback() {
        this.addEventListener('click', this.insertIframe);
    }

    template() {
        return `
        <style>
        .lightning-youtube {
            display: inline-block;
            background-color: #000;
        }
        </style>
        
        <div class="lightning-youtube">
            <img class="lightning-youtube__placeholder-image" width="${this.width}" height="${this.height}" loading="lazy" src="https://img.youtube.com/vi/${this.videoId}/maxresdefault.jpg" alt="Youtube Placeholder Image" />
        </div>
        `;
    }

    insertIframe() {
        const container = this.shadowRoot.querySelector('.lightning-youtube');
        container.innerHTML = `<iframe class="lightning-youtube__iframe" width="${this.width}" height="${this.height}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen src="https://www.youtube.com/embed/${this.videoId}?autoplay=1"></iframe>`;
        // we only need to insert the iframe once
        this.removeEventListener('click', this.insertIframe);
    }
}

customElements.define('lightning-youtube', LightningYoutube);
