//% color="#61d15a"
//% icon="\uf1eb"
//% groups=[ "Configuration", "Transmit", "Receive" ]
namespace SimpleRadioMesh {
    let localAddress = Math.floor(Math.random() * 256);

    const ADDRESS_MAX = 256;
    const LENGTH_MAX = 256;

    //% block group="Configuration"
    //% address.min=1 address.max=256
    export function setMeshAddress(address: number) {
        localAddress = Math.floor(address);
        if (localAddress < 1)
            localAddress = 1;
        else if (localAddress > ADDRESS_MAX)
            localAddress = ADDRESS_MAX;
    }

    //% block group="Configuration"
    export function meshAddress(): number {
        return localAddress;
    }

    //% block
    export function everyone(): number {
        return 0;
    }

    //% block="on mesh received" group="Receive"
    //% draggableParameters
    export function onMeshReceivedNumber(handler: (address: number, value: number) => void) {
        //
    }

    //% block="on mesh received" group="Receive"
    //% draggableParameters
    export function onMeshReceivedKV(handler: (address: number, key: any, value: any) => void) {
        //
    }

    //% block="on mesh received" group="Receive"
    //% draggableParameters
    export function onMeshRexeivedString(handler: (address: number, text: string) => void) {
        //
    }

    //% block="mesh send to $address number $value"
    //% group="Transmit"
    export function sendNumber(address: number, value: number) {
        //
    }

    //% block="mesh send to $address ; $key = $value"
    //% group="Transmit"
    export function sendKV(address: number, key: any, value: any) {
        //
    }

    //% block="mesh send to $address $value"
    //% group="Transmit"
    export function sendString(address: number, value: string) {
        //

    }

    function forward(packet: RadioPacket) {
        packet
    }


    class RadioPacket {
        buffer: Array<number>;

        constructor(input: Array<number>) {
            this.buffer = input || [0, 0, 0, 0];
        }

        public get source() { return this.buffer[0]; }
        public set source(address: number) {
            this.buffer[0] = address;
        }

        public get destination() { return this.buffer[1]; }
        public set destination(address: number) {
            this.buffer[1] = address;
        }

        public get ttl() { return this.buffer[1]; }
        public set ttl(hops: number) {
            this.buffer[2] = hops;
        }

        public get length() { return this.buffer[1]; }
        public set length(length: number) {
            if (length > LENGTH_MAX)
                length = LENGTH_MAX;
            if (length < 0)
                length = 0;
            this.buffer[3] = length;
            if (this.buffer.length < length + 3)
                console.warn("WARN: Packet length is longer than the current packet!");
        }

        payload() {
            return this.buffer.slice(4);
        }
    }
}