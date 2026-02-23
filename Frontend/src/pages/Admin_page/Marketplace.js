import MarketplaceComponent from '../../components/Admin_components/Components/Marketplace.js';

export default function Marketplace() {
  const root = this.root;
  root.innerHTML = '';

  const marketplace = MarketplaceComponent();
  root.appendChild(marketplace);
}
