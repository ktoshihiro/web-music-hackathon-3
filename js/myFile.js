var myFile;

(function (myFile) {
    var init = (function () {
        function init() {
            var rcv = document.getElementById("RCV");
            rcv.addEventListener("dragover", dragOver, true);
            rcv.addEventListener("drop", drop, true);
        }

        return init;
    })();

    myFile.init = init;

    /**
     * dragover event -> https://developer.mozilla.org/en-US/docs/Web/Events/dragover
     * DragEvent -> https://developer.mozilla.org/en-US/docs/Web/API/DragEvent
     */
    function dragOver(event) {
        console.log("dragOver");
        event.preventDefault();
    }

    /**
     * drop event -> https://developer.mozilla.org/en-US/docs/Web/Events/drop
     * DragEvent -> https://developer.mozilla.org/en-US/docs/Web/API/DragEvent
     *
     * @param {DragEvent} event
     */
    function drop(event) {
        event.preventDefault();
        var dataTransfer = event.dataTransfer;
        var files = dataTransfer.files;

        for (i = 0; i < files.length; i++) {
            alert("ファイル名: " + files[i].name);
            console.log(files[i]);
        }

        var reader = new FileReader();
        reader.onload = function (event) {  // ProgressEvent -> https://developer.mozilla.org/en-US/docs/Web/API/ProgressEvent
            console.log(arguments);
            console.log(event);
            console.log(event.target.result);
        }
        reader.readAsBinaryString(files[0]);
    }
})(myFile || (myFile = {}));

window.addEventListener("load", myFile.init);