"""Import the preserved R3 pixel trace; never build or modify firmware."""
import argparse
import hashlib
import json
import struct
import zlib
from pathlib import Path

SOURCE_SHA = 'fa22b68948bfebab200c5368d047411112eb1e5b7be6da498cf7a501846dc755'
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'design/assets/screens/antiworkprotwerk-r3'


def png(width, height, pixels):
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data))
    scanlines = b''.join(b'\0' + pixels[y * width:(y + 1) * width] for y in range(height))
    return (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 0, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(scanlines, 9)) + chunk(b'IEND', b''))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    args = parser.parse_args()
    raw = args.source.read_bytes()
    assert hashlib.sha256(raw).hexdigest() == SOURCE_SHA, 'Preserved R3 trace hash differs'
    source = json.loads(raw)
    # Trace dimensions describe the ASCII grid, not the OLED pixel surface.
    assert (source['width'], source['height'], len(source['frames'])) == (36, 14, 64)
    width, height, columns = 128, 64, 8
    sheet = bytearray(1024 * 512)
    frame_hashes = []
    for index, frame in enumerate(source['frames']):
        assert frame['phase'] == index
        pixels = bytearray(width * height)
        for p in frame['pixels']:
            assert p['kind'] == 'pixel' and 0 <= p['x'] <= p['right'] < width and 0 <= p['y'] < height
            for x in range(p['x'], p['right'] + 1):
                pixels[p['y'] * width + x] = 255
        frame_hashes.append(hashlib.sha256(pixels).hexdigest())
        for y in range(height):
            offset = (index // columns * height + y) * 1024 + index % columns * width
            sheet[offset:offset + width] = pixels[y * width:(y + 1) * width]
        if index == 0:
            poster = png(width, height, pixels)
            # One compound path keeps the poster editable without hundreds of layers.
            path = ''.join(f'M{x} {y}h1v1h-1Z' for y in range(height) for x in range(width) if pixels[y * width + x])
    sprite = png(1024, 512, sheet)
    manifest = {
        'id': 'antiworkprotwerk-r3', 'title': 'AntiWorkProTwerk / ASCII SPIN3!',
        'description': 'Two-line rotating AntiWorkProTwerk logo from the original R3 renderer pixel trace. Stock UI and caption are omitted.',
        'width': width, 'height': height, 'frameCount': 64, 'columns': columns,
        'frameMs': 50, 'posterFrame': 0, 'loop': True, 'sprite': 'sprite.png', 'poster': 'poster.png',
        'provenance': {'kind': 'compiled-renderer-pixel-trace',
            'source': 'sp404mk2/custom_firmware/build/spin_r3/frames.json', 'sourceSha256': SOURCE_SHA,
            'hardwareEvidence': 'sp404mk2/custom_firmware/spin_r3/HARDWARE_RESULT.md',
            'timing': '50 ms preview assumption; device refresh timing was not measured.',
            'omissions': 'Stock font, AntiWorkProTwerk caption, header and surrounding UI are absent from this trace.'},
        'spriteSha256': hashlib.sha256(sprite).hexdigest(),
        'posterSha256': hashlib.sha256(poster).hexdigest(), 'frameSha256': frame_hashes,
    }
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / 'sprite.png').write_bytes(sprite)
    (OUT / 'poster.png').write_bytes(poster)
    (OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    (OUT / 'poster-path.json').write_text(json.dumps({'width': width, 'height': height, 'd': path}) + '\n', encoding='utf-8')
    print(f'Imported {len(frame_hashes)} exact frames; sprite {len(sprite)} bytes; poster {len(poster)} bytes')


if __name__ == '__main__':
    main()
