import spotipy
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
import time
from spotipy import SpotifyException
import db
import pandas as pd
import random
import math
from vb_utils import color_text, TerminalColors, logger

load_dotenv()
CLIENT_ID = os.getenv("SPOTIPY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIPY_CLIENT_SECRET")
REDIRECT_URI = os.getenv("SPOTIPY_REDIRECT_URI")

scope = "playlist-modify-public user-library-read"
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=CLIENT_ID,
                                               client_secret=CLIENT_SECRET,
                                               redirect_uri=REDIRECT_URI, scope=scope))


async def song_search(user_message):
    original_message = str(user_message)
    original_message = original_message.replace("'", "")  # clean up user message for spotify search
    original_message = original_message.replace('"', '')

    search_results = sp.search(q='track:' + original_message, type='track')
    # print(search_results['tracks']['items'])
    if len(search_results['tracks']['items']) > 0:
        track_results_string = "```"
        results_list = []
        counter = 1
        for item in search_results['tracks']['items']:
            artist = (item['album']['artists'][0]['name'])  # artist name
            album = (item['album']['name'])  # album name
            track = (item['name'])  # track name

            track_id = (item['id'])
            track_id_dic = {counter: track_id}
            results_list.append(track_id_dic)

            # https://stackoverflow.com/questions/44862112/how-can-i-send-an-embed-via-my-discord-bot-w-python
            # https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline-
            # artist_url = (item['album']['artists'][0]['external_urls']['spotify'])
            # album_url = (item['album']['external_urls']['spotify'])

            track_results_string += f'{counter}. "{track}" by {artist} from album "{album}"\n'
            counter += 1
        track_results_string += '```'
        return [track_results_string, results_list]
    else:
        return f'No Spotify tracks for query {original_message} found!'


async def add_to_playlist(song_id):
    existing_songs = await songs_in_dyn_playlist()
    if song_id in existing_songs:
        raise FileExistsError('Song already present in Dyn playist! Not adding duplicate ID.')
    else:
        song_id = [song_id, ]  # for whatever reason, spotipy input is a list
        sp.playlist_add_items('5YQHb5wt9d0hmShWNxjsTs', song_id)  # dynamic
        sp.playlist_add_items('4C6pU7YmbBUG8sFFk4eSXj', song_id)  # archive


async def songs_in_dyn_playlist():
    results = sp.playlist_items('5YQHb5wt9d0hmShWNxjsTs')  # dynamic playlist ID
    tracks = results['items']
    while results['next']:
        results = sp.next(results)
        tracks.extend(results['items'])

    tracks_in_playlist = {}
    for song in tracks:
        tracks_in_playlist[song['track']['id']] = song['track']['name']

    return tracks_in_playlist


async def convert_to_track_id(song_input):
    song = sp.track(track_id=song_input)
    logger.debug(color_text(message=f'Converted input {song_input} to {song["id"]}', color=TerminalColors.MAGENTA))

    return song['id']


async def convert_to_album_id(album_input):
    album = sp.album(album_id=album_input)
    print(album)
    logger.debug(color_text(message=f'Converted input {album_input} to {album["id"]}', color=TerminalColors.MAGENTA))


# cannot await this function since used with updating the json
def get_track_info(track_id, user):
    global track_info
    song = sp.track(track_id=track_id)

    try:
        track_info = {'artist': (song['artists'][0]['name']),
                      'song': (song['name']),
                      'album': (song['album']['name']),
                      'added_by': user,
                      'added_at': str(datetime.now()),
                      'song_length': (float(song['duration_ms']) / 60000),
                      'artist_id': song['artists'][0]['id']}

        audio_analysis = sp.audio_features(song['id'])[0]

        track_info['tempo'] = (audio_analysis['tempo'])
        track_info['danceability'] = (audio_analysis['danceability'])
        track_info['energy'] = (audio_analysis['energy'])
        track_info['loudness'] = (audio_analysis['loudness'])
        track_info['acousticness'] = (audio_analysis['acousticness'])
        track_info['instrumentalness'] = (audio_analysis['instrumentalness'])
        track_info['liveness'] = (audio_analysis['liveness'])
        track_info['valence'] = (audio_analysis['valence'])

    except IndexError:  # a track attribute did not exist, then just skip. happens occasionally when no artist found.
        pass

    return track_info


