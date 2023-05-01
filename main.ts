//% color="#61d15a"
//% icon="\uf1eb"
//% groups=[ "Configuration", "Transmit", "Receive" ]
namespace SimpleRadioMesh {
    enum MessageType {
        INVALID = 0,
        ROUTE_ANNOUNCE = 1
    }

    const GOSSIP_INTERVAL = 1000

    let localAddress = Math.floor(Math.random() * 256)

    interface IPath {
        ttl: number,
        distance: number
    }

    let forwardTable: IPath[] = []
    let dataTable: { [name: string]: any } = {}

    // Configure the radio
    radio.on()

    radio.onDataPacketReceived((packet) => {
        console.log(packet.serial)
    })

    radio.onReceivedBuffer((rx) => {
        //
    })

    control.runInBackground(() => {
        let phase = 0
        let lastGossip = control.millis()
        while (true) {
            if (control.millis() - lastGossip >= GOSSIP_INTERVAL) {
                lastGossip = control.millis()
                doGossip(phase++ % 5)
            }
        }

    })

    function routePacket(address: number, distance: number, ttl: number): Buffer {
        let buffer = Buffer.create(11)
        buffer.setUint8(0, MessageType.ROUTE_ANNOUNCE)
        buffer.setNumber(NumberFormat.UInt32BE, 1, control.deviceSerialNumber())
        buffer.setNumber(NumberFormat.UInt32BE, 5, address)
        buffer.setUint8(9, distance % 255)
        buffer.setUint8(10, ttl % 255)
        return buffer
    }

    function parseRoutePacket(buffer: Buffer): { "from": number, "to": number, "ttl": number } {
        return {
            "from": buffer.getNumber(NumberFormat.UInt32BE, 1),
            "to": buffer.getNumber(NumberFormat.UInt32BE, 5),
            "ttl": buffer.getUint8(9)
        }
    }

    function doGossip(phase: number) {
        switch (phase) {
            case 0:
                radio.sendBuffer(routePacket(control.deviceSerialNumber(), 0, 255))
                break;

            case 1:
                if (forwardTable.length == 0)
                    return

                let addr = Math.floor(Math.random() * forwardTable.length)
                let row = forwardTable[addr]
                radio.sendBuffer(routePacket(addr, row.distance, row.ttl))
                break;

            default:
                console.log("Nothing to do in phase " + phase)
        }
    }
}