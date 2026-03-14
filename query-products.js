const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://binacodesecommercestore_db_user:IbUusMK2sQbZdM4e@binacodesecommercestore.yfacdbp.mongodb.net/binacodes?retryWrites=true&w=majority').then(async () => {
    const products = await mongoose.connection.collection('products').find({}, { projection: { name: 1, category: 1, image: 1, images: 1 } }).toArray();
    console.log(JSON.stringify(products, null, 2));
    process.exit(0);
}).catch(console.error);
