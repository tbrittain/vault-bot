import pandas as pd
import os
import time
import re
import arts_download


# instead of returning a pandas df, these functions should instead just insert each row directly
# into their respective postgresql table
def generate_network_edges(raw_output):
    network_features = {'Source', 'Target', 'Time Interval'}
    network_edges = pd.DataFrame(columns=network_features)
    pd.options.display.width = 0

    # c) song -> album
    song_df = raw_output[['song_id', 'album_id', 'added_at']].copy()
    song_df = song_df.rename(columns={'song_id': 'Source', 'album_id': 'Target', 'added_at': 'Time Interval'})
    song_df['Weight'] = 1.0  # initialize weight column as all songs are of equal weight
    network_edges = pd.concat([network_edges, song_df])  # add song_df to network_edges
    network_edges = network_edges.reindex(columns=['Source', 'Target', 'Time Interval', 'Weight'])

    album_weight_reference = song_df[['Target', 'Weight']]  # create df for counting weight in the album-artist and
    # artist-genre edges below
    album_weight_reference = album_weight_reference['Target'].value_counts()
    album_weight_reference = pd.DataFrame(album_weight_reference)
    album_weight_reference = album_weight_reference.reset_index()
    album_weight_reference = album_weight_reference.rename(columns={'Target': 'Weight', 'index': 'album_id'})

    # b) album -> artist
    raw_album_df = raw_output[['album_id', 'artist_id', 'added_at']].copy()
    reduced_albums = raw_album_df.drop_duplicates(subset=['album_id'])
    reduced_albums = pd.merge(reduced_albums, album_weight_reference, on='album_id', how='inner')  # adds album weights
    reduced_albums = reduced_albums.rename(
        columns={'album_id': 'Source', 'artist_id': 'Target', 'added_at': 'Time Interval'})
    network_edges = pd.concat([network_edges, reduced_albums])  # add reduced_albums to network_edges

    artist_weight_reference = reduced_albums[['Target', 'Weight']]  # create df for counting weight for artist-genre
    artist_weight_reference = pd.DataFrame(artist_weight_reference)
    artist_weight_reference = artist_weight_reference.rename(columns={'Target': 'Source'})
    artist_weight_reference = artist_weight_reference.groupby(['Source']).sum()  # sum album weights into artist weight
    artist_weight_reference = artist_weight_reference.reset_index()

    # a) artist -> genre
    raw_artist_df = raw_output[['artist', 'artist_id', 'added_at']].copy()  # copy only artist & id for new df
    reduced_artists = raw_artist_df.drop_duplicates(subset=['artist'])  # reduce to only uniques

    artist_ids = []  # extract artist ids for argument in spotipy artist function
    for index, row in reduced_artists.iterrows():
        artist_ids.extend([row['artist_id']])

    # TODO: no need to re-analyze genres, just use the ones present in csv genre output
    artist_genres = {}  # produce dictionary of artist id : genres
    for item in artist_ids:
        artist_genres[item] = auth.spotify.artist(item)['genres']

    pre_artist_df = []  # produce list of dictionaries for each artist id : genre combination
    for key, value in artist_genres.items():
        for genre in value:
            artist_genre_pair = {'artist_id': key, 'genre': genre}
            pre_artist_df.append(artist_genre_pair)

    artist_id_genre_df = pd.DataFrame(pre_artist_df)  # create dataframe using list of dictionaries made above
    artist_inner_join = pd.merge(reduced_artists, artist_id_genre_df, on='artist_id', how='inner')
    artist_inner_join = artist_inner_join.reindex(columns=['artist', 'genre', 'artist_id', 'added_at'])
    del artist_inner_join['artist']
    artist_inner_join = artist_inner_join.rename(columns={'artist_id': 'Source',
                                                          'genre': 'Target', 'added_at': 'Time Interval'})
    artist_inner_join = pd.merge(artist_inner_join, artist_weight_reference, on='Source', how='inner')  # adds artist
    # weights
    network_edges = pd.concat([network_edges, artist_inner_join])  # add inner_join to network_edges

    # network_edges = network_edges.reset_index(drop=True, inplace=True)

    return network_edges


