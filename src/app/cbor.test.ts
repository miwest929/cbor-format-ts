import { CBOR } from './cbor';

const assertBytesEqual = (actual: Uint8Array, expected: number[]) => {
  expect(actual).toStrictEqual(Uint8Array.from(expected));
}

describe('decoding', () => {
    test('can decode a map data structure', () => {
        const bytes: Uint8Array = new Uint8Array([
            0xA1, 0x44, 0x63, 0x69, 0x74, 0x79, 0x4D,
            0x4E, 0x65, 0x77, 0x20, 0x59, 0x6F, 0x72,
            0x6B, 0x20, 0x43, 0x69, 0x74, 0x79
        ]);
        const decoded = CBOR.decode(bytes);
    
        expect(decoded.size).toBe(1);
        expect(decoded.get('city')).toBe('New York City');
    })
});

describe.only('encoding', () => {
  test('can encode a floating point number', () => {
    // TODO: Right now CBOR library only accepts Maps
    const input = new Map<string, any>();
    input.set("height", 1.25);
    const encoded = CBOR.encode(input);
    assertBytesEqual(encoded, [
        0xA1, 0x66, 0x68, 0x65, 0x69, 0x67, 0x68,
        0x74, 0xF9, 0x3D, 0x00  
    ]);
  });

  test('can encode a one byte integer value', () => {
    // TODO: Right now CBOR library only accepts Maps
    const input = new Map<string, any>();
    input.set("age", 33);
    const encoded = CBOR.encode(input);
    assertBytesEqual(encoded, [0xA1, 0x63, 0x61, 0x67, 0x65, 0x18, 0x21]);
  });

  test('can encode a two byte integer value', () => {
    // TODO: Right now CBOR library only accepts Maps
    const input = new Map<string, any>();
    input.set("age", 33000);
    const encoded = CBOR.encode(input);
    assertBytesEqual(encoded, [0xA1, 0x63, 0x61, 0x67, 0x65, 0x19, 0x80, 0xE8]);
  });

  test('can encode an array value', () => {
    // TODO: Right now CBOR library only accepts Maps
    const input = new Map<string, any>();
    input.set("vowels", ["a", "e", "i", "o", "u"]);
    const encoded = CBOR.encode(input);

    assertBytesEqual(encoded, [
        0xA1, 0x66, 0x76, 0x6F, 0x77, 0x65, 0x6C,
        0x73, 0x85, 0x61, 0x61, 0x61, 0x65, 0x61,
        0x69, 0x61, 0x6F, 0x61, 0x75
    ]);
  });

  test('can encode an array within an array', () => {
    // TODO: Right now CBOR library only accepts Maps
    const input = new Map<string, any>();
    input.set("arr", ["a", "e", "i", "o", "u", ["b", "c", "d", "f"]]);
    const encoded = CBOR.encode(input);

    assertBytesEqual(encoded, [
      0xA1, 0x63, 0x61, 0x72, 0x72, 0x86,
      0x61, 0x61, 0x61, 0x65, 0x61, 0x69,
      0x61, 0x6F, 0x61, 0x75, 0x84, 0x61,
      0x62, 0x61, 0x63, 0x61, 0x64, 0x61,
      0x66    
    ]);
  });

  test('can encode a map data structure', () => {
    const input = new Map<string, any>();
    input.set("city", "New York City");

    const encoded = CBOR.encode(input);
    assertBytesEqual(encoded, [
        0xA1, 0x64, 0x63, 0x69, 0x74, 0x79, 0x6D, 
        0x4E, 0x65, 0x77, 0x20, 0x59, 0x6F, 0x72,
        0x6B, 0x20, 0x43, 0x69, 0x74, 0x79
    ]);
  });
});