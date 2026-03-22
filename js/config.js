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
        logoPos: { y: 83, scale: 25 },
        defaults: {
            bg: { x: 0, y: 0, zoom: 100 },
            text: { y: 64, fontSize: 100 },
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
        logoPos: { y: 80, scale: 150 },
        defaults: {
            bg: { x: 0, y: 0, zoom: 100 },
            text: { y: 60, fontSize: 70 },
            bar: { padding: 50 }
        }
    }
];

function getConfig(podcastId) {
    return PODCAST_CONFIGS.find(c => c.id === podcastId) || PODCAST_CONFIGS[0];
}
