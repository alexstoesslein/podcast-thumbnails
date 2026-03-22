const PODCAST_CONFIGS = [
    {
        id: 'hotel-matze',
        name: 'Hotel Matze',
        logoSrc: 'assets/hotel-matze/logo.png',
        barSrc: 'assets/hotel-matze/bar.png',
        barType: 'image',
        font: 'OpenSansCondensed',
        textColor: '#FFFFFF',
        barTextColor: '#000000',
        strokeColor: '#000000',
        strokeWidth: 0.17,
        logoPos: { y: 83, scale: 25 },
        defaults: {
            bg: { x: 0, y: 0, zoom: 100 },
            text: { y: 64, fontSize: 105 },
            bar: { padding: 40 }
        }
    },
    {
        id: '50-ueber-50',
        name: '50 über 50',
        logoSrc: 'assets/50-ueber-50/logo.png',
        barType: 'roundedRect',
        barColor: '#FFFFFF',
        barRadius: 25,
        font: 'AvenirBlack',
        textColor: '#E30613',
        barTextColor: '#E30613',
        strokeColor: '#FFFFFF',
        strokeWidth: 0.07,
        logoPos: { y: 82, scale: 145 },
        defaults: {
            bg: { x: 0, y: 0, zoom: 100 },
            text: { y: 58.5, fontSize: 55 },
            bar: { padding: 25 }
        }
    }
];

function getConfig(podcastId) {
    return PODCAST_CONFIGS.find(c => c.id === podcastId) || PODCAST_CONFIGS[0];
}
