// controllers/productController.js
const Product = require("../models/product.model");

// Get products count
async function getProductsCount(req, res) {
  const name = req.query.name || "";
  try {
    const count = await Product.countDocuments({
      name: { $regex: name, $options: "i" }, // "i" for case-insensitive
    });
    res.json({ count });
  } catch (err) {
    console.log(
      "product.controller, getProductsCount. Error while getting products count",
      err
    );
    res.status(500).json({ message: err.message });
  }
}

// Get all products
async function getProducts(req, res) {
  const name = req.query.name || "";

  try {
    const products = await Product.find({
      name: { $regex: name, $options: "i" }, // "i" for case-insensitive
    });
    res.json(products);
  } catch (err) {
    console.log(
      "product.controller, getProducts. Error while getting products",
      err
    );
    res.status(500).json({ message: err.message });
  }
}

// Get single product
async function getProductById(req, res) {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    res.json(product);
  } catch (err) {
    if (err.name === "CastError") {
      console.log(
        `product.controller, getProductById. Product not found with id: ${id}`
      );
      return res.status(404).json({ message: "Product not found" });
    }
    console.log(
      `product.controller, getProductById. Error while getting product with id: ${id}`,
      err.name
    );
    res.status(500).json({ message: err.message });
  }
}

// Delete product
async function deleteProduct(req, res) {
  const { id } = req.params;
  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      console.log(
        `product.controller, deleteProduct. Product not found with id: ${id}`
      );
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (err) {
    console.log(
      `product.controller, deleteProduct. Error while deleting product with id: ${id}`
    );
    res.status(500).json({ message: err.message });
  }
}

// Create new product
async function createProduct(req, res) {
  const productToAdd = req.body;
  const newProduct = new Product(productToAdd);

  try {
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.log(
      "product.controller, createProduct. Error while creating product",
      err
    );

    if (err.name === "ValidationError") {
      // Mongoose validation error
      console.log(`product.controller, createProduct. ${err.message}`);
      res.status(400).json({ message: err.message });
    } else {
      // Other types of errors
      console.log(`product.controller, createProduct. ${err.message}`);
      res.status(500).json({ message: "Server error while creating product" });
    }
  }
}

// Update product
async function updateProduct(req, res) {
  const { id } = req.params;
  const { name, manufacturer, model, battery } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, manufacturer, model, battery },
      { new: true, runValidators: true } // validate before updating
    );

    if (!updatedProduct) {
      console.log(
        `product.controller, updateProduct. Product not found with id: ${id}`
      );
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (err) {
    console.log(
      `product.controller, updateProduct. Error while updating product with id: ${id}`,
      err
    );

    if (err.name === "ValidationError") {
      // Mongoose validation error
      console.log(`product.controller, updateProduct. ${err.message}`);
      res.status(400).json({ message: err.message });
    } else {
      // Other types of errors
      console.log(`product.controller, updateProduct. ${err.message}`);
      res.status(500).json({ message: "Server error while updating product" });
    }
  }
}

module.exports = {
  getProductsCount,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
