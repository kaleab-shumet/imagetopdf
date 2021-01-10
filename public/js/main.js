$(document).ready(function () {
	$("#uploader").plupload({
		// General settings
		runtimes: 'html5,flash,silverlight,html4',
		url: '../upload',

		// User can upload no more then 20 files in one go (sets multiple_queues to false)
		max_file_count: 20,

		chunk_size: '1mb',

		file_data_name: 'images',




		filters: {
			// Maximum file size
			max_file_size: '10mb',
			// Specify what files to browse for
			mime_types: [
				{ title: "Image files", extensions: "jpg,png" }
			]
		},

		sortable: true,
		multi_part: true,

		// Enable ability to drag'n'drop files onto the widget (currently only HTML5 supports that)
		dragdrop: true,

		// Views to activate
		views: {
			list: true,
			thumbs: true, // Show thumbs
			active: 'thumbs'
		},

		// Flash settings
		flash_swf_url: '../../js/Moxie.swf',

		// Silverlight settings
		silverlight_xap_url: '../../js/Moxie.xap'
	});


	// Handle the case when form was submitted before uploading has finished
	$('#form').submit(function (e) {
		// Files in queue upload them first
		if ($('#uploader').plupload('getFiles').length > 0) {

			// When all files are uploaded submit form
			$('#uploader').on('complete', function () {
				$('#form')[0].submit();
			});

			$('#uploader').plupload('start');
		} else {
			alert("You must have at least one file in the queue.");
		}
		return false; // Keep the form from submitting
	});
});
