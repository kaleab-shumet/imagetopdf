$('#image-preview-container').sortable({
	onChoose: function (/**Event*/evt) {
		$(evt.item).addClass('lbody')
	},
	onEnd: function (evt){
		$(evt.item).removeClass('lbody')
	}
});

$('#image-preview-container').hover(function () {
		// over
		$(this).css('cursor', 'ns-resize'); 
	}, function () {
		// out
	}
);

$('#btn-image-select').click(function (e) {
	e.preventDefault();

	$('#image-selector').click();
});

const filesArray = []
$('#image-selector').change(async function (e) {
	e.preventDefault();

	const files = e.target.files

	for (const file of files) {
		filesArray.push(file)
	}

	$('#loading-bar').show()
	$('#image-preview-container').empty();

	for (const fileA of filesArray) {
		const imageBuffer = await getBase64(fileA)

		$('#image-preview-container').append(createImagePreview(imageBuffer, fileA.name, (fileA.size / 1024)))

	}

	$('#loading-bar').hide();
});

$('#image-form').submit(function (e) {
	e.preventDefault();
	const formData = new FormData();
	for (const fileA of filesArray) {
		formData.append('images', fileA)
	}

	for (const key of formData.entries()) {
		console.log(key[0] + ', ' + key[1]);
	}


	$.ajax({
		url: '/upload',
		cache: false,
		contentType: false,
		processData: false,
		data: formData,
		type: 'POST',
		success: function (response) {
			console.log(response);
		},
		error: function (error) {
			console.log(error);
		}
	});
});


function createImagePreview(imageBuffer, fileName, fileSize) {

	return `<div class="d-flex border align-items-center d-flex my-1 p-2">
                      <img src=${imageBuffer} style="width: 4em; height: 4em;">
                      <div class="p-2 d-flex flex-column">
                        <span style="font-weight: 500;">${fileName}</span>
                        <small>Size: ${fileSize}</small>
                      </div>
                      <img class="ml-auto mr-2" style="width: 1em; height: 1em;" src="/img/close.png">
                    </div>`
}

function getBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = error => reject(error);
	});
}