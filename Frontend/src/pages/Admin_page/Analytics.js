import AnalyticsComponent from '../../components/Admin_components/Components/Analytics.js';

export default function Analytics() {
  const root = this.root;
  root.innerHTML = '';

  const analytics = AnalyticsComponent();
  root.appendChild(analytics);
}
