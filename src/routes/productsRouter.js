import { Router } from 'express';
import fs from 'fs/promises';

const router = Router();
const productsFile = './data/productos.json';


const getProducts = async () => {
    try {
        const data = await fs.readFile(productsFile, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};


router.get('/', async (req, res) => {
    const products = await getProducts();
    const limit = req.query.limit ? parseInt(req.query.limit) : products.length;
    res.json(products.slice(0, limit));
});


router.get('/:pid', async (req, res) => {
    const products = await getProducts();
    const product = products.find(p => p.id === req.params.pid);
    product ? res.json(product) : res.status(404).json({ error: 'Producto no encontrado' });
});


router.post('/', async (req, res) => {
    const { title, description, code, price, stock, category, thumbnails = [] } = req.body;
    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios, excepto thumbnails' });
    }

    const products = await getProducts();
    const newProduct = {
        id: String(products.length ? Math.max(...products.map(p => Number(p.id))) + 1 : 1),
        title,
        description,
        code,
        price,
        stock,
        category,
        thumbnails,
        status: true
    };

    products.push(newProduct);
    await fs.writeFile(productsFile, JSON.stringify(products, null, 2));
    res.status(201).json(newProduct);
});


router.put('/:pid', async (req, res) => {
    const products = await getProducts();
    const index = products.findIndex(p => p.id === req.params.pid);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const updatedProduct = { ...products[index], ...req.body };
    delete updatedProduct.id;
    products[index] = { ...products[index], ...updatedProduct };
    
    await fs.writeFile(productsFile, JSON.stringify(products, null, 2));
    res.json(products[index]);
});


router.delete('/:pid', async (req, res) => {
    let products = await getProducts();
    const initialLength = products.length;
    products = products.filter(p => p.id !== req.params.pid);

    if (products.length === initialLength) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await fs.writeFile(productsFile, JSON.stringify(products, null, 2));
    res.json({ message: 'Producto eliminado' });
});

export default router;