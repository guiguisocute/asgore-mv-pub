#!/usr/bin/env python3
"""Pack every sprite / font / sound the MV uses into src/assets.js (data URIs),
so the player works from file:// with no loader.

    python tools/import_assets.py [--ui path/to/assets.js]

Sources:
  * every cell of the spriters-resource sheets in asset/ (boss Asgore, the human
    souls + containers, overworld Asgore / Frisk / Toriel / Asriel / Chara), keyed
    '<sheet>/<cell index>' (tools/slice_sheet.py; names live in src/sprites.js)
  * battle UI (soul, buttons, HP label, attack target, strike, HUD / damage /
    dialogue fonts, UI sounds): packed from github.com/Jcw87/c2-sans-fight
    (UNDERTALE assets). Pass --ui to re-import those keys from another packed
    assets.js; otherwise they are copied from the existing src/assets.js
  * sound effects: the UNDERTALE SFX directory if present, converted to mono
    96k mp3 with ffmpeg (Safari cannot play ogg), plus asset/sfx_extra/
"""
import base64, io, json, os, subprocess, sys, tempfile
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
import slice_sheet

OUT = 'src/assets.js'
SFXDIR = 'asset/PC _ Computer - Undertale - Miscellaneous - Sound Effects'


def packed_js(path):
    src = open(path, encoding='utf-8').read()
    return json.loads(src[src.index('{'):src.rindex('}') + 1])


def ui_src():
    argv = sys.argv[1:]
    if '--ui' in argv:
        return argv[argv.index('--ui') + 1]
    if argv and not argv[0].startswith('-'):
        p = argv[0]
        return os.path.join(p, 'src/assets.js') if os.path.isdir(p) else p
    return OUT

UI_IMG = ['PlayerHeart/Default/0', 'PlayerHeart/Split/0', 'HeartShard/Default/0', 'HeartShard/Default/1',
          'HeartShard/Default/2', 'HeartShard/Default/3', 'UIFight/Default/0', 'UIFight/Highlight/0',
          'UIAct/Default/0', 'UIAct/Highlight/0', 'UIItem/Default/0', 'UIItem/Highlight/0', 'UIMercy/Default/0',
          'UIMercy/Highlight/0', 'HP/Default/0', 'Target/Default/0', 'TargetChoice/Default/0', 'TargetChoice/Default/1',
          *[f'Strike/Default/{i}' for i in range(6)], 'BattleFont', 'DamageFont', 'DefaultFont']
UI_META = ['PlayerHeart', 'HeartShard', 'UIFight', 'UIAct', 'UIItem', 'UIMercy', 'HP', 'Target', 'TargetChoice', 'Strike']
UI_SFX = ['MenuCursor', 'MenuSelect', 'BattleText', 'Ding', 'Flash', 'Warning', 'Slam', 'HeartShatter', 'HeartSplit',
          'PlayerDamaged', 'PlayerFight']