def generate_network_nodes(raw_output, edge_output):
    """

    :param raw_output: Output from get_track_info or multiple_playlist_track_info
    :param edge_output: Output from generate_network_edges
    :param get_art: True to retrieve art hyperlink or download locally
    :return: Pandas DataFrame containing network nodes (ID, label, Song URI/genre link)
    """
    pd.options.display.width = 0
    edge_to_genre = edge_output[['Source', 'Target', 'Time Interval']].copy()  # create initial nodes df
    # interval_copy = network_nodes
    edge_to_genre = pd.concat([edge_to_genre['Source'], edge_to_genre['Target']])  # produced series from 2 dfs
    edge_to_genre = pd.DataFrame(edge_to_genre)  # convert back to df
    edge_to_genre = edge_to_genre.reset_index()
    del edge_to_genre['index']
    edge_to_genre.columns.values[0] = 'Id'  # renamed column based on index because it was being finicky
    edge_to_genre = edge_to_genre.drop_duplicates(subset=['Id'])
    edge_to_genre = edge_to_genre.reset_index()
    del edge_to_genre['index']

    # extract non-spotify ID genres into separate df
    row_list = []
    for index, row in edge_to_genre.iterrows():
        row_list.extend(row)
    genre_list = []
    for item in row_list:
        if item[0].isalpha():
            genre_list.append(item)
    genre_df = pd.DataFrame(genre_list)
    genre_df['Label'] = genre_df[0]
    genre_df.columns.values[0] = 'Id'

    # add EveryNoise link as genre URL attribute
    genre_url_list = []
    for index, row in genre_df.iterrows():
        genre = row['Id']
        genre = re.sub("[ \-&]", '', genre)  # removes [ -&] characters from genre name
        genre = re.sub("'", '', genre)
        link = f'http://everynoise.com/engenremap-{genre}.html'
        genre_url_dict = {'Id': row['Id'], 'URL': link}
        genre_url_list.append(genre_url_dict)
    genre_urls = pd.DataFrame(genre_url_list)
    genre_df = pd.merge(genre_df, genre_urls, on='Id')

    # adding label for identification of spotify IDs
    songs = raw_output[['song_id', 'song', 'song_uri']].copy()
    songs = songs.rename(columns={'song_id': 'Id', 'song': 'Label', 'song_uri': 'URL'})

    albums = raw_output[['album_id', 'album', 'album_uri']].copy()
    albums = albums.rename(columns={'album_id': 'Id', 'album': 'Label', 'album_uri': 'URL'})

    artists = raw_output[['artist_id', 'artist', 'artist_uri']].copy()
    artists = artists.rename(columns={'artist_id': 'Id', 'artist': 'Label', 'artist_uri': 'URL'})

    spotify_ids = pd.concat([songs, albums, artists])
    spotify_ids = spotify_ids.drop_duplicates(subset=['Id'])
    spotify_ids = spotify_ids.reset_index()
    del spotify_ids['index']

    network_nodes = pd.concat([spotify_ids, genre_df])
    network_nodes = network_nodes.reset_index()
    del network_nodes['index']


    # art_path_df = album_art_path_append(raw_output=raw_output)

    network_nodes = pd.merge(network_nodes, art_path_df, on='Id', how='left')

    # print(network_nodes)
    return network_nodes


def album_art_path_append(raw_output, download_bool):
    """

    :param raw_output: Output from get_track_info or multiple_playlist_track_info
    :param download_bool: True to download artist/album images (also depends on "Associate album arts to albums only,
    or to both albums and songs?" prompt: 'both' response for album art and artist art.
    :return: Pandas DataFrame with song/artist/album ID and local path to art)
    """
    pd.options.display.width = 0

    print('\nAssociate album arts to albums only, or to both albums and songs?')
    dl_choice = arts_download.user_input_parser(['album', 'both'])
    if dl_choice == 'album':
        album_img = raw_output[['album_id', 'art_link']].copy()
        album_img = album_img.rename(columns={'album_id': 'Id'})
        id_img = album_img

    else:
        artist_img = raw_output[['artist', 'artist_id']].copy()  # this path also downloads artist image
        artist_img = artist_img.drop_duplicates(subset=['artist_id'])
        artist_img_list = []

        for index, row in artist_img.iterrows():
            if row[0].isalpha and len(row) != 22:  # criteria to isolate artist_id rows from artist rows
                try:
                    artist_img_dict = {'Id': row['artist_id'],
                                       'art_link': arts_download.get_artist_art(row['artist_id'])}
                    artist_img_list.append(artist_img_dict)
                except IndexError:  # handles in case no artist image available
                    pass

        artist_img_links = pd.DataFrame(artist_img_list)
        artist_img = artist_img.rename(columns={'artist_id': 'Id'})
        artist_img = pd.merge(artist_img, artist_img_links, on='Id')
        del artist_img['artist']

        song_img = raw_output[['song_id', 'art_link']].copy()
        song_img = song_img.rename(columns={'song_id': 'Id'})

        album_img = raw_output[['album_id', 'art_link']].copy()
        album_img = album_img.rename(columns={'album_id': 'Id'})

        id_img = pd.concat([song_img, album_img, artist_img])
        id_img = id_img.query('Id != "Various Artists"')  # gets rid of pesky Various Artists

    id_img = id_img.drop_duplicates(subset=['Id'])
    # adds .jpeg to end of URL. this actually breaks the link
    # for index, row in id_img.iterrows():
    #     row['art_link'] = row['art_link'].replace(row['art_link'], row['art_link']+'.jpeg')
    #     print(row['art_link'])

    art_retrieval_time = time.time()
    path_list = []
    if download_bool:
        try:
            os.mkdir('album_arts')  # tries to make new album art directory
        except FileExistsError:  # fails because already exists
            pass
        outer = tqdm(desc='Art download', unit='images', total=len(id_img), leave=True)
        os.chdir('album_arts')  # change directory here, not inside for loop. was causing an error
        for index, row in id_img.iterrows():
            path_dict = {}
            try:
                arts_download.art_download(spotify_id=row['Id'], url=row['art_link'])
            except AttributeError:
                pass  # occasionally get this error: AttributeError: 'NoneType' object has no attribute 'timeout'
                # not sure if that means data was not retrieved from the url or not

            path_dict['Id'] = row['Id']
            path_dict['image'] = ('album_arts/' + row['Id'] + '.jpg')  # added album art directory as root
            path_list.append(path_dict)
            outer.update(1)

        process_time = round(time.time() - art_retrieval_time, 2)
        if process_time > 60:  # prints minutes and seconds if process time longer than a minute
            minutes = int(round(process_time / 60, 0))
            seconds = round(process_time % 60, 0)
            print(f'\nOverall art retrieval succeeded in {minutes} minutes and {seconds} seconds')
        else:
            print(f'\nOverall art retrieval succeeded in {process_time} seconds')

        path_df = pd.DataFrame(path_list)
    else:
        id_img = id_img.rename(columns={'art_link': 'image'})  # does not download art
        path_df = id_img

    return path_df