async def validate_song(track_id):
    try:
        song = sp.track(track_id=track_id)
        if int(song['duration_ms']) > 600000:  # catch if song greater than 600k ms (10 min)
            raise OverflowError('Track too long!')

    # never reached bc handled prior to reaching this function
    except SpotifyException:  # catch if user tries to add podcast episode to playlist
        raise ValueError('Cannot add podcast episode to playlist!')


def artist_genres(artist_id):
    # gotta reformat genres because some genres have apostrophes or are quotation strings vs apostrophe strings
    # and sql can only accept apostrophe varchars
    genres = sp.artist(artist_id)['genres']
    genres = str(genres)
    genres = genres.replace("'", "")
    genres = genres.replace('"', "")
    genres = genres.replace('[', "")
    genres = genres.replace(']', "")
    genres = genres.split(', ')

    return genres


# likely once a song added/songs purged
def playlist_genres(playlist_id):
    results = sp.playlist_items(playlist_id)  # dynamic playlist ID
    tracks = results['items']
    while results['next']:
        results = sp.next(results)
        tracks.extend(results['items'])

    artist_list = []
    for song in tracks:
        artist_list.append(song['track']['artists'][0]['id'])

    artist_genres = {}
    for artist in artist_list:
        artist_genres[artist] = sp.artist(artist)['genres']

    # make it so all genres from artists are taken into account
    total_genre_list = []
    for artist, artist_genres in artist_genres.items():
        for individual_genre in artist_genres:
            total_genre_list.append(individual_genre)

    genre_count = {}
    for genre in total_genre_list:
        try:
            if genre not in genre_count:
                genre_count[genre] = 1
            else:
                genre_count[genre] += 1
        except IndexError:  # some artists do not have a genre
            pass

    genre_count = {key: value for key, value in
                   sorted(genre_count.items(), key=lambda item: item[1], reverse=True)}

    return genre_count


def playlist_description_update(playlist_id, playlist_name):
    global desc
    genre_count_dict = playlist_genres(playlist_id)
    top_genres = {k: genre_count_dict[k] for k in list(genre_count_dict)[:10]}
    if playlist_name == 'dynamic':
        desc = 'This is a dynamic playlist, meaning that the songs ' \
               'are automagically purged by VaultBot after two weeks. '
    elif playlist_name == 'archive':
        desc = 'This playlist keeps all of the tracks that were added ' \
               'in the original Vault Community Playlist. '

    if len(top_genres) > 0:  # only adds genre details if there are actually artists in the playlist
        desc += 'Prominent genres include: '
        for genre, count in top_genres.items():
            desc += f'{genre}, '
        desc += 'and more!'

    description_length = len(desc)
    logger.debug(f'Updated length of playlist {playlist_name} description: {description_length}')

    if len(desc) < 300:  # need to ensure playlist description is 300 characters or fewer
        logger.debug(
            f'Playlist description length within valid range. Updating description of {playlist_name} playlist.')
        sp.playlist_change_details(playlist_id=playlist_id, description=desc)
    else:
        logger.warning(color_text(message=f'Description too long. Not updating {playlist_name} playlist description.',
                                  color=TerminalColors.FAIL))


def recommend_songs(weighted=False):
    artists = db.dyn_artists_artist_retrieve()
    artist_list = []

    # weighted in the sense that more probability of drawing random artists when artist list is not unique artists
    # but rather the artist to every corresponding song
    if not weighted:
        for artist in artists:
            if artist[0] not in artist_list:
                artist_list.append(artist[0])
    else:
        for artist in artists:
            artist_list.append(artist[0])

    random_artists = []
    while len(random_artists) < 5:
        artist = random.choice(list(artist_list))
        if artist not in random_artists:
            random_artists.append(artist)

    # inherent problem with spotipy recommendations: if you keep song limit = 1, it appears that the
    # probability of the recommended song being from one of the random artist is VERY high
    # the higher the song limit, the more variability in the recommendation, which seems more ideal
    # ie some artists who are not currently on the playlist are recommended

    song_info_columns = ['song_uri', 'artist', 'artist_id', 'song', 'song_url', 'preview_url', 'album_art']
    total_song_df = pd.DataFrame(columns=song_info_columns)

    while len(total_song_df) < 10:
        recommended_tracks = sp.recommendations(seed_artists=random_artists, limit=20)
        for track in recommended_tracks['tracks']:
            if track['artists'][0]['id'] not in artist_list:
                song_info = {
                    'song_uri': track['uri'],
                    'artist': track['artists'][0]['name'],
                    'artist_id': track['artists'][0]['id'],
                    'song': track['name'],
                    'song_url': track['external_urls']['spotify'],
                    'album_art': track['album']['images'][1]['url']
                }
                if track['preview_url'] is not None:
                    song_info['preview_url'] = track['preview_url']

                song_df = pd.DataFrame(song_info, index=[0])
                total_song_df = pd.concat([total_song_df, song_df], ignore_index=True)

    return total_song_df