# key -> file in SFXDIR
SFX = {
    'VoiceAsg': 'snd_txtasg.wav', 'VoiceTor': 'snd_txttor.wav', 'VoiceAsr': 'snd_txtasr.wav',
    'Txt1': 'SND_TXT1.wav', 'Txt2': 'SND_TXT2.wav',
    'Select': 'snd_select.wav', 'MoveMenu': 'snd_movemenu.wav', 'Noise': 'snd_noise.wav', 'BattleFall': 'snd_battlefall.wav',
    'SpearAppear': 'snd_spearappear.wav', 'SpearRise': 'snd_spearrise.wav', 'Swipe': 'mus_sfx_a_swipe.wav',
    'SwipeShort': 'mus_sfx_swipe.wav', 'Target': 'mus_sfx_a_target.wav', 'EyeFlash': 'mus_sfx_eyeflash.wav',
    'Impact': 'snd_impact.wav', 'ScreenShake': 'snd_screenshake.wav', 'GlassBreak': 'snd_glassbreak.wav',
    'Break1': 'snd_break1.wav', 'Break2': 'snd_break2.wav', 'BreakBig': 'snd_break2_c.wav', 'BreakA': 'snd_breaka.wav',
    'Damage': 'snd_damage.wav', 'Hurt': 'snd_hurt1.wav', 'HeavyDamage': 'snd_heavydamage.wav', 'Heal': 'snd_heal_c.wav',
    'Item': 'snd_item.wav', 'Swallow': 'snd_swallow.wav', 'Power': 'snd_power.wav', 'SegaPower': 'mus_sfx_segapower.wav',
    'Spellcast': 'mus_sfx_spellcast.wav', 'Sparkles': 'mus_sfx_sparkles.wav', 'Sparkle': 'snd_sparkle1.wav',
    'Star': 'mus_sfx_star.wav', 'Generate': 'mus_sfx_generate.wav', 'RainbowBeam': 'mus_sfx_rainbowbeam_1.wav',
    'Charge': 'mus_sfx_hypergoner_charge.ogg', 'Gunshot': 'snd_curtgunshot.ogg', 'Gunshot2': 'mus_sfx_gunshot.wav',
    'ABullet': 'mus_sfx_a_bullet.wav', 'Frypan': 'mus_sfx_frypan.wav', 'BookSpin': 'mus_sfx_bookspin.wav',
    'PunchStrong': 'snd_punchstrong.wav', 'PunchWeak': 'snd_punchweak.wav', 'Saber': 'snd_saber3.wav',
    'Arrow': 'snd_arrow.wav', 'Bell': 'snd_bell.wav', 'ChurchBell': 'mus_churchbell.ogg', 'Chime': 'mus_chime.wav',
    'Harp': 'mus_harpnoise.ogg', 'FlameLoop': 'snd_flameloop.wav', 'BgFlame': 'mus_bgflameA.ogg',
    'Explosion': 'mus_explosion.wav', 'Grab': 'snd_grab.wav', 'Shock': 'snd_shock.wav', 'Rotate': 'mus_rotate.wav',
    'Drone': 'mus_drone.ogg', 'Fearsting': 'mus_fearsting.ogg', 'CineCut': 'mus_sfx_cinematiccut.wav',
    'Hero': 'snd_hero.wav', 'Save': 'snd_save.wav', 'HurtSmall': 'snd_hurtsmall.wav', 'Spooky': 'snd_spooky.wav',
    'Birds': 'mus_birdnoise.ogg', 'DoorClose': 'mus_doorclose.ogg', 'ElecDoor': 'snd_elecdoor_shutheavy.wav',
    'Wind': 'snd_fall.wav', 'SwordAppear': 'mus_sfx_a_swordappear.wav', 'Pullback': 'mus_sfx_a_pullback.wav',
    'LitHit': 'mus_sfx_a_lithit.wav', 'Bigdoor': 'snd_bigdoor_open.wav', 'Vaporized': 'snd_vaporized.wav',
    'Laz': 'snd_laz.wav', 'Escaped': 'snd_escaped.wav', 'Magic': 'snd_magicminer.wav', 'Orchhit': 'mus_f_orchhit.wav',
}
# sounds not in the stock pack: the ending's ring of friendliness pellets as they appear
SFX_EXTRA = {'PelletRing': 'asset/sfx_extra/pellet_ring.wav'}


def png_uri(img):
    b = io.BytesIO()
    img.save(b, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()


def main():
    bt = packed_js(ui_src())
    prev = packed_js(OUT) if os.path.exists(OUT) else {'sfx': {}}
    assets = dict(img={}, meta={}, sfx={}, size={})
    for k in UI_IMG:
        assets['img'][k] = bt['img'][k]
    for k in UI_META:
        assets['meta'][k] = bt['meta'][k]
    for k in UI_SFX:
        assets['sfx'][k] = bt['sfx'][k]

    for key, sheet in slice_sheet.SHEETS.items():
        cs, _ = slice_sheet.cells(sheet)
        for i, c in enumerate(cs):
            if not (c['cell'] or c['w'] * c['h'] > 60):
                continue
            img = Image.fromarray(c['img'])
            if img.getbbox() is None:
                continue
            assets['img'][f'{key}/{i}'] = png_uri(img)
            assets['size'][f'{key}/{i}'] = [img.width, img.height]

    with tempfile.TemporaryDirectory() as td:
        have_pack = os.path.isdir(SFXDIR)
        for key, fn in SFX.items():
            src_fn = os.path.join(SFXDIR, fn)
            if have_pack and os.path.isfile(src_fn):
                dst = os.path.join(td, key + '.mp3')
                subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src_fn, '-ac', '1', '-b:a', '96k', dst], check=True)
                assets['sfx'][key] = 'data:audio/mpeg;base64,' + base64.b64encode(open(dst, 'rb').read()).decode()
            elif key in prev.get('sfx', {}):
                assets['sfx'][key] = prev['sfx'][key]
            else:
                raise SystemExit(f'missing SFX {key}: unpack the UNDERTALE sound-effect pack into {SFXDIR}')
        for key, fn in SFX_EXTRA.items():
            dst = os.path.join(td, key + '.mp3')
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', fn, '-ac', '1', '-b:a', '96k', dst], check=True)
            assets['sfx'][key] = 'data:audio/mpeg;base64,' + base64.b64encode(open(dst, 'rb').read()).decode()

    with open(OUT, 'w') as f:
        f.write('// Generated by tools/import_assets.py (asset/ sheets + battle UI from c2-sans-fight) - do not edit.\n')
        f.write('window.MV_ASSETS = ')
        json.dump(assets, f, separators=(',', ':'))
        f.write(';\n')
    print('images', len(assets['img']), 'sounds', len(assets['sfx']), 'bytes', os.path.getsize(OUT))


if __name__ == '__main__':
    main()
