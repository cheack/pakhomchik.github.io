$(function () {
    var $file = $("#file");
    var $canvas = $("#canvas");
    var context = $canvas[0].getContext("2d");
    var images = [];
    var images_count;
    var drag_index;
    var dragging;
    var drag_x;
    var drag_y;
    var target_x;
    var target_y;
    var timer;

    context.canvas.width = window.innerWidth;
    context.canvas.height = window.innerHeight;

    $canvas.on('drop', onDrop);
    $canvas.on('dragover', onDragOver);
    $canvas.on("mousedown", onMouseDown);
    $canvas.on("mouseup", onMouseUp);
    $canvas.on("mousemove", onMouseMove);
    $file.on('change', onFileChange);

    function onDragOver(e) {
        e.preventDefault();
    }

    function onDrop(e) {
        e.preventDefault();
        addImages(e.originalEvent.dataTransfer.files, e.clientX, e.clientY, true);
    }

    function onFileChange(e) {
        addImages(e.target.files, 0, 0);
    }

    function addImages(files, x, y, drop) {
        $.each(files, function(i, file) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $('<img/>').load(function() {
                    var new_image = new CanvasImage(x, y, this, drop);
                    new_image.draw(context);
                    images.push(new_image);
                    images_count = images.length;
                }).attr('src', e.target.result);
            };

            reader.readAsDataURL(file);
        });
    }

    function onMouseDown(e) {
        var x = e.clientX;
        var y = e.clientY;

        for (var i=0; i < images_count; i++) {
            if (images[i].hit(x, y)) {
                dragging = true;
                drag_index = i;
            }
        }

        if (dragging) {
            images.push(images.splice(drag_index,1)[0]);
            drag_x = x - images[images_count-1].x;
            drag_y = y - images[images_count-1].y;
            target_x = x - drag_x;
            target_y = y - drag_y;
            timer = setInterval(onTick, 30);
        }

        e.preventDefault();
    }

    function onTick() {
        images[images_count-1].x = target_x;
        images[images_count-1].y = target_y;
        if (!dragging) clearInterval(timer);
        drawImages();
    }

    function onMouseUp() {
        dragging = false;
    }

    function onMouseMove(e) {
        if (!dragging) return;
        target_x = e.clientX - drag_x;
        target_y = e.clientY - drag_y;
    }

    function drawImages() {
        context.fillStyle = "#FFF";
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        for (var i=0; i < images_count; i++) {
            images[i].draw();
        }
    }

    function CanvasImage(x, y, image, drop) {
        var half_height = context.canvas.height / 2;
        var half_width = context.canvas.width / 2;

        if (image.width >= half_width || image.height >= half_height) {
            var ration = Math.min(half_height / image.height, half_width / image.width);
            this.height = image.height * ration;
            this.width = image.width * ration;
        } else {
            this.width = image.width;
            this.height = image.height;
        }

        this.image = image;
        this.x = x - (drop ? this.width/2 : 0);
        this.y = y - (drop ? this.height/2 : 0);
    }

    CanvasImage.prototype.hit = function(x, y) {
        return x >= this.x && y >= this.y && (x <= this.x + this.width) && (y <= this.y + this.height);
    };

    CanvasImage.prototype.draw = function() {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
        context.strokeRect(this.x, this.y, this.width, this.height);
    };
});
