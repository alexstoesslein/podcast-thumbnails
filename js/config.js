const PODCAST_CONFIGS = [
    {
        id: 'hotel-matze',
        name: 'Hotel Matze',
        logo: 'assets/hotel-matze/logo.png',
        bar: 'assets/hotel-matze/bar.png',
        font: 'HotelMatzeFont',
        textColor: '#FFFFFF',
        barTextColor: '#000000',
        defaults: {
            bg: { x: 0, y: 0, zoom: 100 },
            text: { y: 50, fontSize: 80 },
            bar: { padding: 40 },
            logo: { y: 88, scale: 100 }
        }
    },
    {
        id: '50-ueber-50',
        name: '50 über 50',
        logo: 'assets/50-ueber-50/logo.png',
        bar: 'assets/50-ueber-50/bar.png',
        font: '50ueber50Font',
        textColor: '#E30613',
        barTextColor: '#E30613',
        defaults: {
            bg: { x: 0, y: 0, zoom: 100 },
            text: { y: 50, fontSize: 70 },
            bar: { padding: 50 },
            logo: { y: 88, scale: 100 }
        }
    }
];

function getConfig(podcastId) {
    return PODCAST_CONFIGS.find(c => c.id === podcastId) || PODCAST_CONFIGS[0];
}
