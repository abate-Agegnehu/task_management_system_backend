const Product = require("../models/Product");
const cloudinary = require("../utils/cloudinary");
// @desc    Add a new product with an image upload
const addProduct = async (req, res) => {
  try {
    const { type, price, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    cloudinary.uploader
      .upload_stream({ folder: "products" }, async (error, result) => {
        if (error) return res.status(500).json({ error: error.message });

        const newProduct = new Product({
          type,
          price,
          description,
          imageUrl: result.secure_url,
          cloudinaryId: result.public_id,
        });

        await newProduct.save();
        res
          .status(201)
          .json({ message: "Product added successfully", newProduct });
      })
      .end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get a product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update a product (with image update)
const updateProduct = async (req, res) => {
  try {
    const { type, price, description } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let updatedData = { type, price, description };

    if (req.file) {
      // Delete old image from Cloudinary
      await cloudinary.uploader.destroy(product.cloudinaryId);

      // Upload new image to Cloudinary
      cloudinary.uploader
        .upload_stream({ folder: "products" }, async (error, result) => {
          if (error) return res.status(500).json({ error: error.message });

          updatedData.imageUrl = result.secure_url;
          updatedData.cloudinaryId = result.public_id;

          const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { new: true }
          );
          res.json({ message: "Product updated successfully", updatedProduct });
        })
        .end(req.file.buffer);
    } else {
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updatedData,
        { new: true }
      );
      res.json({ message: "Product updated successfully", updatedProduct });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete a product (removes from Cloudinary first)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(product.cloudinaryId);

    // Delete from database
    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
