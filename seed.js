const localUrls = [
  '/images/home_banner.jpg',
  '/images/lookbook_hero.png',
  '/images/rings_category_banner.png',
  '/images/bridal_category_banner.png',
  '/images/chains_category_banner.png',
  '/images/bangles_category_banner.png',
  '/images/gifting_category_banner.png',
  '/images/img_c95d5359a4.jpg',
  '/images/img_f4a16bfc7b.jpg',
  '/images/img_89bb4a15c8.jpg',
  '/images/img_ab1d2c137a.jpg',
  '/images/img_816403ecd7.jpg',
  '/images/img_a7896ca8f9.jpg',
  '/images/Neckles1.png',
  '/images/Neckles2.png'
];

fetch('http://localhost:3000/api/config')
  .then(r => r.json())
  .then(d => {
    if (!d.storefront) d.storefront = {};
    d.storefront.lookbookSlider = localUrls;
    return fetch('http://localhost:3000/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d)
    });
  })
  .then(r => r.json())
  .then(res => {
    console.log('Update result:', res.success ? 'SUCCESS' : 'FAILED');
    console.log('New slider length:', res.config?.storefront?.lookbookSlider?.length);
  })
  .catch(console.error);
