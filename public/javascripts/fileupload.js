$(function () {
    'use strict';
    var url = '/upload';
    $('#fileupload').fileupload({
        url: url,
        dataType: 'json',
        autoUpload: false,
        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
        maxFileSize: 5000000,
        disableImageResize: /Android(?!.*Chrome)|Opera/
            .test(window.navigator.userAgent),
        previewMaxWidth: 200,
        previewMaxHeight: 200,
        previewCrop: true
    }).on('fileuploadadd', function (e, data) {
        data.context = $('<div class="col-lg-3"/>').appendTo('#files');
        
        var panel = $('<section class="panel"/>')
        var header = $('<header class="panel-heading">');
        var body = $('<section class="panel-body"/>')
        
        var del = $('<button type="button" class="close img-close"/>');
        var ic = $('<i class="icon-remove">');
        ic.appendTo(del);
        
        
        $.each(data.files, function (index, file) {
            var node = $('<span/>')
                        .text(file.name)
                        .appendTo(header);
            del.appendTo(header);
            header.appendTo(panel);
            body.appendTo(panel);
            panel.appendTo(data.context);
        });
        
        var newDiv = $('<div/>')
                        .addClass('image-data')
                        .data(data)
                        .appendTo(data.context);

    }).on('fileuploadprocessalways', function (e, data) {
        var index = data.index,
            file = data.files[index],
            node = $(data.context).children().children('.panel-body')[index];
        if (file.preview) {
            $(node).append(file.preview);
        }
        if (file.error) {
            node
                .append('<br>')
                .append($('<span class="text-danger"/>').text(file.error));
        }
    }).on('fileuploaddone', function (e, data) {

        $.each(data.result.files, function (index, file) {
            if (file.url) {
                
                var link = $('<a>')
                    .attr('target', '_blank')
                    .addClass('uploaded-file-links')
                    .prop('href', file.url);
                $(data.context.children()[index])
                    .wrap(link);
                    
                var RImages = Parse.Object.extend("rImages");
                var saveImg = new RImages();
                var n = {};
                n['rewardId'] = parseInt($('#reward-id').val());
                n['image'] = file.url;
                saveImg.save(n,{
                    success:function(result){console.log('Saved a Reward Image');},
                    error:function(err){console.log('Error',err);}
                });    
                    
            } else if (file.error) {
                var error = $('<span class="text-danger"/>').text(file.error);
                $(data.context.children()[index])
                    .append('<br>')
                    .append(error);
            }
        });
    }).on('fileuploadfail', function (e, data) {
        $.each(data.files, function (index, file) {
            var error = $('<span class="text-danger"/>').text('File upload failed.');
            $(data.context.children()[index])
                .append('<br>')
                .append(error);
        });
    }).on('fileuploadprogressall', function (e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $('.progress-bar').css(
            'width',
            progress + '%'
        );
        
        $('.progress-bar').attr('data-original-title',progress+'%');
        if(progress == 100){$('#image-upload-msg').show();}

    }).prop('disabled', !$.support.fileInput)
        .parent().addClass($.support.fileInput ? undefined : 'disabled');
});