(() => {
    /*
     *
     *     Shadow DOM Template
     * ---------------------------
     *
     */
    const template = document.createElement('template');
    template.innerHTML = `

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
    <img class="lightning-youtube__placeholder-image" loading="lazy" alt="Youtube Placeholder Image" />
    <div class="lightning-youtube__play-button"></div>
</div>

`;




    /**
     *
     *     Custom Element
     * ----------------------
     *
     */
    class LightningYoutube extends HTMLElement {
        static REGEX = new RegExp('https:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9]+)');
        static DEFAULT_WIDTH = 560;
        static DEFAULT_HEIGHT = 315;

        constructor() {
            super();

            this.assertValidYoutubeSource();

            // we want the placeholder image to be the same dimensions as the video,
            // so store the width/height here
            this.width = this.getAttribute('width') || LightningYoutube.DEFAULT_WIDTH;
            this.height = this.getAttribute('height') || LightningYoutube.DEFAULT_HEIGHT;

            // store a reference to the actual iframe that will replace the placeholder image
            this.iframe = this.getIframeElementToBeInserted();

            // pull the video id from the src
            const matches = LightningYoutube.REGEX.exec(this.getAttribute('src'));
            this.videoId = matches[1];

            this.attachShadow({mode: 'open'});
            this.shadowRoot.appendChild(this.template());
        }

        connectedCallback() {
            this.addEventListener('click', this.insertIframe);
        }

        disconnectedCallback() {
            this.removeEventListener('click', this.insertIframe);
        }

        template() {
            const cloned = template.content.cloneNode(true);

            // we need to add the width, height, and src attributes to the placeholder image
            const image = cloned.querySelector('.lightning-youtube__placeholder-image');
            image.width = this.width;
            image.height = this.height;
            image.src = `https://img.youtube.com/vi/${this.videoId}/maxresdefault.jpg`;

            return cloned;
        }

        getIframeElementToBeInserted() {
            // get the current lightning-youtube element and replace
            // it with iframe, and we should have a valid youtube iframe embed
            const template = document.createElement('template');
            template.innerHTML = this.outerHTML.replace(/lightning-youtube/g, 'iframe').trim();
            const iframe = template.content.firstChild;

            // here, we ensure that autoplay is enabled because by the time we insert the
            // iframe into the DOM the user will have already indicated that they want the video to play
            const url = new URL(iframe.src);
            url.searchParams.set('autoplay', '1');
            iframe.src = url.toString();

            // add our own class to the iframe
            iframe.classList.add('lightning-youtube__iframe')
            // ensure the iframe is the same dimensions as the placeholder image
            iframe.width = this.width;
            iframe.height = this.height;

            return iframe;
        }

        insertIframe() {
            const container = this.shadowRoot.querySelector('.lightning-youtube');
            // clear all contents
            container.innerHTML = '';
            // insert the iframe into the DOM
            container.appendChild(this.iframe);
            // we only need to insert the iframe once
            this.removeEventListener('click', this.insertIframe);
        }

        assertValidYoutubeSource() {
            if (!LightningYoutube.REGEX.test(this.getAttribute('src'))) {
                throw new Error('You must supply a valid YouTube src. Please refer to the usage documentation for the lightning-youtube component.');
            }
        }
    }

    customElements.define('lightning-youtube', LightningYoutube);
})();
