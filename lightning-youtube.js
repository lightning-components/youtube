class LightningYoutube extends HTMLElement {
    static REGEX = new RegExp('https:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9]+)');
    static DEFAULT_WIDTH = 560;
    static DEFAULT_HEIGHT = 315;

    constructor() {
        super();

        this.assertNoscriptIsOnlyChildNode();
        this.assertValidYoutubeSource();

        // here, we are going to store the exact iframe supplied to us, so that we can
        // use it later when we replace the placeholder image with the actual iframe
        const template = document.createElement('template');
        template.innerHTML = this.querySelector('noscript').innerHTML.trim();
        this.iframe = template.content.firstChild;

        // we don't need the noscript or iframe anymore
        this.innerHTML = '';

        // pull the video id from the iframe src
        const matches = LightningYoutube.REGEX.exec(this.iframe.src);
        this.videoId = matches[1];
        this.width = this.iframe.width || LightningYoutube.DEFAULT_WIDTH;
        this.height = this.iframe.height || LightningYoutube.DEFAULT_HEIGHT;
        this.attachShadow({mode: 'open'}).innerHTML = this.template();;
    }

    /**
     * We require a noscript tag because it will ensure that the iframe never attempts to begin rendering while
     * still enabling us to use the full iframe tag that the developer would have used without lightning-youtube.
     * Allowing a playable video with javascript disabled is not a goal of this project because the YouTube iframe
     * will not work without javascript.
     */
    assertNoscriptIsOnlyChildNode() {
        if (this.children.length !== 1 || this.children[0].tagName !== 'NOSCRIPT') {
            throw new Error('You must supply a noscript tag. Please refer to the usage documentation for the lightning-youtube component.');
        }
    }

    assertValidYoutubeSource() {
        if (!LightningYoutube.REGEX.test(this.innerHTML)) {
            throw new Error('You must supply a valid YouTube src. Please refer to the usage documentation for the lightning-youtube component.');
        }
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
        container.innerHTML = this.getIframeStringWithAutoplayEnabled();
        // we only need to insert the iframe once
        this.removeEventListener('click', this.insertIframe);
    }

    /**
     * We already have the original iframe element stored in this.iframe,
     * but we need to replicate it with all attributes except using
     * autoplay=1 whether it was developer-supplied or not.
     */
    getIframeStringWithAutoplayEnabled() {
        // here, we ensure that autoplay is enabled because the user has already
        // indicated that the want the video to play
        const url = new URL(this.iframe.src);
        url.searchParams.set('autoplay', '1');
        this.iframe.src = url.toString();

        // add our own class to the iframe
        this.iframe.classList.add('lightning-youtube__iframe')

        // ensure the iframe is the same dimensions as the placeholder image
        this.iframe.width = this.width;
        this.iframe.height = this.height;

        return this.iframe.outerHTML;
    }
}

customElements.define('lightning-youtube', LightningYoutube);
