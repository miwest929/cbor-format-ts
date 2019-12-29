

// RFC: https://www.google.com/search?q=CBOR+rfc&oq=CBOR+rfc&aqs=chrome..69i57j0l4j69i65.1176j0j4&sourceid=chrome&ie=UTF-8
// New to the idea of RFCs? Read through https://www.mnot.net/blog/2018/07/31/read_rfc to familiarize yourself with the process
// of reading RFCs.

// You may get a feel for the CBOR format by exploring http://cbor.me/
import * as textEncoding from 'text-encoding'; // npm install --save @types/text-encoding

type DecodedDataType = { nextIndex: number, decodedItem: any };
type ConsumeFnType = (data: Uint8Array, idx: number) => DecodedDataType;
class CBOR {
    public static encode(data: Map<string, any>): Uint8Array {
        return new Uint8Array([10,20]);
    }

    public static decode(data: Uint8Array): any {
        const nextByte = data[0];

        const consumeTypeFn = CBOR.matchNextItemType(nextByte);
        if (consumeTypeFn === undefined) {
          console.log("Error. Couldn't match type of next data item")
        }

        const result = consumeTypeFn(data, 0);
        return result.decodedItem;
    }

    private static matchNextItemType(byte: number): ConsumeFnType {
      if (byte >= 0xA0 && byte <= 0xB7) {
          return CBOR.consumeMapObject;
      } else if (byte >= 0x60 && byte <= 0x77) {
          return CBOR.consumeTinyUtf8String;
      } else if (byte >= 0x00 && byte <= 0x17) {
          // tiny unsignd integer that's between 0 and 23
          return CBOR.consumeTinyUnsignedInteger;
      } else if (byte >= 0x80 && byte <= 0x97) {
          // small array
          return CBOR.consumeSmallArray;
      }

      return undefined;
    }

    private static consumeSmallArray(bytes: Uint8Array, idx: number): DecodedDataType {
       const arrLen = bytes[idx] - 0x80;
       let obj = [];
       let nextIdx = idx + 1;

       for (let i = 0; i < arrLen; i++) {
           const consumeFn = CBOR.matchNextItemType(bytes[nextIdx]);
           const result = consumeFn(bytes, nextIdx);
           nextIdx = result.nextIndex;
           obj.push(result.decodedItem); 
       }

       return {nextIndex: nextIdx, decodedItem: obj};
    }

    private static consumeTinyUnsignedInteger(bytes: Uint8Array, idx: number): DecodedDataType {
        return {nextIndex: idx+1, decodedItem: bytes[idx]};
    }

    private static consumeTinyUtf8String(bytes: Uint8Array, idx: number): DecodedDataType {
        // utf8 string
        const strLen = bytes[idx] - 0x60;
        const strBytes = bytes.slice(idx+1, idx+strLen+1);
        return {nextIndex: idx+strLen+1, decodedItem: CBOR.toUtf8(strBytes)};
    }

    private static consumeMapObject(bytes: Uint8Array, idx: number): DecodedDataType {
        const mapKeyCount = bytes[idx] - 0xA0;
        const obj = new Map<any, any>();
        let nextIdx = idx + 1;

        for (let i = 0; i < mapKeyCount; i++) {
            // for each key verify the key is a utf8 string
            // value will be decoded recursively
            if (CBOR.isTinyUtf8Type(bytes[nextIdx])) { // TODO: Change to generic string type matcher
                const keyResult = CBOR.consumeTinyUtf8String(bytes, nextIdx);
                nextIdx = keyResult.nextIndex;

                const valueConsumeFn = CBOR.matchNextItemType(bytes[nextIdx]);
                const valueResult = valueConsumeFn(bytes, nextIdx);
                obj.set(keyResult.decodedItem, valueResult.decodedItem);
            } else {
                // ERROR: Keys must be strings
                break;
            }
        }

        return {nextIndex: idx+1, decodedItem: obj};
    }

    private static isTinyUtf8Type(byte: number): boolean {
        // Between 0x60 and 0x77: utf8 string with (byte-0x60) bytes to follow
        return byte >= 0x60 && byte <= 0x77;
    }
    
    private static toUtf8(data: Uint8Array): string {
        return new textEncoding.TextDecoder('utf-8').decode(data);
    }
}

function main() {
  const data = new Map<string, any>();
  data.set("city", "New York City");
  data.set("dependents", 3);
  data.set("numbers", ["6318334616", "6319286067"]);

    /* A3                               # map(3)
    64                            # text(4)
    63697479                   # "city"
    6D                            # text(13)
    4E657720596F726B2043697479 # "New York City"
    6A                            # text(10)
    646570656E64656E7473       # "dependents"
    03                            # unsigned(3)
    64                            # text(4)
    61676573                   # "ages"
    83                            # array(3)
    18 23                      # unsigned(35)
    0C                         # unsigned(12)
    04*/
  const bytes: Uint8Array = new Uint8Array([
        0xA3, 0x64, 0x63, 0x69, 0x74, 0x79,
        0x6D, 0x4E, 0x65, 0x77, 0x20, 0x59, 0x6F, 0x72, 0x6B, 0x20, 0x43, 0x69, 0x74, 0x79,
        0x6A, 0x64, 0x65, 0x70, 0x65, 0x6E, 0x64, 0x65, 0x6E, 0x74, 0x73,
        0x03, 0x64, 0x61, 0x67, 0x65, 0x73,
        0x83, 0x18, 0x23, 0x0C, 0x04
    ]);

  //let encoded = CBOR.encode(data);
  const obj = CBOR.decode(bytes);
  console.log(obj);
}

main();