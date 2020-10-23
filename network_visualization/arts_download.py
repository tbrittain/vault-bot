import os
from pathlib import Path
import urllib.request as request


# TODO: consider whether any arts should be downloaded
# holding off on integrating these functions into the network analysis because they require an album art
# link attribute to download the arts from, and that would require going back to db.py and adding that
# attribute via db_retroactive_attribute_sync()

def get_artist_art(artist_id):
    results = auth.spotify.artist(artist_id)
    art = results['images'][0]['url']
    return art


def art_download(spotify_id, url):
    art_path = str(os.getcwd() + '/' + spotify_id + '.jpg')
    art_path.replace('\\', '/')
    art_path = Path(art_path)

    if art_path.is_file():  # introduce check to determine if art present, and if so, no need to re-download
        pass
    else:
        f = open(spotify_id + '.jpg', 'wb')  # TODO: use with open instead of just open
        f.write(request.urlopen(url=url).read())
        f.close()
