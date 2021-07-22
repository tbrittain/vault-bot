from .db import DatabaseConnection
from .spotify_commands import sp
from .vb_utils import logger
import random
from datetime import datetime, timedelta
from dateutil import tz

party_playlist_id = "6ksVLVljYiEUpjSoDh8z0w"
top_50_playlist_id = "1b04aMKreEwigG4ivcZNJm"
chill_playlist_id = "65PiacgUM34qS9EtNgbr5r"
cheerful_playlist_id = "5gsgXQu45m0W06WkmWXQBY"
moody_playlist_id = "0jiEtmsU9wRGrAVf7O5YeT"
genre_playlist_id = "5MDgnMXhfdmxpsCfHz1ioL"


# TODO: figure out how to manually order tracks in the playlist
def selects_playlists_coordinator():
    party_playlist_sql = """SELECT songs.id, COUNT(archive.song_id) FROM songs JOIN archive ON songs.id = 
    archive.song_id JOIN artists ON songs.artist_id = artists.id JOIN artists_genres ON artists.id = 
    artists_genres.artist_id WHERE artists_genres.genre = ANY('{hip hop, pop rap, rap, edm, house, 
    tropical house, uk dance, turntablism, pop, filter house, vapor twitch, dance-punk, bass house, 
    electronic trap, electro house, bass music, australian electropop, la pop, metropopolis, pop edm}') AND 
    songs.danceability > 0.6 AND songs.energy > 0.5 AND songs.length < 4.33 AND songs.tempo > 105 GROUP BY 
    songs.name, songs.id ORDER BY COUNT(archive.song_id) DESC LIMIT 100;"""

    top_50_playlist_sql = """SELECT songs.id, COUNT(archive.song_id) FROM songs JOIN archive 
    ON songs.id = archive.song_id GROUP BY songs.name, songs.id ORDER BY COUNT(archive.song_id) DESC 
    LIMIT 50;"""

    chill_playlist_sql = """SELECT songs.id, COUNT(archive.song_id) FROM songs JOIN archive ON songs.id = 
    archive.song_id WHERE songs.energy < 0.35 AND songs.acousticness > 0.1 GROUP BY songs.name, songs.id ORDER BY 
    COUNT(archive.song_id) DESC LIMIT 100;"""

    cheerful_playlist_sql = """SELECT songs.id, COUNT(archive.song_id) FROM songs JOIN archive ON songs.id 
    = archive.song_id WHERE songs.valence > 0.9 GROUP BY songs.name, songs.id ORDER BY COUNT(archive.song_id) DESC 
    LIMIT 100;"""

    moody_playlist_sql = """SELECT songs.id, COUNT(archive.song_id) FROM songs JOIN archive ON songs.id 
    = archive.song_id WHERE songs.valence < 0.1 GROUP BY songs.name, songs.id ORDER BY COUNT(archive.song_id) DESC 
    LIMIT 100;"""

    genres = get_viable_genres()
    selected_genre = random.choice(genres)

    genre_playlist_sql = f"""SELECT songs.id FROM songs JOIN artists ON songs.artist_id = artists.id
    JOIN artists_genres ON artists_genres.artist_id = artists.id WHERE artists_genres.genre = '{selected_genre}';"""

    logger.info(f"Updating aggregate playlist Party (id: {party_playlist_id})")
    update_playlist(playlist_id=party_playlist_id, playlist_sql=party_playlist_sql)

    logger.info(f"Updating aggregate playlist Top 50 (id: {top_50_playlist_id})")
    update_playlist(playlist_id=top_50_playlist_id, playlist_sql=top_50_playlist_sql)

    logger.info(f"Updating aggregate playlist Chill (id: {chill_playlist_id})")
    update_playlist(playlist_id=chill_playlist_id, playlist_sql=chill_playlist_sql)

    logger.info(f"Updating aggregate playlist Cheerful (id: {cheerful_playlist_id})")
    update_playlist(playlist_id=cheerful_playlist_id, playlist_sql=cheerful_playlist_sql)

    logger.info(f"Updating aggregate playlist Moody (id: {moody_playlist_id})")
    update_playlist(playlist_id=moody_playlist_id, playlist_sql=moody_playlist_sql)

    logger.info(f"Updating aggregate playlist Genre (id: {genre_playlist_id})")

    # formatting time for display in genre playlist description
    from_timezone = tz.gettz('UTC')
    local_timezone = tz.gettz('America/Chicago')

    utc = datetime.utcnow()
    utc = utc.replace(tzinfo=from_timezone)
    cst = utc.astimezone(tz=local_timezone)
    cst = cst + timedelta(hours=12)

    weekday = cst.strftime("%A")
    day = cst.strftime("%B %d")
    time = cst.strftime("%H:%M %Z")

    time_formatted = f'{weekday}, {day} at {time}'

    description = f"A randomly selected genre tracked by VaultBot. " \
                  f"Currently: {str.title(selected_genre)}. Next update: {time_formatted}"

    sp.playlist_change_details(playlist_id=genre_playlist_id, description=description)
    update_playlist(playlist_id=genre_playlist_id, playlist_sql=genre_playlist_sql)


