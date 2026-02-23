import { BINI_API_URL } from '../../../config/bini-api.js';

export default function CreatePost(root) {

  const modal = document.createElement('div');
  modal.id = 'create-post-modal';
  modal.classList.add('modal');
  modal.innerHTML = `
    <div class="modal-content">
      <span id="close-modal" class="close">&times;</span>
      <h2>Create New Post</h2>
      <form id="create-post-form">
        
        <textarea id="content" name="content" placeholder="What's happening?" required></textarea>
        
        <input type="file" id="image_file" name="image_file" accept="image/*" />               

        <button class="post-btn" type="submit" id="submit-post">Create Post</button>
      </form>
    </div>
  `;

  root.appendChild(modal);

  const closeModalBtn = document.getElementById('close-modal');
  const form = document.getElementById('create-post-form');

  const openModal = () => {
    modal.style.display = 'block';
  };

  const closeModal = () => {
    modal.style.display = 'none';
  };

  closeModalBtn.addEventListener('click', closeModal);

  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const content = document.getElementById('content').value;    
    const imageFile = document.getElementById('image_file').files[0]; 

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Please login first.');
      return;
    }
    
    let imageUrl = null;
    if (imageFile) {
      try {
        const imageData = new FormData();
        imageData.append('file', imageFile);

        const uploadResponse = await fetch(`${BINI_API_URL}/cloudinary/upload`, {
          method: 'POST',
          body: imageData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.message || 'Image upload failed');
        }

        const uploadResult = await uploadResponse.json();
        
        
        console.log("Upload response:", uploadResult);
        
        
        imageUrl = uploadResult.url;
        if (!imageUrl) {
          alert('Image upload succeeded, but no URL was returned.');
          return;
        }
      } catch (error) {
        alert('Error uploading image: ' + error.message);
        return;
      }
    }

    if (content) {
      const postData = { content, img_url: imageUrl };

      try {
        const response = await fetch(`${BINI_API_URL}/posts/create`, { 
          method: 'POST',
          headers: {
            'apikey': 'thread',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`  
          },
          body: JSON.stringify(postData),
        });

        if (response.ok) {
          const result = await response.json();
          
          // Dispatch event so homepage feed can prepend the new post in real time (no reload)
          window.dispatchEvent(
            new CustomEvent("new-post-created", {
              detail: { post: result },
            }),
          );
          
          alert('Post created successfully!');
          closeModal();
          form.reset();
          
          // Reload only if needed
          if (window.location.pathname.includes('/bini')) {
            // Don't reload, let the event handler update the feed
          }
        } else {
          const errorData = await response.json();
          alert('Failed to create post: ' + (errorData.message || 'Please try again.'));
        }
      } catch (error) {
        console.error('Error creating post:', error);
        alert('Error creating post. Please check your internet connection.');
      }
    } else {
      alert('Please fill out the content field.');
    }
  });

  openModal();
}
