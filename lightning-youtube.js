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
            cursor: pointer;
            position: relative;
        }
        .lightning-youtube__play-button {
            width: 90px;
            height: 60px;
            background-color: rgba(0, 0, 0, 0.5);
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
            z-index: 1;
            border-radius: 6px;
            position: absolute;
        }
        .lightning-youtube__play-button:before {
            content: "";
            border-style: solid;
            border-width: 15px 0 15px 26px;
            border-color: transparent transparent transparent #fff;
        }
        .lightning-youtube__play-button, .lightning-youtube__play-button:before {
            top: 50%;
            left: 50%;
            transform: translate3d( -50%, -50%, 0 );
            position: absolute;
        }
        </style>
        
        <div class="lightning-youtube">
            <img class="lightning-youtube__placeholder-image" width="${this.width}" height="${this.height}" loading="lazy" src="https://img.youtube.com/vi/${this.videoId}/maxresdefault.jpg" alt="Youtube Placeholder Image" />
            <div class="lightning-youtube__play-button"></div>
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
