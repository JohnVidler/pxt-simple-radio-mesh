//% color="#61d15a"
//% icon="\uf1eb"
//% groups=[ "Configuration", "Transmit", "Receive" ]
namespace SimpleRadioMesh {
    enum MessageType {
        INVALID = 0,
        ROUTE_ANNOUNCE = 1
    }

    const LOCAL_ADDRESS = control.deviceSerialNumber()
    const GOSSIP_INTERVAL = 1000

    let localAddress = Math.floor(Math.random() * 256)

    interface IPath {
        "src": number,
        "dst": number,
        "ttl": number,
        "distance": number
    }

    let forwardTable: IPath[] = []
    let dataTable: { [name: string]: any } = {}

    // Configure the radio
    radio.on()

    radio.onDataPacketReceived((packet) => {
        console.log(packet.serial)
    })

    radio.onReceivedBuffer((rx) => {
        //console.log( rx.toHex() )
        let _type = rx.getUint8(0)
        switch (_type) {
            case MessageType.ROUTE_ANNOUNCE:
                let route = parseRoutePacket(rx)
                route.distance = route.distance + 1 // Increment the distance, its at least 1 hop from us!

                console.log( route )

                /*forwardTable = forwardTable.filter((v) => {
                    if (v.dst == route.dst && route.distance < v.distance) // Filter any routes further away than this
                        return false
                    return true
                })*/
                //forwardTable.push(route) // and append our new route

                break
        }
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

    function routePacket(path: IPath): Buffer {
        let buffer = Buffer.create(11)
        buffer.setUint8(0, MessageType.ROUTE_ANNOUNCE)
        buffer.setNumber(NumberFormat.UInt32BE, 1, path.src)
        buffer.setNumber(NumberFormat.UInt32BE, 5, path.dst)
        buffer.setUint8(9, path.distance % 255)
        buffer.setUint8(10, path.ttl % 255)
        return buffer
    }

    function parseRoutePacket(buffer: Buffer): IPath {
        return {
            "src": buffer.getNumber(NumberFormat.UInt32BE, 1),
            "dst": buffer.getNumber(NumberFormat.UInt32BE, 5),
            "distance": buffer.getUint8(9),
            "ttl": buffer.getUint8(10)
        }
    }

    function doGossip(phase: number) {
        switch (phase) {
            case 0:
                radio.sendBuffer(routePacket({ src: LOCAL_ADDRESS, dst: LOCAL_ADDRESS, distance: 0, ttl: 255 }))
                break;

            case 1:
                if (forwardTable.length == 0)
                    return

                let index = Math.floor(Math.random() * forwardTable.length)
                radio.sendBuffer(routePacket(forwardTable[index]))
                break;

            default:
            // Skip!
        }
    }
}