// routes/products.js
const express = require("express");
const router = express.Router();
const {
  getProductsCount,
  getProducts,
  getProductById,
  createProduct,
  // updateProduct,
  deleteProduct,
  getProductsByUser,
} = require("../controllers/product.controller");
const {
  verifyToken,
  authorizeProductOwner,
} = require("../middleware/auth.middleware");

router.get("/", getProducts);
router.get("/count", getProductsCount);
router.get("/:id", getProductById);
router.post("/", verifyToken, createProduct);
// router.put("/:id", updateProduct);
router.delete("/:id", verifyToken, authorizeProductOwner, deleteProduct);
router.get("/user-product/:id", verifyToken, getProductsByUser);

module.exports = router;
