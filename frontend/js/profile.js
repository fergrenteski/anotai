function previewImage(event) {
  const input = event.target;
  const image = document.getElementById('profileImage');

  if (input.files && input.files[0]) {
    const reader = new FileReader();

    reader.onload = function(e) {
      image.src = e.target.result;
    };

    reader.readAsDataURL(input.files[0]);
  }
}

document.getElementById("file-input").addEventListener("change", (event) => previewImage(event));
