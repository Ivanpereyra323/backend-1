import { Router } from 'express';
import fs from 'fs/promises';

const router = Router();
const cartsFile = './data/carrito.json';
const productsFile = './data/productos.json';


const getCarts = async () => {
    try {
        const data = await fs.readFile(cartsFile, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};


const getProducts = async () => {
    try {
        const data = await fs.readFile(productsFile, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};


router.post('/', async (req, res) => {
    const carts = await getCarts();
    const newCart = {
        id: String(carts.length ? Math.max(...carts.map(c => Number(c.id))) + 1 : 1),
        products: []
    };

    carts.push(newCart);
    await fs.writeFile(cartsFile, JSON.stringify(carts, null, 2));
    res.status(201).json(newCart);
});


router.get('/:cid', async (req, res) => {
    const carts = await getCarts();
    const cart = carts.find(c => c.id === req.params.cid);

    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    res.json(cart.products);
});


router.post('/:cid/product/:pid', async (req, res) => {
    const carts = await getCarts();
    const products = await getProducts();
    const cartIndex = carts.findIndex(c => c.id === req.params.cid);
    const product = products.find(p => p.id === req.params.pid);

    if (cartIndex === -1) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const cart = carts[cartIndex];
    const productIndex = cart.products.findIndex(p => p.product === req.params.pid);

    if (productIndex !== -1) {
        cart.products[productIndex].quantity += 1;
    } else {
        cart.products.push({ product: req.params.pid, quantity: 1 });
    }

    await fs.writeFile(cartsFile, JSON.stringify(carts, null, 2));
    res.json(cart);
});

export default router;
