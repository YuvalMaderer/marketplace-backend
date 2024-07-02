const User = require("../models/user.model");
const Product = require("../models/product.model");
const { buildCritiria } = require("../helpers/product.helper");

// Get products count
async function getProductsCount(req, res) {
  const { query } = req;
  const criteria = buildCritiria(query);

  // console.log("page", page);
  // console.log("limit", limit);
  // console.log("startIndex", startIndex);

  try {
    const count = await Product.countDocuments(criteria);

    res.status(200).json({ count });
  } catch (err) {
    console.log(
      "product.controller, getProductCount. Error while getting product count",
      err
    );
    res
      .status(500)
      .json({ message: "Server error while getting product count" });
  }
}

// Get all products
async function getProducts(req, res) {
  const { query } = req;
  const criteria = buildCritiria(query);

  const page = query.page || 1;
  const limit = query.limit || 8;
  const startIndex = (page - 1) * limit || 0;

  try {
    const products = await Product.find(criteria).skip(startIndex).limit(limit);
    res.status(200).json(products);
  } catch (err) {
    console.log(
      "product.controller, getProducts. Error while getting products",
      err
    );
    res.status(500).json({ message: "Server error while getting products" });
  }
}

// Get a single product
async function getProductById(req, res) {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    res.status(200).json(product);
  } catch (err) {
    if (err.name === "CastError") {
      console.log(
        `product.controller, getProductById. CastError! product not found with id: ${id}`
      );
      return res.status(404).json({ message: "product not found" });
    }
    console.log(
      `product.controller, getProductById. Error while getting product with id: ${id}`,
      err
    );
    res.status(500).json({ message: "Server error while getting product" });
  }
}

// Delete an product
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
      `product.controller, deleteProduct. Error while deleting product with id: ${id}`,
      err
    );
    res.status(500).json({ message: "Server error while deleting product" });
  }
}

// Create a new product
async function createProduct(req, res) {
  try {
    const newProduct = new Product(req.body);
    console.log(`1: ${newProduct}`);
    newProduct.user = req.userId; // Add the user id to the product
    console.log(`2: ${newProduct}`);
    const savedProduct = await newProduct.save();

    // Update the user's product array
    await User.findByIdAndUpdate(req.userId, {
      $push: { products: savedProduct._id }, // Add the product id to the user's products array
    });

    res.status(201).json(savedProduct);
  } catch (err) {
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

// Delete a product
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

    // Update the user's product array
    await User.findByIdAndUpdate(req.userId, {
      $pull: { products: id }, // Remove the product id from the user's products array
    });

    res.json({ message: "Product deleted" });
  } catch (err) {
    console.log(
      `product.controller, deleteProduct. Error while deleting product with id: ${id}`,
      err
    );
    res.status(500).json({ message: "Server error while deleting product" });
  }
}

async function getProductsByUser(req, res) {
  const { id } = req.params;
  const userProducts = [];

  try {
    const user = await User.findById(id);
    const { products, ...userWithoutPassword } = user._doc;
    for (const product of products) {
      const currentProduct = await Product.findById(product);
      userProducts.push(currentProduct);
    }
    res.status(200).json([userProducts]);
  } catch (err) {
    if (err.name === "CastError") {
      console.log(
        `user.controller, getUserById. CastError! user not found with id: ${id}`
      );
      return res.status(404).json({ message: "User not found" });
    }
    console.log(
      `user.controller, getUserById. Error while getting user with id: ${id}`,
      err
    );
    res.status(500).json({ message: "Server error while getting user" });
  }
}

module.exports = {
  getProductsCount,
  getProducts,
  getProductById,
  createProduct,
  deleteProduct,
  getProductsByUser,
};
