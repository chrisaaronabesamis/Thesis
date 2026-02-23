import OrdersComponent from '../../components/Admin_components/Components/Orders.js';

export default function OrdersPage() {
  const root = this.root;
  root.innerHTML = '';

  const orders = OrdersComponent();
  root.appendChild(orders);
}
