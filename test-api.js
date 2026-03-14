fetch('https://sirajluxe.vercel.app/api/products?category=Shirts').then(r => r.json()).then(d => console.log('Live APIs returned:', d.docs?.length, 'products for Shirts')).catch(console.error);
