$('#btn-select').click(function (e) {
  e.preventDefault();

  $('#select-file').click()

});


var formData = new FormData()
const fileArray = []
$('#select-file').change(async function (e) {
  e.preventDefault();
  console.log("Select file changed");


  for (const file of e.target.files) {
    
    const imageData = await getBase64(file)
    //console.log(imageData);
    $('#image-preview').append(`<img style="width: 4em; height: 4em;" src=${imageData} >`)
    
  } 

});

$('#btn-convert').click(function (e) { 
  e.preventDefault();

  
});

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}