def aggregate_tracks(sql: str) -> list:
    """
    @param sql: Raw SQL to execute
    @return: List of track IDs
    """
    conn = DatabaseConnection()
    tracks = conn.select_query_raw(sql=sql)
    conn.terminate()
    return [x[0] for x in tracks]


def array_chunks(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]


def update_playlist(playlist_id: str, playlist_sql: str):
    # pull existing tracks
    existing_tracks = sp.playlist_items(playlist_id=playlist_id)
    if existing_tracks['total'] > 0:
        existing_tracks = existing_tracks['items']
        existing_tracks = [track['track']['id'] for track in existing_tracks]
    else:
        existing_tracks = None

    # compare existing tracks with aggregated tracks from playlist,
    # and remove existing track if not present in aggregate
    aggregated_tracks = aggregate_tracks(sql=playlist_sql)
    tracks_to_remove = []
    if existing_tracks is not None:
        for track_id in existing_tracks:
            if track_id not in aggregated_tracks:
                tracks_to_remove.append(track_id)

    if len(tracks_to_remove) > 0:
        logger.debug(f"Removing {len(tracks_to_remove)} tracks from playlist")
        if len(tracks_to_remove) > 100:
            logger.debug(f"Splitting tracks into chunks of 100")
            chunked_tracks_to_remove = list(array_chunks(tracks_to_remove, 100))
            for chunked_list in chunked_tracks_to_remove:
                logger.debug(f"Removing {len(chunked_list)} tracks")
                sp.playlist_remove_all_occurrences_of_items(playlist_id=playlist_id,
                                                            items=chunked_list)
        else:
            sp.playlist_remove_all_occurrences_of_items(playlist_id=playlist_id,
                                                        items=tracks_to_remove)
    else:
        logger.debug("No tracks require removal from playlist")

    # isolated aggregated tracks to only those that do not already exist in playlist
    # then only add those
    if existing_tracks is not None:
        for track_id in existing_tracks:
            try:
                aggregated_tracks.remove(track_id)
            except ValueError:  # track_id not present in aggregated_tracks
                pass
    # ensure that if no deletion occurred, no tracks are added

    if len(aggregated_tracks) > 0:
        logger.debug(f"Adding {len(aggregated_tracks)} replacement tracks to playlist")
        if len(aggregated_tracks) > 100:  # max 100 songs per request
            logger.debug(f"Splitting tracks into chunks of 100")
            chunked_aggregated_tracks = list(array_chunks(aggregated_tracks, 100))
            for chunked_list in chunked_aggregated_tracks:
                logger.debug(f"Adding {len(chunked_list)} tracks")
                sp.playlist_add_items(playlist_id=playlist_id, items=chunked_list)
        else:
            sp.playlist_add_items(playlist_id=playlist_id, items=aggregated_tracks)
    else:
        logger.debug("Skipping song addition since no songs require removal")


def get_viable_genres() -> list:
    """
    Retrieves genres containing a minimum of 20 songs from 4+ artists
    """
    conn = DatabaseConnection()
    sql = """SELECT artists_genres.genre, COUNT(songs.id) FROM songs JOIN artists ON songs.artist_id = artists.id
    JOIN artists_genres ON artists_genres.artist_id = artists.id GROUP BY artists_genres.genre
    HAVING COUNT(songs.id) >= 20 AND COUNT(DISTINCT artists.id) >= 4 ORDER BY COUNT(songs.id) DESC;"""

    genres = conn.select_query_raw(sql=sql)
    return [x[0] for x in genres]


if __name__ == "__main__":
    pass
