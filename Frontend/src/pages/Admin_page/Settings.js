import SettingsComponent from '../../components/Admin_components/Components/Settings.js';

export default function Settings() {
  const root = this.root;
  root.innerHTML = '';

  const settings = SettingsComponent();
  root.appendChild(settings);
}
