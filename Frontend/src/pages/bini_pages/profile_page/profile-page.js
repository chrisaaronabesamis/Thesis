import ProfileHeader from '../../../components/bini_components/profile/profile-header.js';
import ProfileInfo from '../../../components/bini_components/profile/profile-info.js';

import Navigation from '../../../components/bini_components/navigation.js';
import Layout from '../../../layouts/bini_layout/default.js';
import '../../../styles/bini_styles/profile.css';


export default function Profile() {
  const { header, navigation, main, footer } = Layout(this.root);

  ProfileHeader(header);
  ProfileInfo(main);
  Navigation(navigation); 
  

};