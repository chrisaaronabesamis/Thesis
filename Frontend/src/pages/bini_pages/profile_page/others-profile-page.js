import Navigation from '../../../components/bini_components/navigation.js';
import ProfileHeader from '../../../components/bini_components/profile/profile-header.js';
import ProfileInfo from '../../../components/bini_components/profile/others-profile.js';
import Layout from '../../../layouts/bini_layout/default.js';

export default function OthersProfilePage() {
  const { header, navigation, main } = Layout(this.root);

  ProfileHeader(header);
  Navigation(navigation);

  const userId = localStorage.getItem('selectedUserId');
  if (!userId) {
    main.innerHTML = '<p>No user selected.</p>';
    return;
  }

  ProfileInfo(main, { id: userId });
}