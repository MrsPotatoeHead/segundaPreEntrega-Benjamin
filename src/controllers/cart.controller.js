import productModel from '../dao/models/product.model.js'
import cartModel from '../dao/models/cart.model.js'

export const getProductsFromCart = async (req, res) => {
    try {
        const id = req.params.cid
        const productsOnCart = await cartModel.findById(id).populate('products.product').lean()
        if (productsOnCart === null) {
            return {
                statusCode: 404,
                response: { status: 'error', error: 'Not found' }
            }
        }
        return {
            statusCode: 200,
            response: { status: 'success', payload: productsOnCart }
        }
    } catch(err) {
        return {
            statusCode: 500,
            response: { status: 'error', error: err.message }
        }
    }
}

export const createCartController = async(req, res) => {
    try{
    const result = await cartModel.create({})
    res.status(201).json({status:'success', payload: result})
    }catch(err){
     res.status(500).json({ status: 'error', error: err.message })
    }
}

export const getCartByIdController = async (req, res) => {
    try{
        const result = await getProductsFromCart(req, res)
        res.status(200).json({status: 'success', payload: result})
    }catch(err){
        res.status(500).json({ status: 'error', error: err.message })
    }
}

export const postProductAndQuantityOnCartIdController = async (req, res) => {
    const cid = req.params.cid
    const pid = req.params.pid
    const cartToUpdate = await cartModel.findById(cid).lean().exec()
    try {
        if (cartToUpdate === null) {
            return res.status(404).json({ status: 'error', error: `Cart with id=${cid} Not found` })
        }
        const productToAdd = await productModel.findById(pid).lean().exec()
   
        if (productToAdd === null) {
            return res.status(404).json({ status: 'error', error: `Product with id=${pid} Not found` })
        }
        const productIndex = cartToUpdate.products.findIndex(item => item.product == pid)
        if ( productIndex > -1) {
            cartToUpdate.products[productIndex].quantity += 1
        } else {
            cartToUpdate.products.push({ product: pid, quantity: 1 })
        }
        const result = await cartModel.findByIdAndUpdate(cid, cartToUpdate, { returnDocument: 'after' }).lean()
        res.status(201).json({ status: 'success', payload: result })
    } catch(err) {
        res.status(500).json({ status: 'error', error: err.message })
    }
}

export const deleteProductFromCartController = async (req, res) => {
    const cid = req.params.cid
    const pid = req.params.pid
    try{
        //verifico si existe el carrito
        const cartWhereToDelete = await cartModel.findById(cid)
        if(!cartWhereToDelete){
            return res.status(404).json({ status: 'error', error: `El carrito con el id: ${cid} no se encontro` })
        }
        //verfico si exite el producto
        const productToDelete =  await productModel.findById(pid)
        if(!productToDelete){
        return res.status(404).json({ status: 'error', error: `El producto con id: ${pid} no encontrado` })
        }
        // verifica si existe en el carrito
        const existInCart = cartWhereToDelete.products.findIndex((product) => product.products == pid)
        if(!existInCart){
            return res.status(404).json({ status: 'error', error: 'El producto no existe en el carrito' })
        }else{
            cartWhereToDelete.products.splice(existInCart, 1)
            await cartWhereToDelete.save();
            return res.status(200).json({ status: 'success', message: 'Producto eliminado del carrito', payload: cartWhereToDelete.products });
        }

    }catch(err){
        res.status().json({status: 'error', error: err.message})
    }

}

export const updateCartController = async (req, res) => {
    const cid = req.params.cid
    try{
    const cartToUpdate =  await cartModel.findById(cid)
    if(!cartToUpdate){
        return res.status(404).json({ status: 'error', error: `El carrito con el id: ${cid} no se encontro` })
    }
    const products = req.body.products
        //start: validaciones del array enviado por body
        if (!products) {
            return res.status(400).json({ status: 'error', error: 'Field "products" is not optional' })
        }
        for (let index = 0; index < products.length; index++) {
            if (!products[index].hasOwnProperty('product') || !products[index].hasOwnProperty('quantity')) {
                return res.status(400).json({ status: 'error', error: 'product must have a valid id and a valid quantity' })
            }
            if (typeof products[index].quantity !== 'number') {
                return res.status(400).json({ status: 'error', error: 'product\'s quantity must be a number' })
            }
            if (products[index].quantity === 0) {
                return res.status(400).json({ status: 'error', error: 'product\'s quantity cannot be 0' })
            }
            const productToAdd = await productModel.findById(products[index].product)
            if (productToAdd === null) {
                return res.status(400).json({ status: 'error', error: `Product with id=${products[index].product} doesnot exist. We cannot add this product to the cart with id=${cid}` })
            }
        }
        //end: validaciones del array enviado por body
        cartToUpdate.products = products
        const result = await cartModel.findByIdAndUpdate(cid, cartToUpdate, { returnDocument: 'after' })
        res.status(200).json({ status: 'success', payload: result })
    } catch(err) {
        res.status(500).json({ status: 'error', error: err.message })
    }

}

export const updateProductFromCartController = async (req, res) => {
    const cid = req.params.cid
    const pid = req.params.pid
    const newQuantity = req.body.quantity
    try{
        //veo si exite el carrito
        const cartToUpdate = await cartModel.findById(cid)
        if(!cartToUpdate){
            return res.status(404).json({ status: 'error', error: `El carrito con el id: ${cid} no se encontro` })}

        //veo si existe el producto en el carrito
        const productInCart = cartToUpdate.products.find((product) => product.product ==pid)
        if(!productInCart){
            return res.status(404).json({ status: 'error', error: `El producto con el id: ${pid} no se encontro` })}
        // si existe el producto mando la cantidad
        productInCart.quantity = newQuantity;
        await cartToUpdate.save();

        const payload = {
            product: pid,
            newQuantity: newQuantity
        };
        return res.status(200).json({ status: 'success', message: 'Cantidad del producto actualizada en el carrito', payload });

    }catch(err){
        res.status().json({status: 'error', error: err.message})
    }

}

export const deleteCartController = async (req, res) => {
    const cid = req.params.cid;
    try {
        const cartToDelete = await cartModel.findById(cid);
        if (!cartToDelete) {
            return res.status(404).json({ status: 'error', error: `El carrito con el id: ${cid} no se encontro` });
        }

        // Borrar todos los productos del carrito
        cartToDelete.products = [];

        // Guardar los cambios en el carrito en la base de datos
        const result = await cartToDelete.save();

        return res.status(200).json({ status: 'success', payload: result});
    } catch (err) {
        res.status(500).json({ status: 'error', error: err.message });
    }
}