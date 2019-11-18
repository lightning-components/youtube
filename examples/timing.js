document.onreadystatechange = () => {
    if (document.readyState === 'complete') {
        const timeInMilliseconds = Math.round(window.performance.getEntriesByType('navigation')[0].domComplete);

        document.querySelector('.dom-complete-time').innerHTML = timeInMilliseconds + 'ms';
    }
};
