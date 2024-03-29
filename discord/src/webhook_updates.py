from datetime import datetime, timedelta
from os import getenv, path

from discord_webhook import DiscordWebhook, DiscordEmbed

from .database_connection import DatabaseConnection
from .vb_utils import access_secret_version, get_logger

base_dir = path.dirname(path.dirname(path.abspath(__file__)))
logger = get_logger(__name__)
environment = getenv("ENVIRONMENT")
if environment == "dev":
    WEBHOOK_URL = getenv('UPDATES_WEBHOOK')

    if not WEBHOOK_URL:
        logger.fatal("No webhook URL found. Please set UPDATES_WEBHOOK environment variable.", exc_info=True)
        exit(1)
elif environment == "prod":
    project_id = getenv("GOOGLE_CLOUD_PROJECT_ID")
    WEBHOOK_URL = access_secret_version(secret_id='vb-updates-webhook',
                                        project_id=project_id)


def get_daily_stats() -> dict:
    playlist_data = {}
    conn = DatabaseConnection()

    # short circuit if there is no data to process
    num_tracks_total = conn.select_query(query_literal="COUNT(*)", table="songs")
    if num_tracks_total[0][0] == 0:
        return playlist_data

    # pull number of tracks in dynamic
    num_tracks_dynamic = conn.select_query(query_literal="COUNT(*)", table="dynamic")
    playlist_data['num_tracks'] = num_tracks_dynamic[0][0]

    # pull number of tracks added in the last day
    current_date = datetime.utcnow()
    date_format = "%Y-%m-%d %H:%M:%S"

    tracks_added_sql = f"""
    SELECT COUNT(*)
    FROM dynamic
    WHERE added_at BETWEEN now() - interval '1 day' AND now();
    """
    tracks_added = conn.select_query_raw(sql=tracks_added_sql)
    playlist_data['tracks_added_today'] = tracks_added[0][0]

    # pull number of tracks soon-to-expire tracks
    expiration_date = current_date - timedelta(days=13)
    expiration_date = expiration_date.replace(hour=0, minute=0, second=0, microsecond=0)
    day_before_expiration = expiration_date + timedelta(days=1)

    tracks_to_remove_sql = f"""
    SELECT COUNT(*)
    FROM dynamic
    WHERE added_at BETWEEN '{expiration_date.strftime(date_format)}'
    AND '{day_before_expiration.strftime(date_format)}';
    """

    tracks_to_remove = conn.select_query_raw(sql=tracks_to_remove_sql)
    playlist_data['tracks_to_remove'] = tracks_to_remove[0][0]

    # pull novel tracks
    novel_tracks_sql = f"""
    WITH songs_added_today AS (
        SELECT songs.name AS name, songs.id AS id
        FROM songs
            JOIN archive ON archive.song_id = songs.id
        WHERE archive.added_at BETWEEN now() - INTERVAL '1 day' AND now()
        )
    SELECT songs_added_today.name, songs_added_today.id
    FROM songs_added_today
        JOIN archive ON songs_added_today.id = archive.song_id
    GROUP BY songs_added_today.name, songs_added_today.id
    HAVING COUNT(archive.song_id) = 1;
    """
    novel_tracks = conn.select_query_raw(sql=novel_tracks_sql)
    playlist_data['novel_tracks_added'] = len(novel_tracks)

    # pull genres and isolate novel ones
    genres_added_today_sql = f"""
    SELECT DISTINCT g.name
    FROM genres g
        JOIN artists_genres ag on g.id = ag.genre_id
        JOIN artists_songs "as" ON "as".artist_id = ag.artist_id
        JOIN archive a ON a.song_id = "as".song_id
    WHERE a.added_at BETWEEN now() - INTERVAL '1 day' AND now();
    """

    genres_added_today = conn.select_query_raw(sql=genres_added_today_sql)
    genres_added_today = [x[0] for x in genres_added_today]

    genres_before_today_sql = f"""
    SELECT DISTINCT g.name
    FROM genres g
        JOIN artists_genres ag on g.id = ag.genre_id
            JOIN artists_songs "as" ON "as".artist_id = ag.artist_id
            JOIN archive a ON a.song_id = "as".song_id
    WHERE a.added_at < now() - INTERVAL '1 day';
    """
    genres_before_today = conn.select_query_raw(sql=genres_before_today_sql)
    genres_before_today = [x[0] for x in genres_before_today]

    novel_genres = []
    for genre in genres_added_today:
        if genre not in genres_before_today:
            novel_genres.append(genre)
    playlist_data['novel_genres'] = ''.join(str(e) + ', ' for e in novel_genres)

    # pull artists and isolate novel ones
    artists_added_today_sql = f"""
    SELECT DISTINCT artists.name AS name
    FROM artists
            JOIN artists_songs ON artists_songs.artist_id = artists.id
            JOIN archive ON archive.song_id = artists_songs.song_id
    WHERE archive.added_at BETWEEN now() - INTERVAL '1 day' AND now();
    """
    artists_added_today = conn.select_query_raw(sql=artists_added_today_sql)
    artists_added_today = [x[0] for x in artists_added_today]

    artists_before_today_sql = f"""
    SELECT DISTINCT artists.name AS name
    FROM artists
            JOIN artists_songs ON artists_songs.artist_id = artists.id
            JOIN archive ON archive.song_id = artists_songs.song_id
    WHERE archive.added_at < now() - INTERVAL '1 day';
    """
    artists_before_today = conn.select_query_raw(sql=artists_before_today_sql)
    artists_before_today = [x[0] for x in artists_before_today]

    novel_artists = []
    for artist in artists_added_today:
        if artist not in artists_before_today:
            novel_artists.append(artist)
    playlist_data['novel_artists'] = ''.join(str(e) + ', ' for e in novel_artists)

    conn.terminate()
    return playlist_data


def post_webhook():
    playlist_data = get_daily_stats()
    if len(playlist_data.keys()) == 0:
        return

    embed = DiscordEmbed(title='VaultBot Daily Stat Overview',
                         color='BCE7FD')
    embed.set_timestamp()

    embed.add_embed_field(
        name='Total number of tracks',
        value=playlist_data['num_tracks'],
        inline=False
    )
    embed.add_embed_field(
        name='Tracks added today',
        value=playlist_data['tracks_added_today'],
        inline=False
    )
    embed.add_embed_field(
        name='Tracks to be purged',
        value=playlist_data['tracks_to_remove'],
        inline=False
    )
    if playlist_data['novel_genres']:
        embed.add_embed_field(
            name='New genres',
            value=playlist_data['novel_genres'],
            inline=False
        )
    if playlist_data['novel_artists']:
        embed.add_embed_field(
            name='New artists',
            value=playlist_data['novel_artists'],
            inline=False
        )

    webhook = DiscordWebhook(url=WEBHOOK_URL)
    webhook.add_embed(embed)
    webhook.execute()
