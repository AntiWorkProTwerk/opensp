"""Offline title-record lesson. No file input, firmware, device I/O or emulator."""
import hashlib
import sys

if len(sys.argv) != 1:
    raise SystemExit("This synthetic example accepts no input files or arguments.")

original = b"UTILITY MENU\0"
candidate = b"CUSTOM MENU!\0"
assert len(original) == len(candidate) == 13
assert original[-1] == candidate[-1] == 0
changed = [i for i, pair in enumerate(zip(original, candidate)) if pair[0] != pair[1]]
assert changed == list(range(12))
restored = bytearray(candidate)
for index in changed:
    restored[index] = original[index]
assert bytes(restored) == original
assert hashlib.sha256(restored).digest() == hashlib.sha256(original).digest()
print("12 changed bytes; terminator unchanged; size unchanged; reverse comparison passed.")

labels = ("SYSTEM", "PAD SET", "EFX SET", "IMPORT", "BACKUP", "FORMAT")

def draw_model(title, selection):
    """An original Python model, not recovered SP code."""
    return title[:-1].decode("ascii"), labels, selection

cases = 0
for selection in range(len(labels)):
    for title in (original, candidate):
        result = draw_model(title, selection)
        assert result[0] == title[:-1].decode("ascii")
        assert result[1:] == (labels, selection)
        cases += 1
assert cases == 12
print("12 synthetic cases passed. This is not an SP emulator or hardware test.")
