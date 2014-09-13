var myMIDI;

(function (myMidi) {
    var midi;   // interface MIDIAccess
    var inputs = [];
    var outputs = [];
    var midiout, mikuout;
    //const mikuDeviceName = "Microsoft GS Wavetable Synth";
    const mikuDeviceName = "NSX-39 ";   // デバイス名の最後にスペースがあるのが罠デス
    var intervalID;
    var lastNote;

    var init = (function () {
        function init() {
            navigator.requestMIDIAccess({sysex: true})
                .then(function (access) {
                    midi = access;

                    if (typeof access.inputs === "function") {
                        console.log("inputs is function");
                        inputs = midi.inputs();
                        outputs = midi.outputs();
                    } else {
                        console.log("inputs is not function");
                        var it = access.inputs.values();
                        for (var o = it.next(); !o.done; o = it.next()) {
                            inputs.push(o.value);
                        }
                        it = access.outputs.values();
                        for (var o = it.next(); !o.done; o = it.next()) {
                            outputs.push(o.value);
                        }
                    }
                    console.log(midi, inputs, outputs);
                }, failure)
                .then(createInputsOutpusMenu, failure)
                .then(setupEventHandlers, failure);
        }

        function createInputsOutpusMenu() {
            for (i = 0; i < inputs.length; i++) {
                var opt = document.createElement("option");
                opt.text = inputs[i].name;
                opt.value = i;
                document.getElementById("MIDIInputs").add(opt);
            }

            for (i = 0; i < outputs.length; i++) {
                var opt = document.createElement("option");
                opt.text = outputs[i].name;
                opt.value = i;
                document.getElementById("MIDIOutputs").add(opt);
                if (mikuDeviceName === outputs[i].name) {
                    mikuout = outputs[i];
                    console.log('mikuout: ', mikuout);
                }
            }
        }

        function setupEventHandlers() {
            var item;

            item = document.getElementById("MIDIInputs");
            item.addEventListener("change", onMIDIInputChange, false);

            item = document.getElementById("MIDIOutputs");
            item.addEventListener("change", onMIDIOutputChange, false);

            item = document.getElementById("start");
            item.addEventListener("click", onStartClick, false);

            item = document.getElementById("stop");
            item.addEventListener("click", onStopClick, false);

            var pads = ["pad00", "pad01", "pad10", "pad11"];
            for (var i = 0; i < pads.length; i++) {
                item = document.getElementById(pads[i]);
                item.addEventListener("mousedown", onMouseDown, true);
                item.addEventListener("touchstart", onMouseDown, true);
                item.addEventListener("mouseup", onMouseUp, true);
                item.addEventListener("touchend", onMouseUp, true);
            }
        }

        function onStartClick(event) {
            if (!midiout) {
                return;
            }
            mikuout.send([0xf0, 0x43, 0x79, 0x09, 0x11, 0x0a, 0x00, 0x32, 0x4a, 0x7f, 0x29, 0x01, 0xf7]);
            intervalID = setInterval(noteOnTask, 1000);
        }

        function onStopClick(event) {
            if (!midiout) {
                return;
            }
            midiout.send([0x80, lastNote, 0x00]);
            clearInterval(intervalID);
        }

        function noteOnTask() {
            midiout.send([0x80, lastNote, 0x00]);
            var note = (Math.random() * 0x7F) & 0x77;
            midiout.send([0x90, note, 0x7f]);
            lastNote = note;
        }

        /**
         *
         * @param {MouseEvent} event
         */
        function onMouseDown(event) {
            if (!midiout) {
                return;
            }
            switch (event.target.id) {
                case "pad00":
                    midiout.send([0x90, 64, 127]);
                    break;
                case "pad01":
                    midiout.send([0x90, 65, 127]);
                    break;
                case "pad10":
                    midiout.send([0x90, 66, 127]);
                    break;
                case "pad11":
                    midiout.send([0x90, 67, 127]);
                    break;
            }
            midiout.send([0x90, 28, 127]);
            event.preventDefault();
        }

        function onMouseUp(event) {
            if (!midiout) {
                return;
            }
            switch (event.target.id) {
                case "pad00":
                    midiout.send([0x80, 64, 0]);
                    break;
                case "pad01":
                    midiout.send([0x80, 65, 0]);
                    break;
                case "pad10":
                    midiout.send([0x80, 66, 0]);
                    break;
                case "pad11":
                    midiout.send([0x80, 67, 0]);
                    break;
            }
            midiout.send([0x80, 28, 0]);
            event.preventDefault();
        }

        function onMIDIInputChange(event) {
            var targetID = event.target.id;
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].onmidimessage = null;
            }
            inputs[event.target.selectedIndex].onmidimessage = onMIDIMessage;
        }

        function onMIDIOutputChange(event) {
            midiout = outputs[event.target.selectedIndex];
        }

        function onMIDIMessage(event) {
            var status = event.data[0] & 0xF0;
            var channel = event.data[0] & 0x0F;

            console.log("Channel: " + (channel + 1));
            switch (status) {
                case 0x80:
                    //console.log("Note Off");
                    //console.log(event.data[1], event.data[2]);
                    break;
                case 0x90:
                    //console.log("Note On");
                    //console.log(event.data[1], event.data[2]);
                    if (event.data[2] > 0) {
                        if (event.data[1] === lastNote) {
                            console.log("OK");
                            sendDohentai();
                            //mikuout.send([0x90, 64, 127]);
                        }
                    }
                    break;
                case 0xA0:
                    console.log("Polyphonic key pressure / Aftertouch");
                    break;
                case 0xB0:
                    console.log("Control change");
                    handleControlChange(event.data[1], event.data[2]);
                    break;
                case 0xC0:
                    console.log("Program change");
                    break;
                case 0xD0:
                    console.log("Channel pressure / Aftertouch");
                    break;
                case 0xE0:
                    console.log("Pitch bend change");
                    break;
                case 0xB0:
                    console.log("Selects Channel Mode");
                    break;
                case 0xF0:
                    console.log("System Messages");
                    break;
            }
        }

        var count = 0;
        function sendDohentai() {
            //mikuout.send([0x90, 64, 127]);
            count++;
            //mikuout.send([0x80, 64, 0]);
            mikuout.send([0x90, 64, 127]);
            if (count < 5) {
                console.log(count);
                setTimeout(sendDohentai, 250);
            } else {
                count = 0;
                setTimeout(stopDohentai, 250);
                //mikuout.send([0x80, 64, 0]);
            }
        }

        function stopDohentai() {
            mikuout.send([0x80, 64, 0]);
        }

        function handleControlChange(controllerNumber, data) {
            switch (controllerNumber) {
                case 0x01, 0x21:
                    console.log("modulation depth (0x" + controllerNumber.toString(16).toUpperCase() + ")");
                    break;
                case 0x05, 0x25:
                    console.log("portamento time (0x" + controllerNumber.toString(16).toUpperCase() + ")");
                    break;
                case 0x06, 0x26:
                    console.log("data entry (0x" + controllerNumber.toString(16).toUpperCase() + ")");
                    break;
                case 0x07, 0x27:
                    console.log("main volume (0x" + controllerNumber.toString(16).toUpperCase() + ")");
                    break;
                case 0x08, 0x28:
                    console.log("balance control (0x" + controllerNumber.toString(16).toUpperCase() + ")");
                    break;
                case 0x0A, 0x2A:
                    console.log("panpot (0x" + controllerNumber.toString(16).toUpperCase() + ")");
                    break;
                case 0x0B, 0x2B:
                    console.log("expression (0x" + controllerNumber.toString(16).toUpperCase() + ")");
                    break;
                default:
                    console.log("0x" + controllerNumber.toString(16).toUpperCase());
                    break;
            }
        }

        function toHexString(decimal) {
            return "0x" + decimal.toString(16).toUpperCase();
        }

        function failure(error) {
            console.log("myMIDI.init: failure");
            console.log(error);
        }

        return init;
    })();

    myMidi.init = init;
})(myMIDI || (myMIDI = {}));

window.addEventListener("load", myMIDI.init);

/*
 00 - 07
 10 - 17
 ...
 70 - 77
 */
