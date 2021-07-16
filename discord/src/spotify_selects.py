from .db import DatabaseConnection
from .spotify_commands import sp
from .vb_utils import logger

party_playlist_id = "6ksVLVljYiEUpjSoDh8z0w"
top_50_playlist_id = "1b04aMKreEwigG4ivcZNJm"
chill_playlist_id = "65PiacgUM34qS9EtNgbr5r"
cheerful_playlist_id = "5gsgXQu45m0W06WkmWXQBY"
moody_playlist_id = "0jiEtmsU9wRGrAVf7O5YeT"


# TODO: figure out how to manually order tracks in the playlist
# TODO: vaultbot selects randomly selected genre
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


def aggregate_tracks(sql: str) -> list:
    conn = DatabaseConnection()
    tracks = conn.select_query_raw(sql=sql)
    conn.terminate()
    tracks = [x[0] for x in tracks]
    return tracks


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
        sp.playlist_add_items(playlist_id=playlist_id, items=aggregated_tracks)
    else:
        logger.debug("Skipping song addition, since no songs require removal")


if __name__ == "__main__":
    selects_playlists_coordinator()
