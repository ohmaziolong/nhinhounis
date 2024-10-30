function addPost() {
    const postInput = document.getElementById('post-input');
    const imageInput = document.getElementById('image-input');
    const usernameInput = document.getElementById('username-input');
    const emailInput = document.getElementById('email-input');

    const postText = postInput.value.trim();
    const files = imageInput.files;
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();

    // Kiểm tra nội dung bài viết
    if (!postText && files.length === 0) {
        alert("Vui lòng nhập nội dung hoặc chọn ảnh.");
        return;
    }

    // Kiểm tra tên và email
    if (!username || !email) {
        alert("Vui lòng nhập tên và email.");
        return;
    }

    const images = Array.from(files).map(file => URL.createObjectURL(file));

    const post = {
        text: postText,
        images: images,
        likes: 0,
        comments: [],
        liked: false,
        time: new Date().toLocaleString(),
        username: username,
        email: email
    };

    savePost(post);
    resetInputs();
    renderPosts();
}

function resetInputs() {
    document.getElementById('post-input').value = '';
    document.getElementById('image-input').value = '';
    document.getElementById('username-input').value = '';
    document.getElementById('email-input').value = '';
}

function savePost(post) {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    posts.push(post);
    localStorage.setItem('posts', JSON.stringify(posts));
}

function renderPosts() {
    const postsContainer = document.getElementById('post-container');
    postsContainer.innerHTML = ''; // Xóa nội dung cũ

    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    posts.forEach((post, index) => {
        const postDiv = createPostElement(post, index);
        postsContainer.appendChild(postDiv);
    });
}

function createPostElement(post, index) {
    const postDiv = document.createElement('div');
    postDiv.classList.add('post');

    const userElement = document.createElement('strong');
    userElement.textContent = post.username;
    postDiv.appendChild(userElement);

    const textElement = document.createElement('p');
    textElement.textContent = post.text;
    postDiv.appendChild(textElement);

    post.images.forEach(image => {
        const img = document.createElement('img');
        img.src = image;
        img.style.maxWidth = '100%';
        postDiv.appendChild(img);
    });

    const timeElement = document.createElement('small');
    timeElement.textContent = `Đăng vào: ${post.time}`;
    postDiv.appendChild(timeElement);

    const likeButton = createLikeButton(post, index);
    postDiv.appendChild(likeButton);

    const commentInput = createCommentInput(post, index);
    postDiv.appendChild(commentInput);

    post.comments.forEach((comment, commentIndex) => {
        const commentElement = createCommentElement(comment, post.username, index, commentIndex);
        postDiv.appendChild(commentElement);
    });

    // Chỉ hiển thị nút xóa nếu người dùng là người đăng
    const currentUsername = getCurrentUsername();
    if (post.username === currentUsername) {
        const deleteButton = createDeleteButton(index);
        postDiv.appendChild(deleteButton);
    }

    return postDiv;
}

function createLikeButton(post, index) {
    const likeButton = document.createElement('button');
    likeButton.textContent = `Thích (${post.likes})`;
    likeButton.onclick = () => {
        if (!post.liked) {
            post.likes++;
            post.liked = true;
            updatePost(index, post);
            renderPosts();
        } else {
            alert("Bạn đã thích bài viết này rồi!");
        }
    };
    return likeButton;
}

function createCommentInput(post, index) {
    const commentInput = document.createElement('input');
    commentInput.placeholder = 'Bình luận...';
    commentInput.onkeydown = (event) => {
        if (event.key === 'Enter' && commentInput.value.trim() !== '') {
            const commentText = commentInput.value.trim();
            post.comments.push({ text: commentText, username: post.username }); // Lưu bình luận kèm tên người dùng
            updatePost(index, post);
            renderPosts();
            commentInput.value = '';
        }
    };
    return commentInput;
}

function createCommentElement(comment, username, postIndex, commentIndex) {
    const commentElement = document.createElement('p');
    commentElement.textContent = `${username}: ${comment.text}`; // Thêm tên người dùng vào bình luận
    commentElement.style.marginLeft = '20px';

    const deleteCommentButton = document.createElement('button');
    deleteCommentButton.textContent = 'Xóa';
    deleteCommentButton.onclick = () => {
        const post = JSON.parse(localStorage.getItem('posts'))[postIndex];
        post.comments.splice(commentIndex, 1);
        updatePost(postIndex, post);
        renderPosts();
    };
    commentElement.appendChild(deleteCommentButton);
    return commentElement;
}

function createDeleteButton(index) {
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Xóa';
    deleteButton.onclick = () => deletePost(index);
    return deleteButton;
}

function updatePost(index, post) {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    posts[index] = post;
    localStorage.setItem('posts', JSON.stringify(posts));
}

function deletePost(index) {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    posts.splice(index, 1);
    localStorage.setItem('posts', JSON.stringify(posts));
    renderPosts();
}

function previewImage() {
    const imageInput = document.getElementById('image-input');
    const selectedImagesContainer = document.getElementById('selected-images');
    selectedImagesContainer.innerHTML = ''; // Xóa ảnh cũ

    Array.from(imageInput.files).forEach(file => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const img = document.createElement('img');
            img.src = event.target.result;
            img.style.width = '50px'; // Kích thước nhỏ
            img.style.height = 'auto'; // Tự động giữ tỉ lệ
            img.style.margin = '5px'; // Khoảng cách giữa các ảnh
            selectedImagesContainer.appendChild(img);
        };

        reader.readAsDataURL(file);
    });
}

// Gọi hàm previewImage khi chọn ảnh
document.getElementById('image-input').addEventListener('change', previewImage);

function getCurrentUsername() {
    return localStorage.getItem('currentUsername'); // Hoặc cách bạn đã lưu tên người dùng
}

function resetPosts() {
    if (confirm("Bạn có chắc chắn muốn xóa tất cả bài viết không?")) {
        localStorage.removeItem('posts'); // Xóa tất cả bài viết
        renderPosts(); // Cập nhật giao diện
    }
}
// Tải lại các bài viết khi trang được mở
window.onload = renderPosts;