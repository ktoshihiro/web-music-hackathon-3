/*
 * http://webaudio.github.io/web-midi-api/
 */

// 4.1 requestMIDIAccess()

interface navigator {
    requestMIDIAccess(options?: MIDIOptions): Promise;
}


// 4.2 MIDIOptions dictionary

interface MIDIOptions {
    sysex: boolean;
}

// 4.3 MIDIInputMap Interface
// 4.3.1 Callback ForEachCallback Parameters
// 4.3.2 Attributes
// 4.3.3 Methods

// 4.4 MIDIOutputMap Interface
// 4.4.1 Callback ForEachCallback Parameters
// 4.4.2 Attributes
// 4.4.3 Methods
// 4.5 MIDISuccessCallback
// 4.5.1 Callback MIDISuccessCallback Parameters
// 4.6  MIDIErrorCallback
// 4.6.1 Callback MIDIErrorCallback Parameters
// 5. MIDIAccess Interface
// 5.1 Attributes



// 6. MIDIPort Interface

enum MIDIPortType {
    input,
    output
}

interface MIDIPort {
    id: string;
    manufacturer?: string;
    name?: string;
    type: MIDIPortType;
    version?: string;
    ondisconnect: EventHandler;
}

interface MIDIInput {
    onmidimessage: EventHandler;
}

interface MIDIOutput {
    send(data: any, timestamp?: number): void;
}

// 7. MIDIMessageEvent Interface

interface MIDIMessageEvent extends Event {
    receivedTime: number;
    data: Uint8Array;
}

// 7.1 Attributes
// 7.2 MIDIMessageEventInit Interface
// 7.2.1 Dictionary MIDIMessageEventInit Members




// 8. MIDIMessageEvent Interface
