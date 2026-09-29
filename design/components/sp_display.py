"""Build-time markup for the portable sp-display browser component."""
from html import escape
from math import ceil
import json


def screen_markup(sequence, asset_url):
    w, h = sequence['width'], sequence['height']
    count, cols = sequence['frameCount'], sequence['columns']
    timing = (f' durations="{escape(json.dumps(sequence["durations"]), quote=True)}"'
              if 'durations' in sequence else '')
    return f'''<sp-display role="group" aria-label="{escape(sequence['title'], quote=True)} screen playback" frame-width="{w}" frame-height="{h}" frames="{count}" columns="{cols}" frame-ms="{sequence['frameMs']}"{timing} autoplay {'loop' if sequence['loop'] else ''}>
<img class="screen-poster" src="{asset_url}/{sequence['poster']}" width="{w}" height="{h}" alt="{escape(sequence.get('description', sequence['title']), quote=True)}">
<svg class="screen-frames" viewBox="0 0 {w} {h}" aria-hidden="true"><image data-frames href="{asset_url}/{sequence['sprite']}" width="{w*cols}" height="{h*ceil(count/cols)}" x="0" y="0"/></svg>
<button type="button" aria-label="Play SP screen animation" hidden><svg class="playback-symbol" viewBox="0 0 12 12" aria-hidden="true"><path class="symbol-pause" d="M4 2v8M8 2v8"/><path class="symbol-play" d="m3 2 7 4-7 4Z"/></svg></button>
</sp-display>'''
