import { Router } from "express";
import { deleteProductByIdController, getAllProductsContoller, getProductsByIdController, postProductOnDBController, updateProductByIdController } from "../controllers/product.controller.js";
import { handlePolices } from "../middlewares/auth.middleware.js";

const router = Router()

router.get('/', handlePolices(['USER', 'ADMIN']),getAllProductsContoller)  
 
router.get('/:pid', handlePolices(['USER', 'ADMIN']),getProductsByIdController ) 

router.post('/', handlePolices(['ADMIN']),postProductOnDBController ) 

router.put('/:pid', handlePolices(['ADMIN']),updateProductByIdController )

router.delete('/:pid', handlePolices(['ADMIN']),deleteProductByIdController ) 

export default router