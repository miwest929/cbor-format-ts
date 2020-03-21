import { CBOR } from './src/app/cbor';

function main() {
  const data = new Map<string, any>();
  data.set("city", "New York City");
  const encoded = CBOR.encode(data);
  console.log(encoded);
  console.log(CBOR.decode(encoded));

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
  //console.log(obj);
}

main();
