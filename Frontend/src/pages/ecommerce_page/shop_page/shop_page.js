import Binishop_banner from '../../../components/ecommerce_components/banner/binishop-banner.js';
import Navigation from '../../../components/ecommerce_components/navigation.js';
import Collection from '../../../components/ecommerce_components/collection/collection.js';
// import Product_collection from '../Components/product-collection';

import Layouts from '../../../layouts/ecommerce_layout/shop.js';

import '../../../styles/ecommerce_styles/global.css';
import '../../../styles/ecommerce_styles/shop.css';
import '../../../styles/ecommerce_styles/Collection.css';
import '../../../styles/ecommerce_styles/product_details.css';

export default function Home() {
  const { navigation, main, footer} = Layouts(this.root);

  Navigation(navigation); 
  Binishop_banner(main);
  Collection(main);
  // Product_collection(main);
  

  
};

