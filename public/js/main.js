$('#image-preview-container').sortable({
	animation: 150,
	ghostClass: 'lbody',
	handle: '.handle'
});

disableDownload();


$('#btn-image-select').click(function (e) {
	e.preventDefault();

	$('#image-selector').click();
});

$('#image-selector').change(async function (e) {
	e.preventDefault();

	hideError()
	showStatus("Loading")
	console.log("On chage");

	//$('#image-preview-container').empty();


	const files = e.target.files

	for (const file of files) {
		const validFileSize = validateFileSize(file)
		const validFileType = validateFileType(file)

		console.log({ validFileType });

		if (!validFileSize) {
			showLocalError("Error: Please remove a file which is greater than 10MB")
		}

		if (!validFileType) {
			showLocalError("Please select valid image type")
		}

		const imageBuffer = await getBase64(file)

		$('#image-preview-container').append(createImagePreview(imageBuffer, file.name, humanFileSize(file.size)))
		$('.handle').hover(function () {
			// over
			$(this).css('cursor', 'pointer');

		}, function () {
			// out
		}
		);
	}
	hideStatus();
	$('#image-selector').val('');
});


$('#btn-convert').click(function (e) {
	e.preventDefault();
	hideError()
	$('#image-form').submit()
});
$('#image-form').submit(function (e) {
	e.preventDefault();
	hideError()
	disableDownload()
	showStatus('Uploading')
	const formData = new FormData($('#image-form')[0]);

	let validFileSize = true;
	let validFileType = true;
	$('.unique-image').each(function (index, element) {
		const base64 = $(element).attr('src')
		const blb = base64toBlob(base64)

		const imageid = $(element).attr('id'); //Image id used for sorting for server
		let remotevalue = $(element).attr('remotevalue'); // Used to prevent reupload
		if (!remotevalue) remotevalue = 'none'

		if (validFileSize) {
			validFileSize = validateFileSize(blb)
		}

		if (validFileType) {
			validFileType = validateFileSize(blb)
		}

		if (remotevalue === 'none') {
			formData.append('images', blb)
		}
		formData.append('imageids', imageid)
		formData.append('remotevalues', remotevalue)

	});

	if (validFileSize) {
		if (validFileType) {
			$.ajax({
				url: '/upload',
				cache: false,
				contentType: false,
				processData: false,
				data: formData,
				type: 'POST',
				success: function (response) {

					showStatus('Converting')
					const fileUrl = response.wait
					const idremotevaluepair = response.idremotevaluepair;

					//console.log(idremotevaluepair);
					for (const idvaluepair of idremotevaluepair) {

						const id = Object.keys(idvaluepair)[0]
						const remoteValue = idvaluepair[id];

						console.log({ id, remoteValue });

						$(`#${id}`).attr('remotevalue', remoteValue);
					}

					checkForFile(fileUrl, undefined)
					const intervalId = setInterval(function () {
						checkFile(fileUrl).then(res => {
							console.log("res is: ", res);
							if (res == 200) {

								clearInterval(intervalId);
								enableDownload(fileUrl)
								console.log("File is ready /***********/");
								hideStatus();
							}
						}).catch((error) => {
							console.log(error);
						})
					}, 3000);
					//hideStatus()
				},
				error: function (error) {
					console.log(error);
					showResponseError(error)
					hideStatus()
				}
			});
		}
		else {
			showLocalError("Please select valid image type")
		}
	}
	else {
		showLocalError("Error: Please remove a file which is greater than 10MB")
	}
});

function removeImage(id) {
	$(`#${id}`).remove()
	hideError()
}
function createImagePreview(imageBuffer, fileName, fileSize) {

	const randId = makeid(10);

	const imageid = makeid(10);

	return `<div id=${randId} class="d-flex border align-items-center d-flex my-1 p-2">
	<img id=${imageid} class="unique-image" src=${imageBuffer} style="width: 4em; height: 4em;">
	<div class="p-2 d-flex flex-column overflow-hidden">
	  <span class="mwrap" style="font-weight: 500;">${fileName}</span>
	  <small class="mwrap">Size: ${fileSize}</small>
	</div>
	<div class="d-flex ml-auto">
	  <img onclick='removeImage("${randId}")' class="mr-2 close-icon"
		style="width: 1em; height: 1em;" src="/img/close.png">
	  <img onclick='removeImage("${randId}")' class="mx-2 handle" style="width: 1em; height: 1em;"
		src="/img/move.png">
	</div>
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

function base64toBlob(base64) {

	const uritype = base64.split(';')[0].split('/')[1];

	var byteString = atob(base64.split(',')[1]);
	var ab = new ArrayBuffer(byteString.length);
	var ia = new Uint8Array(ab);

	for (let i = 0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt(i);
	}

	const type = `image/${uritype}`
	return new Blob([ab], { type });

}

function showStatus(msg = '') {


	disableDownload();
	console.log({ msg });

	$('#status-text').html(msg);
	$('#status-view').show();

}

function hideStatus() {
	$('#status-view').hide();
}

function checkFile(fileUrl) {

	return new Promise(function (resolve, reject) {

		fetch(fileUrl, { method: 'HEAD' }).then((res) => {

			console.log(res.status)
			resolve(200)

		}).catch(err => {
			console.log(err)
			reject(400)
		})


		/* 
				$.ajax({
					type: 'HEAD',
					url: fileUrl,
					success: function () {
						resolve(200)
					},
					error: function () {
						reject(400)
					}
				}); */

	})
}

function makeid(length) {
	var result = '';
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;

	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}

	return result;
}

function enableDownload(downloadUrl) {
	$('#btn-download').attr("href", downloadUrl);
	$('#btn-download').show();
}

function disableDownload() {
	$('#btn-download').attr("href", "/");
	$('#btn-download').hide();
}

function showResponseError(error) {
	$('#error-view').text(JSON.parse(error.responseText).error);
	$('#error-view').show()
}

function showLocalError(error) {
	$('#error-view').text(error);
	$('#error-view').show()
}

function hideError() {
	$('#error-view').text('');
	$('#error-view').hide()
}

function humanFileSize(bytes, si = false, dp = 1) {
	const thresh = si ? 1000 : 1024;

	if (Math.abs(bytes) < thresh) {
		return bytes + ' B';
	}

	const units = si
		? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
		: ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
	let u = -1;
	const r = 10 ** dp;

	do {
		bytes /= thresh;
		++u;
	} while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


	return bytes.toFixed(dp) + ' ' + units[u];
}

function validateFileSize(file) {
	if (file.size > 10000000) {
		return false
	}

	return true

}

function checkForFile(fileUrl, intervalId) {
	checkFile(fileUrl).then(res => {
		console.log("res is: ", res);
		if (res == 200) {
			if (intervalId) {
				clearInterval(intervalId);
			}

			enableDownload(fileUrl)

			console.log("File is ready /***********/");
			hideStatus();
		}
	}).catch((error) => {
		console.log(error);
	})
}

const validateFileType = (file) => {
	if (file) {
		const supportedFilesList = ['jpg', 'jpeg', 'png']
		const fileType = file.type.toString().toLowerCase()
		for (const supportedFile of supportedFilesList) {
			if (fileType.includes(supportedFile)) {
				return true;
			}
		}

		return false;
	}
	else
		return false;
}
function getExtension(filename) {
	var parts = filename.split('.');
	return parts[parts.length - 1];
}