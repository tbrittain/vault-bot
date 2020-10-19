import spotify_commands
import os
import urllib.request as request
from pathlib import Path
import db
import pandas as pd
# import feather


def get_artist_art(artist_id):
    results = spotify_commands.sp.artist(artist_id)

    # index of list determines artist image resolution (1 = highest, 3 = lowest)
    artist_art_url = results['images'][2]['url']
    yield artist_art_url

    yield results['name']


def art_download(artist_name, url):
    art_path = str(os.getcwd() + '/' + artist_name + '.jpg')
    art_path.replace('\\', '/')
    art_path = Path(art_path)

    if art_path.is_file():  # introduce check to determine if art present, and if so, no need to re-download
        pass
    else:
        f = open(artist_name + '.jpg', 'wb')  # TODO: use with open instead of just open
        f.write(request.urlopen(url=url).read())
        f.close()


def artist_arts(artist_id):

    artist_info = get_artist_art(artist_id=artist_id)

    artist_results = []
    for result in artist_info:
        artist_results.append(result)

    try:
        art_download(artist_name=artist_results[1], url=artist_results[0])
    except AttributeError:
        pass  # occasionally get this error: AttributeError: 'NoneType' object has no attribute 'timeout'
        # not sure if that means data was not retrieved from the url or not


# going to process genre data in python and write to a special .feather format
# which interconverts pandas dfs to R dfs and vice versa
# the feather file's contents will be determined by the content in dyn_artists SQL table
def dyn_artists_write_df():
    global song_id
    global song_name
    global artist_id
    global artist_name
    genre_data = db.dyn_artists_genre_retrieve()

    df_columns = ['Genre', 'Artist', 'Song', 'SongID']
    total_playlist_array = pd.DataFrame(columns=df_columns)
    pd.options.display.width = 0

    for song in genre_data:
        for attribute in enumerate(song):
            # 0 - song ID, 1 - song name, 2 - artist ID, 3 - artist name, 4 - genres
            if attribute[0] == 0:
                song_id = attribute[1]
            elif attribute[0] == 1:
                song_name = attribute[1]
            elif attribute[0] == 2:
                artist_id = attribute[1]
            elif attribute[0] == 3:
                artist_name = attribute[1]
            elif attribute[0] == 4:

                # artist assigned to each genre, and each song to its respective artist
                for genre in attribute[1]:
                    if genre:  # ensure genres present
                        song_genres = {
                            'Genre': genre,
                            'Artist': artist_name,
                            'Song': song_name,
                            'SongID': song_id
                        }
                        song_genre_array = pd.DataFrame(song_genres, index=[0])
                        total_playlist_array = pd.concat([total_playlist_array, song_genre_array], ignore_index=True)

    # ideally I want to be able to write this df to feather format, but my R feather package has been giving
    # me significant problems
    # feather.write_dataframe(df=total_playlist_array, dest='D:/Github/vault-bot/genre_output.feather')
    # using CSV output until i can figure out why my feather is not working
    total_playlist_array.to_csv('genre_output.csv', index=False)


if __name__ == "__main__":
    dyn_artists_write_df()

