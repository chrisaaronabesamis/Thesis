import ShopModel from "../../../Models/ecommerce_model/shop_model.js";

class ShopController {
  constructor() {
    this.shopModel = new ShopModel();
  }

  // Get all collections for a community
  async getCollections(req, res) {
    try {
      // No community_id required — always return all collections
      const collections = await this.shopModel.getCollections();
      console.log('Fetched collections:', collections);
      return res.status(200).json({ success: true, data: collections });
    } catch (error) {
      console.error('<error> getCollectionsController', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch collections',
        error: error.message
      });
    }
  
  }

  async getProductsByCollection(req, res) {
    try {
      let collection_id = req.params.collection_id || req.query.collection_id;
      if (!collection_id) {
        return res.status(400).json({ success: false, message: "collection_id is required" });
      }


      // Support legacy path formats like "collection_id=1"
      if (typeof collection_id === 'string' && collection_id.includes('=')) {
        const parts = collection_id.split('=');
        collection_id = parts[parts.length - 1];
      }

      // Try to coerce to number when appropriate
      const collectionIdNum = Number(collection_id);
      const queryParam = Number.isNaN(collectionIdNum) ? collection_id : collectionIdNum;

      const products = await this.shopModel.getProductsByCollection(queryParam);
      console.log('Fetched products:', products);
      return res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('<error> getProductsByCollectionController', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: error.message
      });
    }
  }

  async getProductDetails(req, res) {
    try {
      let product_id = req.params.product_id || req.query.product_id;

      if (!product_id) {
        return res.status(400).json({ success: false, message: 'product_id is required' });
      }

      if (typeof product_id === 'string' && product_id.includes('=')) {
        const parts = product_id.split('=');
        product_id = parts[parts.length - 1];
      }

      const productIdNum = Number(product_id);
      const queryParam = Number.isNaN(productIdNum) ? product_id : productIdNum;

      const details = await this.shopModel.getproductdetails(queryParam);
      if (!details || details.length === 0) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      // also fetch variants
      const variants = await this.shopModel.getProductVariants(queryParam);
      console.log('Fetched! product details and variants:', { details, variants });
      return res.status(200).json({ success: true, data: { product: details[0], variants } });
    } catch (error) {
      console.error('<error> getProductDetailsController', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch product details', error: error.message });
    }
  }





}

export default ShopController;