async def expired_track_removal():
    results = sp.playlist_items(playlist_id='5YQHb5wt9d0hmShWNxjsTs')
    tracks = results['items']
    while results['next']:
        results = sp.next(results)
        tracks.extend(results['items'])

    track_list = []
    if len(tracks) > 0:
        for track in tracks:
            # date in YYYY-MM-DD format by default from Spotify
            added_at = track['added_at']
            added_at = added_at.split('T', 1)  # precision of the track removal is to the day, not to the hour
            added_at = added_at[0]
            track_dict = {track['track']['id']: added_at}

            track_list.append(track_dict)

    # TODO: consider creating list of tracks that were removed,
    #  then printing out that list rather than each one individually
    # iterates over tracks pulled from spotify and for each one, determines whether it needs to be removed from
    if len(track_list) > 0:
        logger.warning(color_text(message='Preparing to update track popularities and check for expired songs. '
                                          'Please do not exit the program during this time.',
                                  color=TerminalColors.FAIL))
        for track in track_list:
            # key is the track id
            for key, value in track.items():
                # updates popularity of tracks in dynamic playlist db
                db.popularity_update(track_id=key)
                date_split = value.split('-')
                time_difference = datetime.now() - datetime(year=int(date_split[0]),
                                                            month=int(date_split[1]),
                                                            day=int(date_split[2]))
                # song removal from dynamic playlist
                if time_difference > timedelta(days=14):  # set 2 weeks threshold for track removal
                    sp.playlist_remove_all_occurrences_of_items(playlist_id='5YQHb5wt9d0hmShWNxjsTs',
                                                                items=[key])
                    db.db_purge_stats(song_id=key)

                    logger.debug(color_text(message=f'Song {key} removed from playlist', color=TerminalColors.MAGENTA))
    logger.info('Track popularities updated and expired songs checked.')


def playlist_diversity_index(playlist_id):
    results = sp.playlist_items(playlist_id)
    tracks = results['items']
    while results['next']:
        results = sp.next(results)
        tracks.extend(results['items'])

    song_artists = []  # gather artists from songs
    for track in tracks:
        individual_song_artists = {}
        for artist in track['track']['artists']:
            individual_song_artists[artist['id']] = artist['name']
        song_artists.append(individual_song_artists)

    artist_song_tracker = {}  # count occurrences of each artist
    for song in song_artists:
        for artist_id, artist_name in song.items():
            if artist_id not in artist_song_tracker:
                artist_song_tracker[artist_id] = 1
            else:
                artist_song_tracker[artist_id] += 1

    df_list = []
    for artist, count in artist_song_tracker.items():
        artist_reformatted = {'artist_id': artist, 'count': count}
        df_list.append(artist_reformatted)

    total_artist_array = pd.DataFrame(df_list)
    # apply genres to each artist

    try:
        total_artist_array['genres'] = total_artist_array.apply(lambda row: sp.artist(row.artist_id)['genres'], axis=1)
    except AttributeError:
        logger.error(color_text(message="Playlist could not be accessed for PDI", color=TerminalColors.FAIL))

    # sum each artist count to each of the genres they belong to
    genre_count_tracker = {}
    for index, row in total_artist_array.iterrows():
        for genre in row['genres']:
            if genre not in genre_count_tracker:
                genre_count_tracker[genre] = row['count']
            else:
                genre_count_tracker[genre] += row['count']

    if len(genre_count_tracker) > 0:
        genre_count_tracker = {key: value for key, value in
                               sorted(genre_count_tracker.items(), key=lambda item: item[1], reverse=True)}

        # begin math part
        pdi_sum = 0
        for genre, count in genre_count_tracker.items():
            genre_calc = 1 + ((math.log(1 / count)) / 5)
            pdi_sum += genre_calc

        # below for diagnostics
        # print(f'Raw PDI sum before correcting for number of genres: {pdi_sum}')
        # print(f'Number of genres in of playlist: {len(genre_count_tracker)}')

        pdi_sum = pdi_sum / len(genre_count_tracker)
        return pdi_sum
    else:
        return 0


if __name__ == "__main__":
    song_recommendations = recommend_songs()
    choice = random.randint(0, 9)

    row = song_recommendations.loc[choice]
    print(row)
